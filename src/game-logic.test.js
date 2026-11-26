import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { canConsumeJumpBuffer, findStepSurface, getHazardProfile, getTrackSupportHeight, integrateVerticalMotion, isCollectibleContact, isGamePaused, isObstacleCollision, jumpTuning, levelProgressPercent, mergeJumpRequest, portalEffects, shouldAcceptJumpInput, shouldApplyBufferedStartJump, shouldHandleGameplayKey, shouldSpawnCourseFeatures, shouldStompEnemy } from './game-logic.js';

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => (
    entry.isDirectory()
      ? sourceFiles(new URL(`${entry.name}/`, directory))
      : [new URL(entry.name, directory)]
  ));
}

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
  assert.equal(getTrackSupportHeight(-3, -1.7, -1.7, hole, []), null);
  assert.equal(getTrackSupportHeight(-3, -1.7, -1.7, hole, [{ center: -3, width: 4, height: 0 }]), -1.7);
  assert.equal(getTrackSupportHeight(-3, -1.25, -1.7, [], [{ center: -3, width: 4, height: .45 }]), -1.25);
});

for (const height of [.4, .45, .5, .55]) {
  test(`a grounded player steps up onto a real ${height}-unit platform`, () => {
    const baseHeight = -1.7;
    const platforms = [{ center: -3, width: 4, height }];
    assert.equal(findStepSurface(-3, baseHeight, true, baseHeight, platforms), baseHeight + height);
  });
}

test('a grounded player does not step up when the rise exceeds maxStepHeight', () => {
  const baseHeight = -1.7;
  const platforms = [{ center: -3, width: 4, height: 1.5 }];
  assert.equal(findStepSurface(-3, baseHeight, true, baseHeight, platforms), null);
  assert.equal(getTrackSupportHeight(-3, baseHeight, baseHeight, [], platforms), baseHeight);
});

test('an airborne player does not step up onto a platform', () => {
  const baseHeight = -1.7;
  const platforms = [{ center: -3, width: 4, height: .45 }];
  assert.equal(findStepSurface(-3, baseHeight, false, baseHeight, platforms), null);
});

test('landing from above still returns the platform surface as support', () => {
  const platforms = [{ center: -3, width: 4, height: .45, currentHeight: .5 }];
  assert.equal(getTrackSupportHeight(-3, -1.1, -1.7, [], platforms), -1.2);
});

test('a player under a platform over solid ground is supported by the ground', () => {
  const baseHeight = -1.7;
  const platforms = [{ center: -3, width: 4, height: .45 }];
  assert.equal(getTrackSupportHeight(-3, baseHeight, baseHeight, [], platforms), baseHeight);
});

test('a grounded player under a platform over a gap steps up onto the bridge', () => {
  const baseHeight = -1.7;
  const hole = [{ center: -3, width: 3 }];
  const platforms = [{ center: -3, width: 4, height: .45 }];
  const stepSurface = findStepSurface(-3, baseHeight, true, baseHeight, platforms);
  assert.equal(stepSurface, -1.25);
  assert.equal(getTrackSupportHeight(-3, stepSurface, baseHeight, hole, platforms), stepSurface);
});

test('an airborne player under a platform over a gap has null support', () => {
  const baseHeight = -1.7;
  const hole = [{ center: -3, width: 3 }];
  const platforms = [{ center: -3, width: 4, height: .45 }];
  assert.equal(getTrackSupportHeight(-3, baseHeight, baseHeight, hole, platforms), null);
});

test('the obsolete platform crash message is absent from all source files', () => {
  const removedMessage = ['Missed the', 'platform.'].join(' ');
  for (const file of sourceFiles(new URL('./', import.meta.url))) {
    assert.equal(readFileSync(file, 'utf8').includes(removedMessage), false, file.pathname);
  }
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

test('gameplay keys are ignored before a run when the game is unfocused', () => {
  for (const code of ['Space', 'ArrowUp', 'KeyW']) {
    assert.equal(shouldHandleGameplayKey({ code, repeat: false, running: false, gameFocused: false, interactiveTarget: false }), false);
  }
});

test('gameplay keys are handled during a run without game focus', () => {
  assert.equal(shouldHandleGameplayKey({ code: 'Space', repeat: false, running: true, gameFocused: false, interactiveTarget: false }), true);
});

test('gameplay keys are handled while paused when the game has focus', () => {
  assert.equal(shouldHandleGameplayKey({ code: 'ArrowUp', repeat: false, running: false, gameFocused: true, interactiveTarget: false }), true);
});

test('gameplay keys are ignored for interactive targets', () => {
  assert.equal(shouldHandleGameplayKey({ code: 'KeyW', repeat: false, running: true, gameFocused: true, interactiveTarget: true }), false);
});

test('unrelated keys are not handled as gameplay input', () => {
  assert.equal(shouldHandleGameplayKey({ code: 'KeyM', repeat: false, running: true, gameFocused: true, interactiveTarget: false }), false);
});

test('repeated gameplay keydown events still pass the gameplay key guard', () => {
  assert.equal(shouldHandleGameplayKey({ code: 'Space', repeat: true, running: true, gameFocused: false, interactiveTarget: false }), true);
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
