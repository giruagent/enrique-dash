import test from 'node:test';
import assert from 'node:assert/strict';
import { medalFor, medalLabel, isNewBest, streakLabel } from './medals.js';

test('a clear without every shard is bronze, even without the checkpoint', () => {
  assert.equal(medalFor({ shards: 1, totalShards: 4, usedCheckpoint: false }), 'bronze');
});

test('every shard is silver when the checkpoint was used and gold when it was not', () => {
  assert.equal(medalFor({ shards: 4, totalShards: 4, usedCheckpoint: true }), 'silver');
  assert.equal(medalFor({ shards: 4, totalShards: 4, usedCheckpoint: false }), 'gold');
});

test('a course with no shards still earns gold on a clean clear', () => {
  assert.equal(medalFor({ shards: 0, totalShards: 0, usedCheckpoint: false }), 'gold');
  assert.equal(medalFor({ shards: 0, totalShards: 0, usedCheckpoint: true }), 'silver');
});

test('medal labels are upper case and unknown medals render nothing', () => {
  assert.equal(medalLabel('gold'), 'GOLD');
  assert.equal(medalLabel('platinum'), '');
});

test('the first clear is always a new best; later runs must beat the stored shard count', () => {
  assert.equal(isNewBest(undefined, { shards: 0 }), true);
  assert.equal(isNewBest({ cleared: false, shards: 4 }, { shards: 0 }), true);
  assert.equal(isNewBest({ cleared: true, shards: 2 }, { shards: 2 }), false);
  assert.equal(isNewBest({ cleared: true, shards: 2 }, { shards: 3 }), true);
});

test('the streak chip appears from the second pickup and caps at five', () => {
  assert.equal(streakLabel(0), '');
  assert.equal(streakLabel(1), '×2');
  assert.equal(streakLabel(3), '×4');
  assert.equal(streakLabel(9), '×5');
  assert.equal(streakLabel('x'), '');
});
