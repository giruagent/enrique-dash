export function midiToFrequency(midi) {
  return 440 * (2 ** ((midi - 69) / 12));
}

export function noteAtDegree(rootMidi, scale, degree) {
  const octave = Math.floor(degree / scale.length);
  const index = ((degree % scale.length) + scale.length) % scale.length;
  return rootMidi + scale[index] + octave * 12;
}

export function beatDurationSeconds(bpm) {
  return 60 / bpm / 4;
}

const lookaheadMs = 25;
const scheduleAheadSeconds = .12;
const maxScheduledStepsPerTick = 8;
const resyncThresholdSeconds = .1;
const resyncLeadSeconds = .05;

/**
 * Decide which steps to schedule for this tick.
 *
 * After a suspended AudioContext (system interruption, iOS call, pause) `nextStepAt`
 * sits in the past. Scheduling the whole backlog at once would emit every missed
 * note simultaneously, so a stale cursor resyncs to "now" instead.
 *
 * @param {{ currentTime:number, nextStepAt:number, bpm:number,
 *           lookAhead?:number, maxSteps?:number }} input
 * @returns {{ times:number[], nextStepAt:number, resynced:boolean }}
 */
export function planScheduleWindow({
  currentTime,
  nextStepAt,
  bpm,
  lookAhead = scheduleAheadSeconds,
  maxSteps = maxScheduledStepsPerTick,
}) {
  const beat = beatDurationSeconds(bpm);
  const resynced = nextStepAt < currentTime - resyncThresholdSeconds;
  let cursor = resynced ? currentTime + resyncLeadSeconds : nextStepAt;
  const times = [];
  while (cursor < currentTime + lookAhead && times.length < maxSteps) {
    times.push(cursor);
    cursor += beat;
  }
  return { times, nextStepAt: cursor, resynced };
}

export class MusicEngine {
  constructor() {
    this.context = null;
    this.master = null;
    this.delay = null;
    this.delayFeedback = null;
    this.delayWet = null;
    this.compressor = null;
    this.noise = null;
    this.timer = null;
    this.suspendTimer = null;
    this.track = null;
    this.desired = false;
    this.resumeAttempts = 0;
    this.step = 0;
    this.nextStepAt = 0;
    this.generation = 0;
  }

  async start(track) {
    clearTimeout(this.suspendTimer);
    this.suspendTimer = null;
    this.desired = true;
    this.resumeAttempts = 0;
    this.track = track;
    const generation = ++this.generation;
    if (!this.context) this.createAudioGraph();
    if (!this.context) return false;
    if (this.context.state !== 'running') {
      try {
        await this.context.resume();
      } catch {
        // The scheduler keeps retrying if the browser rejects a resume attempt.
      }
    }
    if (generation !== this.generation || !this.desired) return false;
    const running = this.context.state === 'running';
    this.master.gain.cancelScheduledValues(this.context.currentTime);
    this.master.gain.setTargetAtTime(.72, this.context.currentTime, .08);
    if (this.timer) clearInterval(this.timer);
    this.step = 0;
    this.nextStepAt = this.context.currentTime + .08;
    this.timer = setInterval(() => this.scheduleAhead(), lookaheadMs);
    return running;
  }

  createAudioGraph() {
    const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextConstructor) return;
    try {
      this.context = new AudioContextConstructor();
      this.context.addEventListener('statechange', () => {
        if (this.context.state !== 'running' || !this.track || !this.desired) return;
        this.nextStepAt = this.context.currentTime + .08;
        if (!this.timer) this.timer = setInterval(() => this.scheduleAhead(), lookaheadMs);
      });
      this.master = this.context.createGain();
      this.master.gain.value = 0;
      this.compressor = this.context.createDynamicsCompressor();
      this.compressor.threshold.value = -18;
      this.compressor.knee.value = 18;
      this.compressor.ratio.value = 3;
      this.compressor.attack.value = .004;
      this.compressor.release.value = .18;
      this.master.connect(this.compressor).connect(this.context.destination);
      this.delay = this.context.createDelay(.6);
      this.delay.delayTime.value = .22;
      this.delayFeedback = this.context.createGain();
      this.delayFeedback.gain.value = .18;
      this.delayWet = this.context.createGain();
      this.delayWet.gain.value = .16;
      this.delay.connect(this.delayFeedback).connect(this.delay);
      this.delay.connect(this.delayWet).connect(this.master);
      this.noise = this.createNoiseBuffer();
    } catch (error) {
      console.warn('Music could not initialize in this browser.', error);
      this.context = null;
    }
  }

  createNoiseBuffer() {
    const length = Math.floor(this.context.sampleRate * .5);
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
  }

  scheduleAhead() {
    if (!this.context || !this.track || !this.desired) return;
    if (this.context.state !== 'running') {
      // Retry eagerly at first, then back off: a suspended context would otherwise get
      // forty resume() calls a second, each one logging a browser warning.
      this.resumeAttempts++;
      if (this.resumeAttempts <= 3 || this.resumeAttempts % 20 === 0) {
        void this.context.resume().catch(() => {});
      }
      return;
    }
    this.resumeAttempts = 0;
    const plan = planScheduleWindow({
      currentTime: this.context.currentTime,
      nextStepAt: this.nextStepAt,
      bpm: this.track.bpm,
    });
    for (const time of plan.times) {
      this.scheduleStep(this.step, time);
      this.step++;
    }
    this.nextStepAt = plan.nextStepAt;
  }

  scheduleStep(step, time) {
    const track = this.track;
    const barStep = step % 16;
    const bar = Math.floor(step / 16);
    const chordRoot = track.progression[bar % track.progression.length];

    if (barStep === 0 || barStep === 8) this.kick(time, barStep === 0 ? .16 : .12);
    if (barStep === 4 || barStep === 12) this.snare(time);
    if (barStep % 2 === 0) this.hat(time, barStep % 4 === 0 ? .026 : .016);

    if (barStep % 4 === 0) {
      const bassDegree = chordRoot + [0, 0, 2, 1][barStep / 4];
      this.voice('triangle', noteAtDegree(track.root - 12, track.scale, bassDegree), time, .19, .12, 700);
    }

    if (barStep === 0) {
      for (const interval of [0, 2, 4]) {
        this.voice('sine', noteAtDegree(track.root, track.scale, chordRoot + interval), time, .9, .024, 1800, true);
      }
    }

    const melodyDegree = track.motif[barStep];
    if (melodyDegree !== null && melodyDegree !== undefined) {
      const octaveShift = bar % 4 === 3 ? 24 : 12;
      this.lead(noteAtDegree(track.root + octaveShift, track.scale, melodyDegree), time, Math.max(.1, beatDurationSeconds(track.bpm) * 1.7));
    }
  }

  voice(type, midi, time, duration, volume, cutoff, softAttack = false) {
    const oscillator = this.context.createOscillator();
    const filter = this.context.createBiquadFilter();
    const envelope = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(midiToFrequency(midi), time);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(cutoff, time);
    envelope.gain.setValueAtTime(.0001, time);
    envelope.gain.exponentialRampToValueAtTime(volume, time + (softAttack ? .16 : .008));
    envelope.gain.exponentialRampToValueAtTime(.0001, time + duration);
    oscillator.connect(filter).connect(envelope).connect(this.master);
    if (softAttack) envelope.connect(this.delay);
    oscillator.start(time);
    oscillator.stop(time + duration + .02);
    oscillator.onended = () => {
      oscillator.disconnect();
      filter.disconnect();
      envelope.disconnect();
    };
  }

  lead(midi, time, duration) {
    const oscillator = this.context.createOscillator();
    const filter = this.context.createBiquadFilter();
    const envelope = this.context.createGain();
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(midiToFrequency(midi), time);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2600, time);
    envelope.gain.setValueAtTime(.0001, time);
    envelope.gain.exponentialRampToValueAtTime(.075, time + .012);
    envelope.gain.exponentialRampToValueAtTime(.0001, time + duration);
    oscillator.connect(filter).connect(envelope).connect(this.master);
    envelope.connect(this.delay);
    oscillator.start(time);
    oscillator.stop(time + duration + .02);
    oscillator.onended = () => {
      oscillator.disconnect();
      filter.disconnect();
      envelope.disconnect();
    };
  }

  kick(time, volume) {
    const oscillator = this.context.createOscillator();
    const envelope = this.context.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(135, time);
    oscillator.frequency.exponentialRampToValueAtTime(42, time + .12);
    envelope.gain.setValueAtTime(volume, time);
    envelope.gain.exponentialRampToValueAtTime(.0001, time + .18);
    oscillator.connect(envelope).connect(this.master);
    oscillator.start(time);
    oscillator.stop(time + .2);
    oscillator.onended = () => { oscillator.disconnect(); envelope.disconnect(); };
  }

  snare(time) {
    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const envelope = this.context.createGain();
    source.buffer = this.noise;
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1500, time);
    envelope.gain.setValueAtTime(.07, time);
    envelope.gain.exponentialRampToValueAtTime(.0001, time + .13);
    source.connect(filter).connect(envelope).connect(this.master);
    source.start(time);
    source.stop(time + .14);
    source.onended = () => { source.disconnect(); filter.disconnect(); envelope.disconnect(); };
  }

  hat(time, volume) {
    const source = this.context.createBufferSource();
    const filter = this.context.createBiquadFilter();
    const envelope = this.context.createGain();
    source.buffer = this.noise;
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7200, time);
    envelope.gain.setValueAtTime(volume, time);
    envelope.gain.exponentialRampToValueAtTime(.0001, time + .045);
    source.connect(filter).connect(envelope).connect(this.master);
    source.start(time);
    source.stop(time + .05);
    source.onended = () => { source.disconnect(); filter.disconnect(); envelope.disconnect(); };
  }

  async stop() {
    clearTimeout(this.suspendTimer);
    this.suspendTimer = null;
    this.desired = false;
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    if (!this.context || this.context.state === 'closed') return;
    const context = this.context;
    const generation = ++this.generation;
    this.master.gain.cancelScheduledValues(context.currentTime);
    this.master.gain.setTargetAtTime(.0001, context.currentTime, .07);
    this.suspendTimer = setTimeout(() => {
      if (generation !== this.generation) return;
      this.suspendTimer = null;
      if (!this.desired && !this.timer && context.state === 'running') void context.suspend();
    }, 450);
  }
}
