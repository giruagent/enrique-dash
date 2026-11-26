export function isObstacleCollision(playerX, obstacleX, jumpHeight, options = {}) {
  const { horizontalRadius = .72, clearanceHeight = .95, verticalForgiveness = 0 } = options;
  const effectiveClearance = Math.max(0, clearanceHeight - verticalForgiveness);
  return Math.abs(obstacleX - playerX) < horizontalRadius && jumpHeight < effectiveClearance;
}

export function levelProgressPercent(distance, length) {
  if (!Number.isFinite(length) || length <= 0) return 0;
  return Math.max(0, Math.min(100, (distance / length) * 100));
}

export const platformTuning = Object.freeze({ maxStepHeight: .6, landingTolerance: .08 });

// Returns the surface the player should step up onto, or null.
export function findStepSurface(playerX, playerY, grounded, baseHeight, platforms, maxStepHeight = platformTuning.maxStepHeight) {
  if (!grounded) return null;
  let stepSurface = null;
  for (const { center, width, height, currentHeight } of platforms) {
    if (Math.abs(playerX - center) > width / 2) continue;
    const surface = baseHeight + (currentHeight ?? height);
    if (surface <= playerY || surface - playerY > maxStepHeight) continue;
    if (stepSurface === null || surface > stepSurface) stepSurface = surface;
  }
  return stepSurface;
}

// Layered support: highest platform surface at or below the feet, else the ground,
// else null when the player is over a gap.
export function getTrackSupportHeight(playerX, playerY, baseHeight, gaps, platforms, tolerance = .05) {
  let supportHeight = null;
  for (const { center, width, height, currentHeight } of platforms) {
    if (Math.abs(playerX - center) > width / 2) continue;
    const surface = baseHeight + (currentHeight ?? height);
    if (surface > playerY + tolerance) continue;
    if (supportHeight === null || surface > supportHeight) supportHeight = surface;
  }
  if (supportHeight !== null) return supportHeight;
  const hole = gaps.find(({ center, width }) => Math.abs(playerX - center) <= width / 2);
  return hole ? null : baseHeight;
}

export const portalEffects = Object.freeze({
  spring: Object.freeze({ jumpVelocity: 10.8 }),
  dash: Object.freeze({ speedMultiplier: 1.24, duration: 2.2 }),
  float: Object.freeze({ gravityMultiplier: .58, duration: 2.8 }),
  shield: Object.freeze({ shieldCharges: 1 }),
  phase: Object.freeze({ duration: 2.4 }),
});

export const jumpTuning = Object.freeze({
  initialVelocity: 8.5,
  inputBufferSeconds: .14,
  coyoteSeconds: .12,
  obstacleVerticalForgiveness: .08,
  stompMinimumHeight: .82,
  stompUpwardVelocityLimit: .65,
});

export function canConsumeJumpBuffer(grounded, coyoteTime, jumpBufferTime) {
  return jumpBufferTime > 0 && (grounded || coyoteTime > 0);
}

export function isGamePaused({ started = false, running = false, dead = false, completed = false } = {}) {
  return started && !running && !dead && !completed;
}

export function shouldSpawnCourseFeatures(started) {
  return !started;
}

export function shouldAcceptJumpInput(repeat) {
  return !repeat;
}

export function shouldHandleGameplayKey({ code, repeat, running, gameFocused, interactiveTarget }) {
  return ['Space', 'ArrowUp', 'KeyW'].includes(code)
    && !interactiveTarget
    && Boolean(running || gameFocused);
}

export function mergeJumpRequest(pending, requested) {
  return pending || requested;
}

export function shouldApplyBufferedStartJump(requested, grounded) {
  return requested && grounded;
}

export function integrateVerticalMotion(position, velocity, gravity, deltaSeconds) {
  return {
    position: position + velocity * deltaSeconds - .5 * gravity * deltaSeconds ** 2,
    velocity: velocity - gravity * deltaSeconds,
  };
}

const hazardProfiles = Object.freeze({
  spike: Object.freeze({ shape: 'spike', width: 1.14, height: .95, clearanceHeight: .95 }),
  vent: Object.freeze({ shape: 'cylinder', width: .82, height: .82, clearanceHeight: .82 }),
  'solar-panel': Object.freeze({ shape: 'panel', width: 1.2, height: .48, clearanceHeight: .48 }),
  vine: Object.freeze({ shape: 'vine', width: .9, height: 1.05, clearanceHeight: 1.05 }),
  'pixel-block': Object.freeze({ shape: 'block', width: .86, height: .9, clearanceHeight: .9 }),
  'circuit-beam': Object.freeze({ shape: 'beam', width: 1.35, height: .16, offsetY: 1.05, clearanceHeight: 1.15 }),
  'candy-cane': Object.freeze({ shape: 'cane', width: .72, height: 1.05, clearanceHeight: 1.05 }),
  coral: Object.freeze({ shape: 'coral', width: .92, height: .85, clearanceHeight: .85 }),
  'crystal-beam': Object.freeze({ shape: 'beam', width: 1.5, height: .16, offsetY: 1.1, clearanceHeight: 1.2 }),
  'storm-debris': Object.freeze({ shape: 'debris', width: 1.05, height: .9, clearanceHeight: .9 }),
  asteroid: Object.freeze({ shape: 'asteroid', width: 1, height: .86, clearanceHeight: .86 }),
  'moss-stump': Object.freeze({ shape: 'stump', width: .84, height: .72, clearanceHeight: .72 }),
  'gear-fruit': Object.freeze({ shape: 'gear', width: .96, height: .9, clearanceHeight: .9 }),
  'foundry-pipe': Object.freeze({ shape: 'pipe', width: .9, height: .8, clearanceHeight: .8 }),
  'paper-banner': Object.freeze({ shape: 'banner', width: 1.3, height: .22, offsetY: 1.05, clearanceHeight: 1.2 }),
  thorn: Object.freeze({ shape: 'thorn', width: .9, height: 1.1, clearanceHeight: 1.1 }),
  'glass-shard': Object.freeze({ shape: 'shard', width: .92, height: 1.05, clearanceHeight: 1.05 }),
  cloudstone: Object.freeze({ shape: 'block', width: 1.05, height: .78, clearanceHeight: .78 }),
  'magnetic-core': Object.freeze({ shape: 'debris', width: 1.06, height: .92, clearanceHeight: .92 }),
  corona: Object.freeze({ shape: 'corona', width: 1.18, height: .96, clearanceHeight: .96 }),
});

export function getHazardProfile(style = 'spike') {
  return hazardProfiles[style] ?? hazardProfiles.spike;
}

export function shouldStompEnemy(
  playerHeight,
  velocityY,
  minimumHeight = jumpTuning.stompMinimumHeight,
  upwardVelocityLimit = jumpTuning.stompUpwardVelocityLimit,
) {
  return velocityY <= upwardVelocityLimit && playerHeight >= minimumHeight;
}

export function isCollectibleContact(playerX, collectibleX, playerHeight, collectibleHeight, options = {}) {
  const { horizontalRadius = .7, verticalRadius = .95 } = options;
  if (![playerX, collectibleX, playerHeight, collectibleHeight].every(Number.isFinite)) return false;
  return Math.abs(playerX - collectibleX) < horizontalRadius
    && Math.abs(playerHeight - collectibleHeight) <= verticalRadius;
}
