// Procedural sound effects. This module is pure data + Web Audio scheduling: no DOM, no samples and
// no network. Every cue goes through its own master GainNode routed into the caller's destination,
// so it can never touch the music graph.
import { midiToFrequency, noteAtDegree } from './music.js';

const DEFAULT_SCALE = Object.freeze([0, 2, 4, 7, 9]);
const ROOT_MIDI = 72;
const STREAK_WINDOW_SECONDS = 1.4;
const MAX_VOICES = 6;
const MAX_CUE_SECONDS = .35;
const MAX_VOICE_GAIN = .25;
const SILENCE = .0001;

function clampScale(scale) {
  return Array.isArray(scale) && scale.length > 0 ? scale : DEFAULT_SCALE;
}

/**
 * The degree a shard chime should play, walked up the course scale by the consecutive-pickup
 * streak. Streaks 0–3 climb degrees 0–3; the fifth pickup (streak 4) lands on degree 0 one
 * octave up. `collected` is accepted for call-site symmetry with the HUD count and never changes
 * the note: a lone shard always rings degree 0.
 */
export function shardChimeDegree(collected, streak, scale) {
  const ladder = clampScale(scale);
  const step = Number.isFinite(streak) ? Math.max(0, Math.min(4, Math.floor(streak))) : 0;
  return step === 4 ? ladder.length : step;
}

/**
 * Consecutive shard count inside a 1.4 s window. The first pickup in a run passes `previousStreak`
 * 0 with an infinite elapsed time and returns 0; each pickup inside the window adds one, capped at
 * the fifth (streak 4), and a gap longer than the window restarts the run at 0.
 */
export function nextStreak(previousStreak, elapsedSeconds) {
  const previous = Number.isFinite(previousStreak)
    ? Math.max(0, Math.min(4, Math.floor(previousStreak)))
    : 0;
  if (!Number.isFinite(elapsedSeconds) || elapsedSeconds > STREAK_WINDOW_SECONDS) return 0;
  return Math.min(4, previous + 1);
}

/**
 * Build a small SFX engine over an existing AudioContext.
 *
 * @param {object} options
 * @param {AudioContext} options.context
 * @param {AudioNode} [options.destination]
 * @param {number|(() => number)} [options.now]
 * @param {boolean} [options.reducedMotion] accepted so callers can share one preference object
 * @param {(entry: object) => void} [options.onSchedule] optional debug/log hook
 */
export function createSfxEngine({
  context,
  destination,
  now,
  reducedMotion = false,
  onSchedule = null,
  masterGain = .5,
} = {}) {
  const voices = [];
  let enabled = true;
  let noiseBuffer = null;

  const clock = typeof now === 'function'
    ? now
    : typeof now === 'number'
      ? () => now
      : () => context?.currentTime ?? 0;

  if (!context) {
    return {
      play: () => false,
      setEnabled: () => {},
      isEnabled: () => false,
      activeVoiceCount: () => 0,
      dispose: () => {},
      master: null,
      voiceLimit: MAX_VOICES,
      maxCueSeconds: MAX_CUE_SECONDS,
      maxVoiceGain: MAX_VOICE_GAIN,
    };
  }

  const master = context.createGain();
  master.gain.value = Number.isFinite(masterGain)
    ? Math.max(0, Math.min(1, masterGain))
    : .5;
  master.connect(destination ?? context.destination);

  function pruneVoices(time) {
    for (let index = voices.length - 1; index >= 0; index--) {
      if (voices[index].endsAt <= time) voices.splice(index, 1);
    }
  }

  function envelope(time, duration, volume, attack = .008) {
    const gain = context.createGain();
    const peak = Math.min(MAX_VOICE_GAIN, Math.max(SILENCE, Number.isFinite(volume) ? volume : .1));
    const safeDuration = Math.min(MAX_CUE_SECONDS, Math.max(.02, duration));
    const attackSeconds = Math.min(Math.max(.001, attack), safeDuration * .4);
    gain.gain.setValueAtTime(SILENCE, time);
    gain.gain.exponentialRampToValueAtTime(peak, time + attackSeconds);
    gain.gain.exponentialRampToValueAtTime(SILENCE, time + safeDuration);
    gain.connect(master);
    return { gain, end: time + safeDuration };
  }

  function tone({
    type = 'sine',
    frequency = 440,
    endFrequency = null,
    time,
    duration,
    volume,
    attack,
    filterType = 'lowpass',
    cutoff = 4000,
    detune = 0,
  }) {
    const safeDuration = Math.min(MAX_CUE_SECONDS, Math.max(.02, duration));
    const oscillator = context.createOscillator();
    const filter = context.createBiquadFilter();
    const { gain, end } = envelope(time, safeDuration, volume, attack);
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(Math.max(1, frequency), time);
    if (Number.isFinite(endFrequency) && endFrequency > 0) {
      oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), time + safeDuration);
    }
    if (detune && oscillator.detune?.setValueAtTime) {
      oscillator.detune.setValueAtTime(detune, time);
    }
    filter.type = filterType;
    filter.frequency.setValueAtTime(Math.max(20, cutoff), time);
    oscillator.connect(filter).connect(gain);
    oscillator.start(time);
    oscillator.stop(end + .02);
    oscillator.onended = () => {
      oscillator.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
    return end;
  }

  function noise({
    time,
    duration,
    volume,
    filterType = 'lowpass',
    cutoff = 800,
    attack = .004,
  }) {
    if (!noiseBuffer) {
      try {
        const rate = context.sampleRate ?? 48000;
        const length = Math.max(1, Math.floor(rate * .5));
        noiseBuffer = context.createBuffer(1, length, rate);
        const data = noiseBuffer.getChannelData(0);
        for (let index = 0; index < length; index++) data[index] = Math.random() * 2 - 1;
      } catch {
        return time;
      }
    }
    const safeDuration = Math.min(MAX_CUE_SECONDS, Math.max(.02, duration));
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const { gain, end } = envelope(time, safeDuration, volume, attack);
    source.buffer = noiseBuffer;
    filter.type = filterType;
    filter.frequency.setValueAtTime(Math.max(20, cutoff), time);
    source.connect(filter).connect(gain);
    source.start(time);
    source.stop(end + .02);
    source.onended = () => {
      source.disconnect();
      filter.disconnect();
      gain.disconnect();
    };
    return end;
  }

  function scaleVolume(volume) {
    return Number.isFinite(volume) ? Math.max(0, Math.min(1, volume)) : 1;
  }

  function chime(time, options, { transpose = 0, bright = false, duration = .16 } = {}) {
    const scale = clampScale(options.scale);
    const degree = Number.isFinite(options.degree) ? options.degree : 0;
    const frequency = midiToFrequency(noteAtDegree(ROOT_MIDI + transpose, scale, degree));
    const level = scaleVolume(options.volume);
    tone({
      type: 'sine',
      frequency,
      time,
      duration,
      volume: .13 * level,
      cutoff: bright ? 5200 : 3400,
    });
    tone({
      type: 'triangle',
      frequency: frequency * 2,
      time,
      duration,
      volume: .055 * level,
      cutoff: bright ? 6200 : 4200,
    });
  }

  function scheduleCue(name, time, options) {
    switch (name) {
      case 'shard':
        chime(time, options);
        return .16;
      case 'shardArc':
        chime(time, options, { transpose: 7, bright: true, duration: .18 });
        return .18;
      case 'land': {
        const impact = Math.max(0, Math.min(1, Number.isFinite(options.impact) ? options.impact : .5));
        noise({ time, duration: .13, volume: .07 + impact * .14, filterType: 'lowpass', cutoff: 380, attack: .003 });
        tone({ type: 'sine', frequency: 120, endFrequency: 58, time, duration: .12, volume: .07 + impact * .12, cutoff: 500 });
        return .16;
      }
      case 'tick':
        // Menu feedback: soft, short and quiet enough to sit under a card press without masking
        // the music. It shares the voice budget with everything else.
        tone({ type: 'sine', frequency: 880, endFrequency: 760, time, duration: .06, volume: .06, cutoff: 2400, attack: .002 });
        return .07;
      case 'jump': {
        const level = scaleVolume(options.volume);
        noise({ time, duration: .1, volume: .055 * level, filterType: 'bandpass', cutoff: 900, attack: .002 });
        return .12;
      }
      case 'bounce':
        tone({ type: 'sine', frequency: 520, endFrequency: 160, time, duration: .22, volume: .17, cutoff: 1200 });
        return .23;
      case 'shield':
        tone({ type: 'sine', frequency: 523.25, time, duration: .13, volume: .1, cutoff: 2600 });
        tone({ type: 'triangle', frequency: 783.99, time: time + .09, duration: .17, volume: .09, cutoff: 3200 });
        return .28;
      case 'checkpoint':
        noise({ time, duration: .025, volume: .05, filterType: 'highpass', cutoff: 3200, attack: .001 });
        tone({ type: 'sine', frequency: 1046.5, time: time + .03, duration: .25, volume: .11, cutoff: 4200, attack: .01 });
        tone({ type: 'triangle', frequency: 1568, time: time + .03, duration: .2, volume: .035, cutoff: 5200, attack: .01 });
        return .3;
      case 'portal':
        tone({ type: 'sine', frequency: 880, time, duration: .28, volume: .07, cutoff: 4800, attack: .02 });
        tone({ type: 'sine', frequency: 1320, time: time + .015, duration: .26, volume: .055, cutoff: 5600, attack: .02, detune: 7 });
        tone({ type: 'triangle', frequency: 1760, time: time + .03, duration: .2, volume: .025, cutoff: 6200, attack: .02 });
        return .31;
      case 'death':
        tone({ type: 'sine', frequency: 620, endFrequency: 92, time, duration: .3, volume: .16, cutoff: 1800, attack: .004 });
        tone({ type: 'triangle', frequency: 310, endFrequency: 61, time, duration: .32, volume: .06, cutoff: 1200, attack: .004 });
        return .34;
      case 'finish': {
        const scale = clampScale(options.scale);
        const notes = [0, 2, 4, 5];
        for (const [index, degree] of notes.entries()) {
          const frequency = midiToFrequency(noteAtDegree(ROOT_MIDI + 12, scale, degree));
          tone({
            type: index % 2 === 0 ? 'triangle' : 'sine',
            frequency,
            time: time + index * .07,
            duration: .1,
            volume: .1,
            cutoff: 5200,
            attack: .005,
          });
        }
        return .34;
      }
      default:
        return 0;
    }
  }

  function play(name, options = {}) {
    if (!enabled) return false;
    if (!context || context.state !== 'running') return false;
    const time = clock();
    pruneVoices(time);
    if (!name || !hasCue(name)) return false;
    if (voices.some((voice) => voice.name === name)) return false;
    if (voices.length >= MAX_VOICES) return false;
    let duration;
    try {
      duration = scheduleCue(name, time, options ?? {});
    } catch {
      return false;
    }
    if (!duration) return false;
    const endsAt = time + Math.min(MAX_CUE_SECONDS, duration);
    voices.push({ name, endsAt });
    if (typeof onSchedule === 'function') {
      try {
        onSchedule({
          name,
          time,
          duration: Math.min(MAX_CUE_SECONDS, duration),
          degree: Number.isFinite(options?.degree) ? options.degree : null,
          impact: Number.isFinite(options?.impact) ? options.impact : null,
        });
      } catch {
        // A logging hook must never stop a cue.
      }
    }
    return true;
  }

  function hasCue(name) {
    return name === 'shard'
      || name === 'shardArc'
      || name === 'land'
      || name === 'jump'
      || name === 'tick'
      || name === 'bounce'
      || name === 'shield'
      || name === 'checkpoint'
      || name === 'portal'
      || name === 'death'
      || name === 'finish';
  }

  return {
    master,
    play,
    setEnabled(value) {
      enabled = Boolean(value);
    },
    isEnabled() {
      return enabled;
    },
    activeVoiceCount() {
      pruneVoices(clock());
      return voices.length;
    },
    dispose() {
      voices.length = 0;
      try {
        master.disconnect();
      } catch {
        // A closed context may already have dropped the graph.
      }
    },
    voiceLimit: MAX_VOICES,
    maxCueSeconds: MAX_CUE_SECONDS,
    maxVoiceGain: MAX_VOICE_GAIN,
    reducedMotion: Boolean(reducedMotion),
  };
}
