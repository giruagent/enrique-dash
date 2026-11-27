import test from 'node:test';
import assert from 'node:assert/strict';
import { createSfxEngine, nextStreak, shardChimeDegree } from './sfx.js';

const SCALE = [0, 2, 4, 7, 9];

function createMockContext({ state = 'running', currentTime = 0 } = {}) {
  const scheduled = { oscillators: [], gains: [], filters: [], buffers: 0, sources: [] };
  const param = (value = 0) => ({
    value,
    lastSet: null,
    lastRamp: null,
    ramps: [],
    setValueAtTime(next, time) {
      this.value = next;
      this.lastSet = [next, time];
      return this;
    },
    exponentialRampToValueAtTime(next, time) {
      this.value = next;
      this.lastRamp = [next, time];
      this.ramps.push([next, time]);
      return this;
    },
    setTargetAtTime(next) {
      this.value = next;
      return this;
    },
    cancelScheduledValues() {
      return this;
    },
  });
  const node = (extra = {}) => ({
    connect(target) { return target; },
    disconnect() {},
    ...extra,
  });
  const context = {
    state,
    currentTime,
    destination: node(),
    sampleRate: 48000,
    createGain() {
      const gain = node({ gain: param(1) });
      scheduled.gains.push(gain);
      return gain;
    },
    createOscillator() {
      const oscillator = node({
        type: 'sine',
        frequency: param(440),
        detune: param(0),
        start() {},
        stop() {},
      });
      scheduled.oscillators.push(oscillator);
      return oscillator;
    },
    createBiquadFilter() {
      const filter = node({ type: 'lowpass', frequency: param(1000), Q: param(1) });
      scheduled.filters.push(filter);
      return filter;
    },
    createBuffer(channels, length) {
      scheduled.buffers++;
      return { getChannelData: () => new Float32Array(length) };
    },
    createBufferSource() {
      const source = node({ buffer: null, start() {}, stop() {} });
      scheduled.sources.push(source);
      return source;
    },
    resume() {
      return Promise.resolve();
    },
  };
  return { context, scheduled };
}

test('shardChimeDegree walks the scale and wraps on the fifth pickup', () => {
  assert.deepEqual(
    [0, 1, 2, 3, 4].map((streak) => shardChimeDegree(0, streak, SCALE)),
    [0, 1, 2, 3, SCALE.length],
  );
  assert.equal(shardChimeDegree(12, 0, SCALE), 0, 'a lone shard always rings degree 0');
  assert.equal(shardChimeDegree(9, 4, [0, 2, 4, 7, 9, 11, 14]), 7, 'the wrap uses the course scale length');
});

test('nextStreak keeps a 1.4 second window and restarts after it', () => {
  assert.equal(nextStreak(0, Infinity), 0, 'the first pickup starts at degree 0');
  assert.equal(nextStreak(0, .4), 1);
  assert.equal(nextStreak(1, 1.4), 2, 'the window boundary is inclusive');
  assert.equal(nextStreak(2, 1.4001), 0, 'a longer gap restarts the ladder');
  assert.equal(nextStreak(3, .2), 4);
  assert.equal(nextStreak(4, .2), 4, 'the streak stays capped at the fifth pickup');
});

test('a suspended context schedules nothing and throws nothing', () => {
  const { context, scheduled } = createMockContext({ state: 'suspended' });
  const engine = createSfxEngine({ context, destination: context.destination });
  assert.equal(engine.play('shard'), false);
  assert.doesNotThrow(() => engine.play('finish'));
  assert.equal(scheduled.oscillators.length, 0);
  assert.equal(scheduled.sources.length, 0);
  assert.equal(engine.activeVoiceCount(), 0);
});

test('the voice cap holds after twenty rapid play calls', () => {
  const { context, scheduled } = createMockContext();
  const engine = createSfxEngine({ context, destination: context.destination });
  const names = ['shard', 'land', 'jump', 'bounce', 'shield', 'checkpoint', 'portal', 'death', 'finish'];
  let accepted = 0;
  for (let index = 0; index < 20; index++) {
    if (engine.play(names[index % names.length], { impact: .6, degree: index })) accepted++;
  }
  assert.equal(engine.voiceLimit, 6);
  assert.ok(engine.activeVoiceCount() <= 6, 'never more than six voices');
  assert.equal(accepted, 6, 'only the first six distinct cues are accepted');
  assert.equal(engine.play('shard'), false, 'a cue whose own voice is alive is dropped');
  assert.ok(scheduled.oscillators.length > 0);
});

test('every scheduled envelope stays under the gain and duration limits', () => {
  const { context, scheduled } = createMockContext();
  let nowSeconds = 0;
  const engine = createSfxEngine({
    context,
    destination: context.destination,
    now: () => nowSeconds,
  });
  for (const name of ['shard', 'shardArc', 'land', 'jump', 'bounce', 'shield', 'checkpoint', 'portal', 'death', 'finish']) {
    assert.equal(engine.play(name, { degree: 2, scale: SCALE, impact: .8, volume: .35 }), true, name);
    nowSeconds += 1;
  }
  for (const gain of scheduled.gains) {
    for (const [value] of gain.gain.ramps) {
      assert.ok(value <= .25, `gain ${value} exceeds .25`);
    }
    if (!gain.gain.lastSet || !gain.gain.lastRamp) continue;
    const duration = gain.gain.lastRamp[1] - gain.gain.lastSet[1];
    assert.ok(duration <= engine.maxCueSeconds + 1e-9, `envelope lasts ${duration}s, beyond ${engine.maxCueSeconds}`);
    assert.equal(gain.gain.lastRamp[0], .0001, 'every envelope lands on silence');
  }
});

test('a disabled engine drops cues without touching the graph', () => {
  const { context, scheduled } = createMockContext();
  const engine = createSfxEngine({ context, destination: context.destination });
  engine.setEnabled(false);
  assert.equal(engine.play('shard'), false);
  assert.equal(scheduled.oscillators.length, 0);
  assert.equal(engine.isEnabled(), false);
});
