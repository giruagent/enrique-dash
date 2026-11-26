import test from 'node:test';
import assert from 'node:assert/strict';
import { beatDurationSeconds, midiToFrequency, noteAtDegree, planScheduleWindow } from './music.js';

test('MIDI pitches map to equal-tempered frequencies', () => {
  assert.equal(midiToFrequency(69), 440);
  assert.ok(Math.abs(midiToFrequency(60) - 261.625565) < .001);
});

test('scale-degree lookup wraps across octaves and handles negative degrees', () => {
  const scale = [0, 2, 4, 7, 9];
  assert.equal(noteAtDegree(60, scale, 0), 60);
  assert.equal(noteAtDegree(60, scale, 5), 72);
  assert.equal(noteAtDegree(60, scale, -1), 57);
});

test('music scheduler uses the selected tempo for sixteenth-note timing', () => {
  assert.equal(beatDurationSeconds(120), .125);
  assert.equal(beatDurationSeconds(60), .25);
});

test('the scheduler advances one step per beat inside the look-ahead window', () => {
  const plan = planScheduleWindow({ currentTime: 10, nextStepAt: 10.05, bpm: 120, lookAhead: .12 });
  assert.equal(plan.resynced, false);
  assert.deepEqual(plan.times, [10.05]);
  assert.ok(Math.abs(plan.nextStepAt - (10.05 + .125)) < 1e-9);
});

test('a suspended audio context resyncs instead of replaying the backlog', () => {
  const plan = planScheduleWindow({ currentTime: 10, nextStepAt: 10 - 30, bpm: 150, lookAhead: .12 });
  assert.equal(plan.resynced, true);
  assert.equal(plan.times.length, 1);
  assert.ok(plan.times[0] >= 10 + .05 - 1e-9 && plan.times[0] < 10.051);
});

test('no tick can schedule more steps than the burst guard allows', () => {
  const plan = planScheduleWindow({ currentTime: 10, nextStepAt: 10, bpm: 600, lookAhead: 5 });
  assert.equal(plan.times.length, 8);
});

test('thirty seconds of lag produce at most one note, not three hundred', () => {
  const plan = planScheduleWindow({ currentTime: 10, nextStepAt: 10 - 30, bpm: 150 });
  assert.ok(plan.times.length <= 2, `scheduled ${plan.times.length} steps`);
  assert.ok(plan.nextStepAt > 10);
});
