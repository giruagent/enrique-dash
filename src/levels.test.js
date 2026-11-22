import test from 'node:test';
import assert from 'node:assert/strict';
import { getLevel, levels, validateLevels } from './levels.js';

test('the catalog contains at least eleven uniquely named playable levels', () => {
  assert.ok(levels.length >= 11);
  assert.equal(new Set(levels.map((level) => level.id)).size, levels.length);
  assert.equal(new Set(levels.map((level) => level.name)).size, levels.length);
});

test('every level has valid rhythm, course length, and separated obstacle groups', () => {
  assert.equal(validateLevels(levels), true);
  for (const level of levels) {
    assert.ok(level.obstacles.length >= 6, `${level.name} needs a real course`);
    assert.ok(level.music.motif.length === 16, `${level.name} needs a one-bar motif`);
  }
});

test('level lookup is stable and returns undefined for unknown ids', () => {
  assert.equal(getLevel(levels[0].id), levels[0]);
  assert.equal(getLevel('not-a-level'), undefined);
});
