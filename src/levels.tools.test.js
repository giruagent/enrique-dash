import test from 'node:test';
import assert from 'node:assert/strict';
import { playLevel } from '../tools/auto-player.mjs';
import { analyzeLevel } from '../tools/level-report.mjs';
import { airTime, beatWindows, jumpApexHeight, jumpFallTime, jumpReach, jumpRiseTime } from '../tools/level-physics.mjs';
import { jumpTuning, motionTuning } from './game-logic.js';
import { woolLevels } from './levels-wool.js';

function fixture(overrides = {}) {
  return {
    id: 'synthetic',
    speed: 8,
    length: 70,
    hazardStyle: 'spike',
    obstacles: [],
    gaps: [],
    platforms: [],
    portals: [],
    enemies: [],
    collectibles: [],
    ...overrides,
  };
}

test('a straight run with a hazard one reach away is completed', () => {
  const reach = jumpReach(8);
  assert.ok(Math.abs(airTime() - (jumpRiseTime() + jumpFallTime())) < 1e-12);
  assert.ok(airTime() < 2 * jumpTuning.initialVelocity / motionTuning.gravity);
  const result = playLevel(fixture({ obstacles: [[4 + reach, 1]] }));
  assert.equal(result.completed, true);
  assert.equal(result.deaths, 0);
  assert.equal(result.jumps, 1);
});

test('a hazard inside the dead band is reported as insane spacing even when cleared', () => {
  const firstAt = 12;
  const distance = 1.15 * jumpReach(8);
  const level = fixture({ obstacles: [[firstAt, 1], [firstAt + distance, 1]] });
  const result = playLevel(level);
  const metrics = analyzeLevel(level, result);
  assert.equal(result.completed, true);
  assert.equal(metrics.deadBandViolations.length, 1);
  assert.ok(Math.abs(metrics.deadBandViolations[0].distance - distance) < 1e-9);
  assert.ok(metrics.deadBandViolations[0].ratio > 1);
  assert.ok(metrics.deadBandViolations[0].ratio < 1.35);
});

test('a gap wider than jump reach is not completable', () => {
  const level = fixture({ gaps: [{ at: 12, width: jumpReach(8) + 1 }] });
  const result = playLevel(level);
  assert.equal(result.completed, false);
  assert.equal(result.deaths, 1);
  assert.match(result.events.find(({ type }) => type === 'death').reason, /gap-0/);
});

test('a bridge platform over a gap is crossed without jumping', () => {
  const level = fixture({
    gaps: [{ at: 12, width: 4 }],
    platforms: [{ at: 11, width: 6, height: .5, kind: 'bridge' }],
  });
  const result = playLevel(level);
  assert.equal(result.completed, true);
  assert.equal(result.deaths, 0);
  assert.equal(result.jumps, 0);
});

test('a dash portal compresses following spacing; the layout is looser without it', () => {
  const firstAt = 12;
  const secondAt = firstAt + 1.4 * jumpReach(8);
  const obstacles = [[firstAt, 1], [secondAt, 1]];
  const plain = fixture({ obstacles });
  const dashed = fixture({ obstacles, portals: [{ at: 15, type: 'dash' }] });
  const plainMetrics = analyzeLevel(plain);
  const dashMetrics = analyzeLevel(dashed);
  assert.equal(plainMetrics.result.completed, true);
  assert.equal(dashMetrics.result.completed, true);
  assert.equal(plainMetrics.deadBandViolations.length, 0);
  assert.equal(dashMetrics.deadBandViolations.length, 1);
  assert.ok(dashMetrics.deadBandViolations[0].ratio < 1.4);
  assert.ok(dashMetrics.finishTime < plainMetrics.finishTime);
});

test('moving a second beat closer reduces tightestMargin and the metrics agree', () => {
  const firstAt = 12;
  const reach = jumpReach(8);
  const far = fixture({ obstacles: [[firstAt, 1], [firstAt + 1.3 * reach, 1]] });
  const close = fixture({ obstacles: [[firstAt, 1], [firstAt + .75 * reach, 1]] });
  const farResult = playLevel(far);
  const closeResult = playLevel(close);
  const farMetrics = analyzeLevel(far, farResult);
  const closeMetrics = analyzeLevel(close, closeResult);
  assert.equal(farResult.completed, true);
  assert.equal(closeResult.completed, true);
  assert.ok(closeResult.tightestMargin < farResult.tightestMargin);
  assert.equal(farMetrics.deadBandViolations.length, 1);
  assert.equal(closeMetrics.deadBandViolations.length, 0);
});

// The bounce is a real physics change, not a solver special case: the pad delays the gap jump
// enough that its landing arc carries over the hazard. Remove the pad and the same run lands just
// before the hazard, too close to jump again.
test('a hazard that is only clearable with a bounce pad is completed with the pad and fails without it', () => {
  const shared = {
    gaps: [{ at: 8, width: 2.5 }],
    obstacles: [[11.3, 1]],
  };
  const plain = fixture(shared);
  const padded = fixture({
    ...shared,
    platforms: [{ at: 3, width: 3.5, height: .35, kind: 'bounce' }],
  });
  const withPad = playLevel(padded);
  const withoutPad = playLevel(plain);
  assert.equal(withPad.completed, true);
  assert.equal(withPad.deaths, 0);
  assert.equal(withoutPad.completed, false);
  assert.equal(withoutPad.deaths, 1);
  assert.match(
    withoutPad.events.find(({ type }) => type === 'death').reason,
    /hazard-0\.0 collision/,
  );
});

function shardArcs(level) {
  const arcs = [];
  for (let index = 0; index < level.collectibles.length; index++) {
    const leader = level.collectibles[index];
    if (!leader.arc) continue;
    arcs.push(level.collectibles.slice(index, index + leader.arc));
  }
  return arcs;
}

test('every wool shard arc follows the auto-player trajectory inside the apex band', () => {
  const apex = jumpApexHeight();
  for (const level of woolLevels) {
    const result = playLevel(level, { trace: true });
    assert.equal(result.completed, true, `${level.id} must complete for its trace`);
    const arcs = shardArcs(level);
    assert.ok(arcs.length >= 1, `${level.id} needs at least one arc`);
    for (const arc of arcs) {
      assert.ok(arc.length >= 2 && arc.length <= 5, `${level.id} has an arc outside 2–5 shards`);
      assert.equal(arc[0].arc, arc.length, `${level.id} arc leader declares the wrong size`);
      for (const shard of arc) {
        assert.ok(shard.height >= 1.2, `${level.id} arc shard hangs too low`);
        assert.ok(shard.height <= apex + .05, `${level.id} arc shard is above the jump apex`);
        const frame = result.samples.find((sample) => (
          !sample.grounded
          && Math.abs(sample.at - shard.at) <= .05
          && Math.abs((sample.y - sample.supportY) - shard.height) <= .1
        ));
        assert.ok(frame, `${level.id} arc shard at ${shard.at} is not on the simulated arc`);
      }
    }
  }
});

test('a moth at its maximum wing offset needs the same jump as a drone', () => {
  const drone = fixture({ enemies: [{ at: 12, type: 'drone' }] });
  const moth = fixture({ enemies: [{ at: 12, type: 'moth' }] });
  const droneWindows = beatWindows(drone).filter(({ kind }) => kind === 'enemy');
  const mothWindows = beatWindows(moth).filter(({ kind }) => kind === 'enemy');
  assert.deepEqual(
    mothWindows.map(({ clearance, start, end, requirement }) => ({ clearance, start, end, requirement })),
    droneWindows.map(({ clearance, start, end, requirement }) => ({ clearance, start, end, requirement })),
  );
  const droneRun = playLevel(drone);
  const mothRun = playLevel(moth);
  assert.equal(mothRun.completed, true);
  assert.equal(droneRun.completed, true);
  assert.equal(mothRun.jumps, droneRun.jumps);
  assert.equal(mothRun.tightestMargin, droneRun.tightestMargin);
});
