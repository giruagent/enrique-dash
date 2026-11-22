import test from 'node:test';
import assert from 'node:assert/strict';
import { isObstacleCollision, levelProgressPercent } from './game-logic.js';

test('a ground-level player collides only inside the horizontal hit window', () => {
  assert.equal(isObstacleCollision(-3, -3, 0), true);
  assert.equal(isObstacleCollision(-3, -2.2, 0), false);
});

test('jump height clears spikes only above the configured clearance threshold', () => {
  assert.equal(isObstacleCollision(-3, -3, .94), true);
  assert.equal(isObstacleCollision(-3, -3, .95), false);
});

test('level progress stays within zero and one hundred percent', () => {
  assert.equal(levelProgressPercent(-1, 80), 0);
  assert.equal(levelProgressPercent(40, 80), 50);
  assert.equal(levelProgressPercent(90, 80), 100);
});
