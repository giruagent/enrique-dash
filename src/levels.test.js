import test from 'node:test';
import assert from 'node:assert/strict';
import { getLevel, levelValidationError, levels, validateLevels } from './levels.js';

test('the valid course catalog imports without a validation failure', () => {
  assert.equal(levelValidationError, null);
});

test('the campaign contains twenty uniquely named playable levels', () => {
  assert.equal(levels.length, 20);
  assert.equal(new Set(levels.map((level) => level.id)).size, levels.length);
  assert.equal(new Set(levels.map((level) => level.name)).size, levels.length);
});

test('each course has validated rhythm, length, and obstacle groups', () => {
  assert.equal(validateLevels(levels), true);
  for (const level of levels) {
    assert.ok(level.obstacles.length >= 3, `${level.name} needs a playable hazard rhythm`);
    assert.ok(level.music.motif.length === 16, `${level.name} needs a one-bar motif`);
  }
});

test('course lengths rise gradually to a maximum of 150 track units', () => {
  for (let index = 1; index < levels.length; index++) {
    assert.ok(levels[index].length > levels[index - 1].length, `${levels[index].name} should be longer than the previous course`);
  }
  assert.ok(levels.at(-1).length <= 150);
});

test('each post-tutorial level has its own signature and working special mechanics', () => {
  const advanced = levels.slice(1);
  assert.equal(new Set(advanced.map((level) => level.signature)).size, advanced.length);
  for (const level of advanced) {
    assert.ok(level.designHook, `${level.name} needs a design hook`);
    assert.ok(['gaps', 'platforms', 'portals', 'enemies'].some((key) => level[key].length > 0), `${level.name} needs a special course feature`);
  }
});

test('level lookup is stable and returns undefined for unknown ids', () => {
  assert.equal(getLevel(levels[0].id), levels[0]);
  assert.equal(getLevel('not-a-level'), undefined);
});
