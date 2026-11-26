import {
  getHazardProfile,
  jumpTuning,
  motionTuning,
  platformTuning,
  portalEffects,
} from '../src/game-logic.js';

export const OBSTACLE_SPACING = 1.28;
export const OBSTACLE_HORIZONTAL_PADDING = .15;
export const ENEMY_HORIZONTAL_RADIUS = .8;
export const PORTAL_TRIGGER_RADIUS = .62;

export function airTime() {
  return 2 * jumpTuning.initialVelocity / motionTuning.gravity;
}

export function jumpReach(speed) {
  return speed * airTime();
}

export function gapReach(speed) {
  return jumpReach(speed);
}

// Speed affects course timing, not jump height. Resolve dash expiration in the
// distance domain so report metrics use the speed at which a beat is reached.
export function courseSpeedTimeline(level) {
  const dashPortals = (level.portals ?? [])
    .filter(({ type }) => type === 'dash')
    .map(({ at }) => Math.max(0, at - PORTAL_TRIGGER_RADIUS))
    .sort((a, b) => a - b);

  let distance = 0;
  let time = 0;
  let dashRemaining = 0;
  let portalIndex = 0;

  function moveTo(target) {
    while (distance < target - 1e-9) {
      const speed = level.speed * (dashRemaining > 0 ? portalEffects.dash.speedMultiplier : 1);
      const boostedDistance = dashRemaining > 0 ? speed * dashRemaining : Infinity;
      const step = Math.min(target - distance, boostedDistance);
      const dt = step / speed;
      distance += step;
      time += dt;
      if (dashRemaining > 0) dashRemaining = Math.max(0, dashRemaining - dt);
    }
    distance = Math.max(distance, target);
  }

  function advance(target) {
    while (portalIndex < dashPortals.length && dashPortals[portalIndex] <= target) {
      moveTo(dashPortals[portalIndex]);
      dashRemaining = portalEffects.dash.duration;
      portalIndex++;
    }
    moveTo(target);
    return {
      time,
      speed: level.speed * (dashRemaining > 0 ? portalEffects.dash.speedMultiplier : 1),
      dashRemaining,
    };
  }

  return { advance };
}

function bridgesGap(platform, gap) {
  return platform.height <= platformTuning.maxStepHeight
    && platform.at <= gap.at
    && platform.at + platform.width >= gap.at + gap.width;
}

/**
 * Convert authored features into course-distance intervals. `start` and `end`
 * include the horizontal collision extent where appropriate; `at` is the
 * authored beat position used by the spacing report.
 */
export function beatWindows(level) {
  const windows = [];
  const platforms = level.platforms ?? [];
  const gaps = level.gaps ?? [];
  const timeline = courseSpeedTimeline(level);
  const timingAt = new Map();
  const positions = [
    ...(level.obstacles ?? []).map(([at]) => at),
    ...gaps.map(({ at }) => at),
    ...(level.enemies ?? []).map(({ at }) => at),
    ...platforms.map(({ at }) => at),
  ].sort((a, b) => a - b);
  for (const at of positions) {
    if (!timingAt.has(at)) timingAt.set(at, timeline.advance(at));
  }

  (level.obstacles ?? []).forEach(([at, count], index) => {
    const profile = getHazardProfile(level.hazardStyle);
    const radius = profile.width / 2 + OBSTACLE_HORIZONTAL_PADDING;
    const lastAt = at + (count - 1) * OBSTACLE_SPACING;
    const timing = timingAt.get(at);
    windows.push({
      id: `hazard-${index}`,
      kind: 'hazard',
      type: level.hazardStyle ?? 'spike',
      at,
      start: at - radius,
      end: lastAt + radius,
      courseStart: at,
      courseEnd: lastAt,
      count,
      requirement: 'airborne',
      unavoidable: true,
      clearance: Math.max(0, profile.clearanceHeight - jumpTuning.obstacleVerticalForgiveness),
      speed: timing.speed,
      reach: jumpReach(timing.speed),
    });
  });

  gaps.forEach((gap, index) => {
    const supportingPlatforms = platforms.filter((platform) => bridgesGap(platform, gap));
    const timing = timingAt.get(gap.at);
    windows.push({
      id: `gap-${index}`,
      kind: 'gap',
      type: 'gap',
      at: gap.at,
      start: gap.at,
      end: gap.at + gap.width,
      courseStart: gap.at,
      courseEnd: gap.at + gap.width,
      width: gap.width,
      requirement: 'airborne',
      unavoidable: supportingPlatforms.length === 0,
      covered: supportingPlatforms.length > 0,
      clearance: 0,
      speed: timing.speed,
      reach: jumpReach(timing.speed),
    });
  });

  (level.enemies ?? []).forEach((enemy, index) => {
    const crawler = enemy.type === 'crawler';
    const radius = ENEMY_HORIZONTAL_RADIUS;
    const timing = timingAt.get(enemy.at);
    windows.push({
      id: `enemy-${index}`,
      kind: 'enemy',
      type: enemy.type,
      at: enemy.at,
      start: enemy.at - radius,
      end: enemy.at + radius,
      courseStart: enemy.at,
      courseEnd: enemy.at,
      requirement: crawler ? 'stomp' : 'airborne',
      unavoidable: true,
      clearance: crawler ? jumpTuning.stompMinimumHeight : (enemy.height ?? 1.12) + .34 + .16,
      speed: timing.speed,
      reach: jumpReach(timing.speed),
    });
  });

  platforms.forEach((platform, index) => {
    const timing = timingAt.get(platform.at);
    const supportedGaps = gaps.filter((gap) => bridgesGap(platform, gap));
    windows.push({
      id: `platform-${index}`,
      kind: 'platform',
      type: platform.kind ?? 'platform',
      at: platform.at,
      start: platform.at,
      end: platform.at + platform.width,
      courseStart: platform.at,
      courseEnd: platform.at + platform.width,
      width: platform.width,
      height: platform.height,
      requirement: 'grounded',
      unavoidable: supportedGaps.length > 0,
      bridge: supportedGaps.length > 0,
      clearance: platform.height,
      speed: timing.speed,
      reach: jumpReach(timing.speed),
    });
  });

  return windows.sort((a, b) => a.at - b.at || a.start - b.start || a.id.localeCompare(b.id));
}
