export function isObstacleCollision(playerX, obstacleX, jumpHeight, options = {}) {
  const { horizontalRadius = .72, clearanceHeight = .95, verticalForgiveness = 0 } = options;
  const effectiveClearance = Math.max(0, clearanceHeight - verticalForgiveness);
  return Math.abs(obstacleX - playerX) < horizontalRadius && jumpHeight < effectiveClearance;
}

export function levelProgressPercent(distance, length) {
  if (!Number.isFinite(length) || length <= 0) return 0;
  return Math.max(0, Math.min(100, (distance / length) * 100));
}

export const PROGRESS_VERSION = 2;

const clampFraction = (value) => (
  Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0
);

const clampShards = (value) => (
  Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0
);

export function emptyProgress() {
  return { version: PROGRESS_VERSION, courses: {} };
}

// Storage is untrusted: anything may be there. Accept the current object, the old array of
// completed ids, or junk, and always return a fresh normalized v2 object.
export function parseProgress(raw) {
  let data = raw;
  if (typeof raw === 'string') {
    try {
      data = JSON.parse(raw);
    } catch {
      return emptyProgress();
    }
  }
  if (Array.isArray(data)) {
    const courses = {};
    for (const id of data) {
      if (typeof id === 'string' && id.length > 0) courses[id] = { cleared: true };
    }
    return { version: PROGRESS_VERSION, courses };
  }
  if (!data || typeof data !== 'object') return emptyProgress();
  const courses = {};
  const stored = data.courses;
  if (stored && typeof stored === 'object' && !Array.isArray(stored)) {
    for (const [id, entry] of Object.entries(stored)) {
      if (!id || !entry || typeof entry !== 'object' || Array.isArray(entry)) continue;
      courses[id] = {
        best: clampFraction(entry.best),
        shards: clampShards(entry.shards),
        cleared: entry.cleared === true,
      };
    }
  }
  return { version: PROGRESS_VERSION, courses };
}

// Runs only get better: the best distance, the shard count and the clear flag never regress.
export function mergeRunProgress(progress, levelId, run = {}) {
  const source = progress && typeof progress === 'object' && progress.courses && typeof progress.courses === 'object'
    ? progress.courses
    : {};
  const current = source[levelId] && typeof source[levelId] === 'object' ? source[levelId] : {};
  const entry = {
    best: Math.max(clampFraction(current.best), clampFraction(run.reached)),
    shards: Math.max(clampShards(current.shards), clampShards(run.shards)),
    cleared: current.cleared === true || run.cleared === true,
  };
  return {
    ...(progress && typeof progress === 'object' ? progress : {}),
    version: PROGRESS_VERSION,
    courses: { ...source, [levelId]: entry },
  };
}

export function courseMedal(entry, level) {
  if (!entry || entry.cleared !== true) return null;
  const totalShards = Array.isArray(level?.collectibles) ? level.collectibles.length : 0;
  if (totalShards > 0 && clampShards(entry.shards) >= totalShards) return 'silver';
  return 'bronze';
}

// The finish gate is authored at the same course distance as the run-ending check, so the
// player reaches it exactly when `distance` reaches `level.length`.
export function finishGateDistance(level) {
  return level.length;
}

export const platformTuning = Object.freeze({ maxStepHeight: .6, landingTolerance: .08 });

export const motionTuning = Object.freeze({
  gravity: 27,
  fallGravityMultiplier: 1.45,
  fallLimit: 1.65,
  groundSnapTolerance: .05,
  groundLostThreshold: .05,
  landingTolerance: platformTuning.landingTolerance,
});

// Asymmetric gravity: a brisk rise, then a faster fall. The multiplier is chosen
// from the vertical velocity at the start of the step, so a jump that crosses
// its apex inside one step changes regime only on the next step.
export function gravityForStep(velocityY, gravityMultiplier = 1) {
  const base = velocityY > 0
    ? motionTuning.gravity
    : motionTuning.gravity * motionTuning.fallGravityMultiplier;
  return base * gravityMultiplier;
}

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

export const portalCopy = Object.freeze({
  spring: Object.freeze({ name: 'SPRING', effect: 'HIGHER JUMP', announcement: 'Spring: higher jump.' }),
  dash: Object.freeze({ name: 'DASH', effect: 'FASTER FOR 2 s', announcement: 'Dash: faster for two seconds.' }),
  float: Object.freeze({ name: 'FLOAT', effect: 'LOW GRAVITY', announcement: 'Float: low gravity.' }),
  shield: Object.freeze({ name: 'SHIELD', effect: 'BLOCKS ONE HIT', announcement: 'Shield: blocks one hit.' }),
  phase: Object.freeze({ name: 'PHASE', effect: 'PASS THROUGH', announcement: 'Phase: pass through hazards.' }),
});

export function portalLabel(type) {
  return Object.hasOwn(portalCopy, type) ? portalCopy[type] : portalCopy.phase;
}

export const jumpTuning = Object.freeze({
  initialVelocity: 10,
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

/**
 * @param {{ x:number, y:number, velocityY:number, grounded:boolean, coyoteTimer:number }} player
 * @param {number} dt
 * @param {{ baseHeight:number, gaps:Array, platforms:Array }} course
 * @param {{ gravityMultiplier?:number }} [options]
 * @returns {{ y:number, velocityY:number, grounded:boolean, coyoteTimer:number,
 *             supportY:number, steppedUp:boolean, landed:boolean, fell:boolean }}
 */
export function stepPlayerMotion(player, dt, course, options = {}) {
  let { y, velocityY, grounded, coyoteTimer } = player;
  const { baseHeight, gaps, platforms } = course;
  const wasGrounded = grounded;
  let steppedUp = false;
  let landed = false;

  const stepSurface = findStepSurface(player.x, y, grounded, baseHeight, platforms);
  if (stepSurface !== null) {
    y = stepSurface;
    velocityY = 0;
    grounded = true;
    coyoteTimer = jumpTuning.coyoteSeconds;
    steppedUp = true;
  }
  const supportHeight = getTrackSupportHeight(player.x, y, baseHeight, gaps, platforms);
  const supportY = supportHeight ?? baseHeight;
  const previousY = y;

  if (grounded && supportHeight !== null && y <= supportHeight + motionTuning.groundSnapTolerance) {
    y = supportHeight;
    velocityY = 0;
    coyoteTimer = jumpTuning.coyoteSeconds;
  } else {
    if (wasGrounded && (supportHeight === null || supportHeight < y - motionTuning.groundLostThreshold)) {
      coyoteTimer = jumpTuning.coyoteSeconds;
    }
    if (grounded && (supportHeight === null || supportHeight < y - motionTuning.groundLostThreshold)) grounded = false;
    const gravity = gravityForStep(velocityY, options.gravityMultiplier ?? 1);
    const nextMotion = integrateVerticalMotion(y, velocityY, gravity, dt);
    y = nextMotion.position;
    velocityY = nextMotion.velocity;
    if (supportHeight !== null && velocityY <= 0 && y <= supportHeight && previousY >= supportHeight - motionTuning.landingTolerance) {
      y = supportHeight;
      velocityY = 0;
      grounded = true;
      coyoteTimer = jumpTuning.coyoteSeconds;
      landed = true;
    }
  }
  if (supportHeight === null) grounded = false;

  return {
    y,
    velocityY,
    grounded,
    coyoteTimer,
    supportY,
    steppedUp,
    landed,
    fell: y < baseHeight - motionTuning.fallLimit,
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
