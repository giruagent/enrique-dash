import { pathToFileURL } from 'node:url';
import {
  getEnemyProfile,
  getObstacleProfile,
  isCollectibleContact,
  isObstacleCollision,
  jumpTuning,
  motionTuning,
  portalEffects,
  shouldStompEnemy,
  stepPlayerMotion,
} from '../src/game-logic.js';
import { campaigns, getLevelById } from '../src/campaigns.js';
import {
  beatWindows,
  ENEMY_HORIZONTAL_RADIUS,
  jumpReach,
  OBSTACLE_HORIZONTAL_PADDING,
  OBSTACLE_SPACING,
  PORTAL_TRIGGER_RADIUS,
} from './level-physics.mjs';

export const FIXED_STEP = 1 / 120;
const BASE_HEIGHT = 0;
const PLAYER_HEIGHT = 1.35;
const DRONE_BOB = .16;
const HOVER_BOB = .1;

function prepareLevel(level) {
  const hazards = (level.obstacles ?? []).flatMap((group, groupIndex) => {
    const [at, count] = group;
    const profile = getObstacleProfile(level, group);
    return Array.from({ length: count }, (_, index) => ({
      id: `hazard-${groupIndex}.${index}`,
      group: groupIndex,
      at: at + index * OBSTACLE_SPACING,
      width: profile.width,
      clearanceHeight: profile.clearanceHeight,
    }));
  });
  const gaps = (level.gaps ?? []).map((gap, index) => ({
    ...gap,
    id: `gap-${index}`,
    center: gap.at + gap.width / 2,
  }));
  const platforms = (level.platforms ?? []).map((platform, index) => ({
    ...platform,
    id: `platform-${index}`,
    height: platform.height ?? 0,
    center: platform.at + platform.width / 2,
    currentHeight: platform.height ?? 0,
    bob: platform.kind === 'hover' ? HOVER_BOB : 0,
    phase: (platform.at - 3 + platform.width / 2) * .17,
  }));
  const portals = (level.portals ?? []).map((portal, index) => ({ ...portal, id: `portal-${index}` }));
  const enemies = (level.enemies ?? []).map((enemy, index) => {
    const profile = getEnemyProfile(enemy.type);
    return {
      ...enemy,
      id: `enemy-${index}`,
      height: profile.height,
      centerHeight: profile.stompable ? profile.height / 2 : (enemy.height ?? profile.altitude),
      phase: (enemy.at - 3) * .11,
    };
  });
  const collectibles = (level.collectibles ?? []).map((collectible, index) => ({
    ...collectible,
    id: `collectible-${index}`,
    height: collectible.height ?? 1.7,
  }));
  return {
    hazards,
    gaps,
    platforms,
    portals,
    enemies,
    collectibles,
    course: { baseHeight: BASE_HEIGHT, gaps, platforms },
  };
}

function initialState() {
  return {
    distance: 0,
    y: BASE_HEIGHT,
    velocityY: 0,
    grounded: true,
    effects: { dashTimer: 0, gravityTimer: 0, shieldCharges: 0, phaseTimer: 0 },
    coyoteTimer: 0,
    supportY: BASE_HEIGHT,
    time: 0,
    triggeredPortals: new Set(),
  };
}

function cloneState(state) {
  return {
    ...state,
    effects: { ...state.effects },
    triggeredPortals: new Set(state.triggeredPortals),
  };
}

function currentSpeed(level, state) {
  return level.speed * (state.effects.dashTimer > 0 ? portalEffects.dash.speedMultiplier : 1);
}

function applyPortal(state, portal) {
  const effect = portalEffects[portal.type];
  if (portal.type === 'spring') {
    state.velocityY = Math.max(state.velocityY, effect.jumpVelocity);
    state.grounded = false;
    state.coyoteTimer = 0;
  } else if (portal.type === 'dash') {
    state.effects.dashTimer = effect.duration;
  } else if (portal.type === 'float') {
    state.effects.gravityTimer = effect.duration;
  } else if (portal.type === 'shield') {
    state.effects.shieldCharges = effect.shieldCharges;
  } else if (portal.type === 'phase') {
    state.effects.phaseTimer = effect.duration;
  }
}

// One browser-style update: timers, horizontal movement, animated geometry,
// portals, then the shared vertical/support motion helper.
function advanceMotion(state, level, prepared, events) {
  state.time += FIXED_STEP;
  state.coyoteTimer = Math.max(0, state.coyoteTimer - FIXED_STEP);
  for (const key of ['dashTimer', 'gravityTimer', 'phaseTimer']) {
    state.effects[key] = Math.max(0, state.effects[key] - FIXED_STEP);
  }

  state.distance += currentSpeed(level, state) * FIXED_STEP;

  for (const platform of prepared.platforms) {
    platform.currentHeight = platform.height + Math.sin(state.time * 2 + platform.phase) * platform.bob;
  }
  for (const enemy of prepared.enemies) {
    enemy.currentHeight = enemy.centerHeight;
    if (enemy.type === 'drone') {
      enemy.currentHeight += Math.sin(state.time * 2.2 + enemy.phase) * DRONE_BOB;
    }
  }

  for (const portal of prepared.portals) {
    if (state.triggeredPortals.has(portal.id)) continue;
    if (Math.abs(portal.at - state.distance) > PORTAL_TRIGGER_RADIUS) continue;
    state.triggeredPortals.add(portal.id);
    applyPortal(state, portal);
    events?.push({ type: 'portal', portal: portal.type, id: portal.id, at: state.distance, time: state.time });
  }

  const motion = stepPlayerMotion({
    x: state.distance,
    y: state.y,
    velocityY: state.velocityY,
    grounded: state.grounded,
    coyoteTimer: state.coyoteTimer,
  }, FIXED_STEP, prepared.course, {
    gravityMultiplier: state.effects.gravityTimer > 0 ? portalEffects.float.gravityMultiplier : 1,
  });
  Object.assign(state, motion);
  return motion;
}

function jumpNow(state) {
  state.velocityY = jumpTuning.initialVelocity;
  state.grounded = false;
  state.coyoteTimer = 0;
}

function predictedJumpClears(originalState, level, prepared, windows) {
  const state = cloneState(originalState);
  jumpNow(state);
  const progress = windows.map((window) => ({ window, entered: false, cleared: false }));

  for (let step = 0; step < 2000; step++) {
    const motion = advanceMotion(state, level, prepared);
    for (const target of progress) {
      if (target.cleared) continue;
      const { window } = target;
      const inside = state.distance >= window.start && state.distance <= window.end;
      if (inside) {
        target.entered = true;
        const jumpHeight = state.y - state.supportY;
        if (jumpHeight < window.clearance) return false;
      }
      if (!target.entered && state.grounded && state.distance < window.start) return false;
      if (state.distance > window.end) {
        if (!target.entered) return false;
        target.cleared = true;
      }
    }
    if (motion.fell) return false;
    if (progress.every((target) => target.cleared)) return true;
  }
  return false;
}

function latestSafeDistance(state, level, window) {
  const relativeClearance = Math.max(0, window.clearance - (state.y - state.supportY));
  if (relativeClearance === 0) return window.start;
  const gravity = motionTuning.gravity * (state.effects.gravityTimer > 0 ? portalEffects.float.gravityMultiplier : 1);
  const discriminant = jumpTuning.initialVelocity ** 2 - 2 * gravity * relativeClearance;
  if (discriminant < 0) return -Infinity;
  const ascendingTime = (jumpTuning.initialVelocity - Math.sqrt(discriminant)) / gravity;
  return window.start - currentSpeed(level, state) * ascendingTime;
}

function nextUnavoidableGroup(windows, distance) {
  const firstIndex = windows.findIndex((window) => window.unavoidable && window.end >= distance);
  if (firstIndex < 0) return [];
  const first = windows[firstIndex];
  if (first.requirement === 'grounded') return [first];
  const group = [first];
  let groupEnd = first.end;
  for (let index = firstIndex + 1; index < windows.length; index++) {
    const window = windows[index];
    if (!window.unavoidable || window.start > groupEnd) continue;
    if (window.requirement === 'grounded') return [first];
    group.push(window);
    groupEnd = Math.max(groupEnd, window.end);
  }
  return group;
}

function failureReasonForGap(prepared, distance) {
  const gap = prepared.gaps.find(({ at, width }) => distance >= at - .1 && distance <= at + width + .1);
  return gap ? `fell into ${gap.id} at course distance ${gap.at}` : 'fell below the course';
}

/** Play one deterministic attempt. No retries or collision relaxation are used. */
export function playLevel(level, { trace = false } = {}) {
  const prepared = prepareLevel(level);
  const windows = beatWindows(level);
  const state = initialState();
  const events = [];
  const samples = [];
  const removedHazards = new Set();
  const removedEnemies = new Set();
  const collected = new Set();
  let deaths = 0;
  let jumps = 0;
  let tightestMargin = Infinity;
  let completed = false;
  const maximumSteps = Math.ceil((level.length / level.speed * 4 + 30) / FIXED_STEP);

  for (let step = 0; step < maximumSteps && !completed && deaths === 0; step++) {
    if (state.grounded) {
      const group = nextUnavoidableGroup(windows, state.distance);
      const next = group[0];
      if (next && next.requirement !== 'grounded') {
        const withinReach = next.start - state.distance <= jumpReach(currentSpeed(level, state));
        if (withinReach && predictedJumpClears(state, level, prepared, group)) {
          const margin = Math.min(...group.map((window) => latestSafeDistance(state, level, window) - state.distance));
          tightestMargin = Math.min(tightestMargin, margin);
          jumpNow(state);
          jumps++;
          events.push({ type: 'jump', window: group.map(({ id }) => id).join('+'), at: state.distance, time: state.time, margin });
        }
      }
    }

    const motion = advanceMotion(state, level, prepared, events);
    if (trace) {
      // The exact shared-physics position of the runner this frame. Collectible arcs are sampled
      // from these frames, never from a modelled curve of their own.
      samples.push({
        time: state.time,
        at: state.distance,
        y: state.y,
        supportY: state.supportY,
        grounded: state.grounded,
        velocityY: state.velocityY,
      });
    }
    if (motion.steppedUp) events.push({ type: 'step-up', at: state.distance, time: state.time });
    if (motion.landed) events.push({ type: 'land', at: state.distance, time: state.time });
    if (motion.bounced) events.push({ type: 'bounce', at: state.distance, time: state.time });

    if (motion.fell) {
      deaths++;
      events.push({ type: 'death', reason: failureReasonForGap(prepared, state.distance), at: state.distance, time: state.time });
      break;
    }

    if (state.effects.phaseTimer <= 0) {
      for (let index = prepared.hazards.length - 1; index >= 0; index--) {
        const hazard = prepared.hazards[index];
        if (removedHazards.has(hazard.id)) continue;
        const collision = isObstacleCollision(state.distance, hazard.at, state.y - state.supportY, {
          horizontalRadius: hazard.width / 2 + OBSTACLE_HORIZONTAL_PADDING,
          clearanceHeight: hazard.clearanceHeight,
          verticalForgiveness: jumpTuning.obstacleVerticalForgiveness,
        });
        if (!collision) continue;
        if (state.effects.shieldCharges > 0) {
          state.effects.shieldCharges--;
          removedHazards.add(hazard.id);
          events.push({ type: 'shield', feature: hazard.id, at: state.distance, time: state.time });
          continue;
        }
        deaths++;
        events.push({
          type: 'death',
          reason: `${hazard.id} collision at course distance ${hazard.at} (height ${(state.y - state.supportY).toFixed(3)}, clearance ${Math.max(0, hazard.clearanceHeight - jumpTuning.obstacleVerticalForgiveness).toFixed(3)})`,
          feature: hazard.id,
          at: state.distance,
          time: state.time,
        });
        break;
      }
    }

    if (deaths === 0 && state.effects.phaseTimer <= 0) {
      for (const enemy of prepared.enemies) {
        if (removedEnemies.has(enemy.id)) continue;
        if (Math.abs(enemy.at - state.distance) >= ENEMY_HORIZONTAL_RADIUS) continue;
        const jumpHeight = state.y - state.supportY;
        if (getEnemyProfile(enemy.type).stompable && shouldStompEnemy(jumpHeight, state.velocityY)) {
          removedEnemies.add(enemy.id);
          events.push({ type: 'stomp', feature: enemy.id, at: state.distance, time: state.time });
          continue;
        }
        const enemyBottom = enemy.currentHeight - enemy.height / 2;
        const enemyTop = enemy.currentHeight + enemy.height / 2;
        const overlaps = state.y < enemyTop && state.y + PLAYER_HEIGHT > enemyBottom;
        if (!overlaps) continue;
        if (state.effects.shieldCharges > 0) {
          state.effects.shieldCharges--;
          removedEnemies.add(enemy.id);
          events.push({ type: 'shield', feature: enemy.id, at: state.distance, time: state.time });
          continue;
        }
        deaths++;
        events.push({
          type: 'death',
          reason: `${enemy.id} (${enemy.type}) collision at course distance ${enemy.at}`,
          feature: enemy.id,
          at: state.distance,
          time: state.time,
        });
        break;
      }
    }

    for (const shard of prepared.collectibles) {
      if (collected.has(shard.id)) continue;
      if (!isCollectibleContact(state.distance, shard.at, state.y, shard.height)) continue;
      collected.add(shard.id);
      events.push({ type: 'collectible', feature: shard.id, at: state.distance, time: state.time });
    }

    if (deaths === 0 && state.distance >= level.length) {
      completed = true;
      events.push({ type: 'complete', at: state.distance, time: state.time });
    }
  }

  if (!completed && deaths === 0) {
    deaths++;
    events.push({ type: 'death', reason: 'simulation step limit reached before the finish', at: state.distance, time: state.time });
  }

  return {
    completed,
    deaths,
    jumps,
    finishTime: state.time,
    tightestMargin: Number.isFinite(tightestMargin) ? tightestMargin : null,
    events,
    samples,
  };
}

export const autoPlay = playLevel;

function main(args) {
  const inlineCampaign = args.find((arg) => arg.startsWith('--campaign='));
  const campaignIndex = args.indexOf('--campaign');
  const campaignId = inlineCampaign
    ? inlineCampaign.slice('--campaign='.length) || 'core'
    : campaignIndex >= 0 ? (args[campaignIndex + 1] ?? 'core') : null;
  const ids = args.filter((arg, index) => (
    !arg.startsWith('--campaign')
    && !(campaignIndex >= 0 && index === campaignIndex + 1)
  ));
  let selected;
  if (campaignId) {
    const campaign = campaigns.find((item) => item.id === campaignId);
    if (!campaign) {
      console.log(`${campaignId}: FAILED | unknown campaign`);
      process.exitCode = 1;
      return;
    }
    selected = campaign.levels.map((level) => ({ id: level.id, level }));
  } else if (ids.length) {
    selected = ids.map((id) => ({ id, level: getLevelById(id) }));
  } else {
    selected = campaigns.flatMap((campaign) => campaign.levels.map((level) => ({ id: level.id, level })));
  }
  let failed = false;
  for (const { id, level } of selected) {
    if (!level) {
      console.log(`${id}: FAILED | unknown level id`);
      failed = true;
      continue;
    }
    const result = playLevel(level);
    const death = [...result.events].reverse().find(({ type }) => type === 'death');
    const margin = result.tightestMargin === null ? '—' : result.tightestMargin.toFixed(3);
    console.log(`${id}: ${result.completed ? 'completed' : 'FAILED'} | time ${result.finishTime.toFixed(3)}s | jumps ${result.jumps} | deaths ${result.deaths} | tightest margin ${margin}${death ? ` | ${death.reason}` : ''}`);
    if (!result.completed) failed = true;
  }
  if (failed) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main(process.argv.slice(2));
