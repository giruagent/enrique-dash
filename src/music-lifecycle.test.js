import test from 'node:test';
import assert from 'node:assert/strict';
import { MusicEngine } from './music.js';

const track = {
  bpm: 120,
  progression: [0],
  root: 60,
  scale: [0, 2, 4, 7, 9],
  motif: Array(16).fill(null),
};

class FakeAudioParam {
  constructor(value = 0) {
    this.value = value;
  }

  cancelScheduledValues() {}

  setTargetAtTime(value) {
    this.value = value;
  }

  setValueAtTime(value) {
    this.value = value;
  }

  exponentialRampToValueAtTime(value) {
    this.value = value;
  }
}

class FakeAudioNode {
  connect(target) {
    return target;
  }

  disconnect() {}
}

class FakeAudioContextBase {
  constructor({ state = 'running', failedResumeAttempts = 0 } = {}) {
    this.state = state;
    this.currentTime = 0;
    this.sampleRate = 8000;
    this.destination = new FakeAudioNode();
    this.failedResumeAttempts = failedResumeAttempts;
    this.resumeCalls = 0;
    this.scheduledTimes = [];
    this.stateChangeListeners = new Set();
  }

  addEventListener(type, listener) {
    if (type === 'statechange') this.stateChangeListeners.add(listener);
  }

  setState(state) {
    if (this.state === state) return;
    this.state = state;
    for (const listener of this.stateChangeListeners) listener();
  }

  async resume() {
    this.resumeCalls++;
    if (this.resumeCalls > this.failedResumeAttempts) this.setState('running');
  }

  async suspend() {
    this.setState('suspended');
  }

  createGain() {
    const node = new FakeAudioNode();
    node.gain = new FakeAudioParam();
    return node;
  }

  createDynamicsCompressor() {
    const node = new FakeAudioNode();
    for (const property of ['threshold', 'knee', 'ratio', 'attack', 'release']) {
      node[property] = new FakeAudioParam();
    }
    return node;
  }

  createDelay() {
    const node = new FakeAudioNode();
    node.delayTime = new FakeAudioParam();
    return node;
  }

  createBiquadFilter() {
    const node = new FakeAudioNode();
    node.frequency = new FakeAudioParam();
    return node;
  }

  createOscillator() {
    const node = new FakeAudioNode();
    node.frequency = new FakeAudioParam();
    node.start = (time) => this.scheduledTimes.push(time);
    node.stop = () => {};
    return node;
  }

  createBufferSource() {
    const node = new FakeAudioNode();
    node.start = (time) => this.scheduledTimes.push(time);
    node.stop = () => {};
    return node;
  }

  createBuffer(channels, length) {
    const data = Array.from({ length: channels }, () => new Float32Array(length));
    return { getChannelData: (channel) => data[channel] };
  }
}

class FakeTimers {
  constructor() {
    this.now = 0;
    this.nextId = 1;
    this.intervals = new Map();
    this.timeouts = new Map();
  }

  setInterval = (callback, delay) => {
    const id = this.nextId++;
    this.intervals.set(id, { callback, delay });
    return id;
  };

  clearInterval = (id) => {
    this.intervals.delete(id);
  };

  setTimeout = (callback, delay) => {
    const id = this.nextId++;
    this.timeouts.set(id, { callback, dueAt: this.now + delay });
    return id;
  };

  clearTimeout = (id) => {
    this.timeouts.delete(id);
  };

  tickIntervals() {
    for (const { callback } of [...this.intervals.values()]) callback();
  }

  advanceTimeouts(milliseconds) {
    this.now += milliseconds;
    for (const [id, timeout] of [...this.timeouts]) {
      if (timeout.dueAt > this.now) continue;
      this.timeouts.delete(id);
      timeout.callback();
    }
  }
}

function createHarness(t, contextOptions) {
  const timers = new FakeTimers();
  const originalWindow = globalThis.window;
  const originalSetInterval = globalThis.setInterval;
  const originalClearInterval = globalThis.clearInterval;
  const originalSetTimeout = globalThis.setTimeout;
  const originalClearTimeout = globalThis.clearTimeout;
  let context;

  class FakeAudioContext extends FakeAudioContextBase {
    constructor() {
      super(contextOptions);
      context = this;
    }
  }

  globalThis.window = { AudioContext: FakeAudioContext };
  globalThis.setInterval = timers.setInterval;
  globalThis.clearInterval = timers.clearInterval;
  globalThis.setTimeout = timers.setTimeout;
  globalThis.clearTimeout = timers.clearTimeout;

  t.after(() => {
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
    globalThis.setInterval = originalSetInterval;
    globalThis.clearInterval = originalClearInterval;
    globalThis.setTimeout = originalSetTimeout;
    globalThis.clearTimeout = originalClearTimeout;
  });

  const engine = new MusicEngine();
  return { engine, timers, getContext: () => context };
}

test('start on a running context schedules notes with a non-zero master gain', async (t) => {
  const { engine, timers, getContext } = createHarness(t);

  assert.equal(await engine.start(track), true);
  const context = getContext();
  assert.equal(timers.intervals.size, 1);
  assert.equal(context.stateChangeListeners.size, 1);
  timers.tickIntervals();

  assert.ok(context.scheduledTimes.length > 0);
  assert.ok(engine.master.gain.value > 0);
});

test('restart inside the suspend window keeps one live interval and a non-zero gain', async (t) => {
  const { engine, timers, getContext } = createHarness(t);

  await engine.start(track);
  const context = getContext();
  await engine.stop();
  await engine.start(track);
  timers.advanceTimeouts(450);
  timers.tickIntervals();

  assert.equal(context.state, 'running');
  assert.equal(timers.intervals.size, 1);
  assert.ok(context.scheduledTimes.length > 0);
  assert.ok(engine.master.gain.value > 0);
});

test('restart after the suspend fires resumes and schedules notes', async (t) => {
  const { engine, timers, getContext } = createHarness(t);

  await engine.start(track);
  const context = getContext();
  await engine.stop();
  timers.advanceTimeouts(450);
  assert.equal(context.state, 'suspended');

  await engine.start(track);
  timers.tickIntervals();

  assert.equal(context.state, 'running');
  assert.equal(timers.intervals.size, 1);
  assert.ok(context.scheduledTimes.length > 0);
});

test('a settled resume is retried until statechange re-arms note scheduling', async (t) => {
  const { engine, timers, getContext } = createHarness(t, {
    state: 'suspended',
    failedResumeAttempts: 1,
  });

  await engine.start(track);
  const context = getContext();
  assert.equal(context.state, 'suspended');
  assert.equal(context.resumeCalls, 1);

  timers.tickIntervals();
  timers.tickIntervals();

  assert.ok(
    context.scheduledTimes.length > 0,
    'expected the scheduler to retry resume and schedule notes after statechange',
  );
  assert.equal(context.state, 'running');
  assert.equal(context.resumeCalls, 2);
  assert.ok(context.scheduledTimes.every((time) => time === context.currentTime + .08));
});

test('double stop followed by start leaves exactly one interval and one scheduled sequence', async (t) => {
  const { engine, timers, getContext } = createHarness(t);

  await engine.start(track);
  const context = getContext();
  await engine.stop();
  await engine.stop();
  await engine.start(track);

  assert.equal(timers.intervals.size, 1);
  timers.tickIntervals();
  assert.equal(engine.step, 1);
  const scheduledCount = context.scheduledTimes.length;
  assert.ok(scheduledCount > 0);
  timers.tickIntervals();
  assert.equal(context.scheduledTimes.length, scheduledCount);
  timers.advanceTimeouts(450);
  assert.equal(context.state, 'running');
  assert.equal(timers.intervals.size, 1);
});

test('a stopped engine never revives itself when the context state changes', async (t) => {
  const { engine, timers, getContext } = createHarness(t);

  await engine.start(track);
  const context = getContext();
  timers.tickIntervals();
  const scheduledCount = context.scheduledTimes.length;
  await engine.stop();
  assert.equal(engine.desired, false);

  context.setState('suspended');
  context.setState('running');
  timers.tickIntervals();
  timers.advanceTimeouts(450);
  context.setState('running');
  timers.tickIntervals();

  assert.equal(timers.intervals.size, 0);
  assert.equal(context.scheduledTimes.length, scheduledCount);
});

test('retrying a stuck resume backs off instead of hammering the context', async (t) => {
  const { engine, timers, getContext } = createHarness(t, {
    state: 'suspended',
    failedResumeAttempts: 999,
  });

  await engine.start(track);
  const context = getContext();
  assert.equal(context.resumeCalls, 1);

  for (let tick = 0; tick < 20; tick++) timers.tickIntervals();

  assert.equal(context.state, 'suspended');
  assert.ok(context.resumeCalls <= 6, `expected backoff, got ${context.resumeCalls} resume calls`);
  assert.equal(timers.intervals.size, 1);

  context.failedResumeAttempts = 0;
  for (let tick = 0; tick < 60 && context.state !== 'running'; tick++) timers.tickIntervals();
  timers.tickIntervals();

  assert.equal(context.state, 'running');
  assert.ok(context.scheduledTimes.length > 0);
});
