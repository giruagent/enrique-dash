import test from 'node:test';
import assert from 'node:assert/strict';
import { jumpTuning, motionTuning, stepPlayerMotion } from './game-logic.js';

const STEP = 1 / 60;
const BASE_HEIGHT = 0;

function makePlayer(overrides = {}) {
  return {
    x: 0,
    y: BASE_HEIGHT,
    velocityY: 0,
    grounded: true,
    coyoteTimer: 0,
    ...overrides,
  };
}

function makeCourse(overrides = {}) {
  return {
    baseHeight: BASE_HEIGHT,
    gaps: [],
    platforms: [],
    ...overrides,
  };
}

function advance(player, course, options) {
  return { ...player, ...stepPlayerMotion(player, STEP, course, options) };
}

function simulateJump(gravityMultiplier = 1) {
  const course = makeCourse();
  let player = makePlayer({ velocityY: jumpTuning.initialVelocity, grounded: false });
  let apex = player.y;
  let airTime = null;
  let landingCount = 0;

  for (let frame = 1; frame <= 240; frame++) {
    player = advance(player, course, { gravityMultiplier });
    apex = Math.max(apex, player.y);
    if (player.landed) {
      landingCount++;
      airTime ??= frame * STEP;
    }
  }

  return { ...player, apex, airTime, landingCount };
}

test('standing on flat ground preserves support and does not fall', () => {
  const result = stepPlayerMotion(makePlayer(), STEP, makeCourse());
  assert.equal(result.y, BASE_HEIGHT);
  assert.equal(result.supportY, BASE_HEIGHT);
  assert.equal(result.grounded, true);
  assert.equal(result.fell, false);
});

function ballisticJump() {
  const riseTime = jumpTuning.initialVelocity / motionTuning.gravity;
  const apex = jumpTuning.initialVelocity ** 2 / (2 * motionTuning.gravity);
  const fallTime = Math.sqrt((2 * apex) / (motionTuning.gravity * motionTuning.fallGravityMultiplier));
  return { riseTime, apex, fallTime, airTime: riseTime + fallTime };
}

test('the jump constants describe a brisk rise and a faster fall at the same apex', () => {
  assert.equal(jumpTuning.initialVelocity, 10);
  assert.equal(motionTuning.gravity, 27);
  assert.equal(motionTuning.fallGravityMultiplier, 1.45);
  const { riseTime, apex, fallTime, airTime } = ballisticJump();
  assert.ok(Math.abs(apex - 1.85) < .01);
  assert.ok(Math.abs(riseTime - .37) < .01);
  assert.ok(Math.abs(fallTime - .31) < .01);
  assert.ok(Math.abs(airTime - .68) < .01);
  assert.ok(airTime < 0.895 * .8);
});

test('a jump reaches the expected apex and lands exactly once at ground level', () => {
  const result = simulateJump();
  const { apex } = ballisticJump();
  assert.ok(Math.abs(result.apex - apex) <= apex * .05);
  assert.equal(result.y, BASE_HEIGHT);
  assert.equal(result.grounded, true);
  assert.equal(result.landingCount, 1);
});

test('jump air time matches the asymmetric ballistic prediction', () => {
  const result = simulateJump();
  const { airTime } = ballisticJump();
  assert.ok(Math.abs(result.airTime - airTime) <= airTime * .05);
});

test('the fall phase uses 1.45 times gravity and takes about a fifth less time than the rise', () => {
  const { riseTime, fallTime } = ballisticJump();
  assert.ok(Math.abs(fallTime / riseTime - 1 / 1.2) < .01);
  assert.ok(fallTime < riseTime);

  const rising = stepPlayerMotion(
    makePlayer({ y: 10, velocityY: 1, grounded: false }),
    STEP,
    makeCourse(),
  );
  const falling = stepPlayerMotion(
    makePlayer({ y: 10, velocityY: -1, grounded: false }),
    STEP,
    makeCourse(),
  );
  const riseDrop = 1 - rising.velocityY;
  const fallDrop = -1 - falling.velocityY;
  assert.ok(Math.abs(riseDrop - motionTuning.gravity * STEP) < 1e-9);
  assert.ok(Math.abs(fallDrop - motionTuning.gravity * motionTuning.fallGravityMultiplier * STEP) < 1e-9);
  assert.ok(Math.abs(fallDrop / riseDrop - motionTuning.fallGravityMultiplier) < 1e-9);
});

test('grounded motion steps onto a half-unit platform and drops back to ground', () => {
  const course = makeCourse({ platforms: [{ center: 0, width: 2, height: .5 }] });
  const stepped = stepPlayerMotion(makePlayer(), STEP, course);
  assert.equal(stepped.steppedUp, true);
  assert.equal(stepped.y, BASE_HEIGHT + .5);

  let player = { ...makePlayer(), ...stepped, x: 2 };
  let leftGround = false;
  for (let frame = 0; frame < 120; frame++) {
    player = advance(player, course);
    if (!player.grounded) leftGround = true;
  }
  assert.equal(leftGround, true);
  assert.equal(player.y, BASE_HEIGHT);
  assert.equal(player.grounded, true);
});

test('a high platform overhead neither steps up nor kills a grounded player', () => {
  const course = makeCourse({ platforms: [{ center: 0, width: 2, height: 1.5 }] });
  const result = stepPlayerMotion(makePlayer(), STEP, course);
  assert.equal(result.steppedUp, false);
  assert.equal(result.fell, false);
  assert.equal(result.supportY, BASE_HEIGHT);
});

test('walking over a gap clears grounding and crosses the fall limit', () => {
  const course = makeCourse({ gaps: [{ center: 0, width: 2 }] });
  let player = advance(makePlayer(), course);
  assert.equal(player.grounded, false);

  let previousY = player.y;
  for (let frame = 0; frame < 120 && !player.fell; frame++) {
    previousY = player.y;
    player = advance(player, course);
  }
  const fallLimit = BASE_HEIGHT - motionTuning.fallLimit;
  assert.equal(player.fell, true);
  assert.ok(previousY >= fallLimit);
  assert.ok(player.y < fallLimit);
});

test('falling from two units above lands on the platform surface', () => {
  const surface = BASE_HEIGHT + .5;
  const course = makeCourse({ platforms: [{ center: 0, width: 2, height: .5 }] });
  let player = makePlayer({ y: BASE_HEIGHT + 2, grounded: false });
  for (let frame = 0; frame < 120 && !player.landed; frame++) {
    player = advance(player, course);
  }
  assert.equal(player.landed, true);
  assert.equal(player.y, surface);
  assert.equal(player.grounded, true);
});

test('float-portal gravity extends jump air time by the expected ratio', () => {
  const normal = simulateJump();
  const floating = simulateJump(.58);
  const expectedRatio = 1 / .58;
  const actualRatio = floating.airTime / normal.airTime;
  assert.ok(Math.abs(actualRatio - expectedRatio) <= expectedRatio * .15);
});
