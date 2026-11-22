import test from 'node:test';
import assert from 'node:assert/strict';
import { beatDurationSeconds, midiToFrequency, noteAtDegree } from './music.js';

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
