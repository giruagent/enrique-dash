import test from 'node:test';
import assert from 'node:assert/strict';
import { canConsumeJumpBuffer, getHazardProfile, getTrackSupportHeight, integrateVerticalMotion, isCollectibleContact, isGamePaused, isObstacleCollision, jumpTuning, levelProgressPercent, mergeJumpRequest, portalEffects, shouldAcceptJumpInput, shouldApplyBufferedStartJump, shouldSpawnCourseFeatures, shouldStompEnemy } from './game-logic.js';

test('hazard profiles give each environment collision geometry and a safe fallback', () => {
  assert.equal(getHazardProfile('crystal-beam').shape, 'beam');
  assert.ok(getHazardProfile('crystal-beam').clearanceHeight > .95);
  assert.equal(getHazardProfile('pixel-block').shape, 'block');
  assert.equal(getHazardProfile('unknown-hazard').shape, 'spike');
});
test('jump buffering and coyote time preserve a near-miss tap without allowing double jumps', () => {
  assert.ok(jumpTuning.initialVelocity > 8.3);
  assert.ok(jumpTuning.inputBufferSeconds >= .12);
  assert.ok(jumpTuning.coyoteSeconds >= .1);
  assert.equal(canConsumeJumpBuffer(true, 0, .12), true);
  assert.equal(canConsumeJumpBuffer(false, .08, .12), true);
  assert.equal(canConsumeJumpBuffer(false, 0, .12), false);
  assert.equal(canConsumeJumpBuffer(true, .1, 0), false);
});
test('a ground-level player collides only inside the horizontal hit window', () => {
  assert.equal(isObstacleCollision(-3, -3, 0), true);
  assert.equal(isObstacleCollision(-3, -2.2, 0), false);
});


test('jump height clears spikes only above the configured clearance threshold', () => {
  assert.equal(isObstacleCollision(-3, -3, .94), true);
  assert.equal(isObstacleCollision(-3, -3, .95), false);
});

test('small vertical forgiveness prevents a grazing obstacle collision', () => {
  assert.equal(isObstacleCollision(-3, -3, .9, { clearanceHeight: .95, verticalForgiveness: .1 }), false);
  assert.equal(isObstacleCollision(-3, -3, .82, { clearanceHeight: .95, verticalForgiveness: .1 }), true);
});
test('level progress stays within zero and one hundred percent', () => {
  assert.equal(levelProgressPercent(-1, 80), 0);
  assert.equal(levelProgressPercent(40, 80), 50);
  assert.equal(levelProgressPercent(90, 80), 100);
});

test('gaps remove ground support, while platforms provide a bridge or raised landing surface', () => {
  const hole = [{ center: -3, width: 3 }];
  assert.equal(getTrackSupportHeight(-3, -1.7, hole, []), null);
  assert.equal(getTrackSupportHeight(-3, -1.7, hole, [{ center: -3, width: 4, height: 0 }]), -1.7);
  assert.equal(getTrackSupportHeight(-3, -1.7, [], [{ center: -3, width: 4, height: .45 }]), -1.25);
});

test('portals expose distinct supported effects for movement and hazard defense', () => {
  assert.ok(portalEffects.spring.jumpVelocity > 8.3);
  assert.ok(portalEffects.dash.speedMultiplier > 1);
  assert.ok(portalEffects.float.gravityMultiplier < 1);
  assert.equal(portalEffects.shield.shieldCharges, 1);
  assert.ok(portalEffects.phase.duration > 0);
});

test('crawler stomps accept a small apex grace but reject high-speed upward contacts', () => {
  assert.equal(shouldStompEnemy(1.1, -2), true);
  assert.equal(shouldStompEnemy(.5, -2), false);
  assert.equal(shouldStompEnemy(1.2, 2), false);
  assert.equal(shouldStompEnemy(.84, .4), true);
  assert.equal(shouldStompEnemy(.84, .8), false);
});

test('collectibles require the player to be close in both course and jump height', () => {
  assert.equal(isCollectibleContact(-3, -3.4, 1.6, 1.7), true);
  assert.equal(isCollectibleContact(-3, -3.8, 1.6, 1.7), false);
  assert.equal(isCollectibleContact(-3, -3.1, .1, 1.7), false);
  assert.equal(isCollectibleContact(-3, -3.1, 1.6, 1.7), true);
});

test('pause is distinct from a new, failed, or completed run', () => {
  assert.equal(isGamePaused({ started: true, running: false, dead: false, completed: false }), true);
  assert.equal(isGamePaused({ started: false, running: false, dead: false, completed: false }), false);
  assert.equal(isGamePaused({ started: true, running: false, dead: true, completed: false }), false);
  assert.equal(isGamePaused({ started: true, running: false, dead: false, completed: true }), false);
});

test('an initialized course is not spawned again when a run resumes', () => {
  assert.equal(shouldSpawnCourseFeatures(false), true);
  assert.equal(shouldSpawnCourseFeatures(true), false);
});

test('keyboard jump ignores repeated keydown events', () => {
  assert.equal(shouldAcceptJumpInput(false), true);
  assert.equal(shouldAcceptJumpInput(true), false);
});

test('jump intent received during deferred scene initialization is retained', () => {
  assert.equal(mergeJumpRequest(false, true), true);
  assert.equal(mergeJumpRequest(true, false), true);
  assert.equal(mergeJumpRequest(false, false), false);
  assert.equal(shouldApplyBufferedStartJump(true, true), true);
  assert.equal(shouldApplyBufferedStartJump(true, false), false);
});

test('vertical motion stays consistent across common render rates', () => {
  const outcomes = [30, 60, 120].map((rate) => {
    let position = 0;
    let velocity = jumpTuning.initialVelocity;
    const dt = 1 / rate;
    for (let step = 0; step < rate * .4; step++) {
      ({ position, velocity } = integrateVerticalMotion(position, velocity, 19, dt));
    }
    return { position, velocity };
  });
  for (const outcome of outcomes.slice(1)) {
    assert.ok(Math.abs(outcome.position - outcomes[0].position) < 1e-10);
    assert.ok(Math.abs(outcome.velocity - outcomes[0].velocity) < 1e-10);
  }
});
