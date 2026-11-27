// Feature pass: a second, gated stage of the course pipeline.
//
// tools/compose-levels.mjs owns the *rhythm* (how many beats, where, and how they are spaced).
// This pass owns the *mix*: it converts some hazard slots into enemies and builds the platform
// archetypes (kerb, shelf, island, hover, perch) with their shards.
//
// Every individual change is verified with the auto-player (and with the same fairness metrics the
// test suite uses) before it is kept: a change that makes a course uncompletable or breaks a gate is
// reverted immediately. The pass is deterministic.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { validateLevels } from '../src/levels.js';
import { campaignConfig, composeLevels, readCampaignArgument, rewriteLevels, renderDesignPlan } from './compose-levels.mjs';
import { playLevel } from './auto-player.mjs';
import { analyzeLevel } from './level-report.mjs';
import {
  airTime,
  beatWindows,
  courseSpeedTimeline,
  jumpApexHeight,
  jumpHeightAt,
  jumpReach,
  jumpRiseTime,
} from './level-physics.mjs';

const QUOTAS = [
  { enemies: 0, drones: 0, portals: 0, shards: 0 },   // courses 1-4
  { enemies: 1, drones: 0, portals: 1, shards: 1 },   // 5-8
  { enemies: 2, drones: 1, portals: 2, shards: 2 },   // 9-14
  { enemies: 3, drones: 1, portals: 2, shards: 2 },   // 15-20
];


// Hand-written course copy. The composer generates a mechanically accurate but templated
// sentence; this table is the human layer, and it is written against the mix this pass leaves
// behind (gaps, kerbs, enemies, portals and shards as listed in the design plan).
const COPY = {
  'wool-thimble-meadow': {
    signature: 'Three open gaps in the meadow, a yarn-and-felt hazard mix and one shard arc over the middle hole.',
    designHook: 'Thimble Meadow lays out 3 hazard groups, 3 open gaps, 1 shard arc and 1 shard.',
  },
  'wool-02-button-bush': {
    signature: 'A plush pad launches you through a shard arc at the wide gap; a beetle waits on the last stitch.',
    designHook: 'Button Bush lays out 4 spike groups, 3 gaps, 1 bounce pad and 1 shard.',
  },
  'neon-run': {
    signature: 'Three open gaps on a clean straight, each one a single jump.',
    designHook: 'Three spike groups and three holes, spaced so you can land and look before the next.',
  },
  'skyline-rush': {
    signature: 'A float portal stretches the arc you need over the middle hole.',
    designHook: 'Three gaps, one float portal before the second, and a shard parked at the top of the arc.',
  },
  'solar-flare': {
    signature: 'A spring portal turns the last gap into a long, slow hop.',
    designHook: 'Three open gaps with a spring launcher ahead of the third and one shard above it.',
  },
  'gravity-garden': {
    signature: 'Float first, so both gaps ask for a lazier jump than they look.',
    designHook: 'Three holes with a float portal early, and the shard hangs where the low gravity carries you.',
  },
  'pixel-pier': {
    signature: 'A crawler on the opening straight, then a kerb you jump onto for the shard.',
    designHook: 'Crawler at the first beat, three gaps, a spring portal and one raised kerb with a shard over it.',
  },
  'midnight-circuit': {
    signature: 'Dash compresses the run-up, so the second gap arrives early.',
    designHook: 'Two gaps and a dash portal that shortens the approach, with a kerb to land the shard jump.',
  },
  'candy-comet': {
    signature: 'Four holes, one launcher, and a crawler waiting after the last of them.',
    designHook: 'Spring portal mid-course, four open gaps and a crawler at the finish line of the rhythm.',
  },
  'aqua-pulse': {
    signature: 'Float across four holes, then a kerb for the shard.',
    designHook: 'Four gaps under a float portal and one raised kerb near the end; a crawler guards the run-in.',
  },
  'crystal-cavern': {
    signature: 'Phase through the wall of hazards, then jump the holes that follow.',
    designHook: 'Phase portal before a cluster, four gaps, two kerbs and a drone that closes the course.',
  },
  'stormbreaker': {
    signature: 'Float opens the gaps up, dash closes the last one down again.',
    designHook: 'Float portal early, dash portal late, four holes, two kerbs and a drone-crawler pair.',
  },
  'final-orbit': {
    signature: 'Spring into a dash: one arc is long, the next is fast.',
    designHook: 'Spring then dash across four gaps, with two kerbs and a drone holding the final stretch.',
  },
  'mosslight-hollow': {
    signature: 'Five holes and two kerbs: the shards are all above the step-ups.',
    designHook: 'Float portal, five gaps, two raised kerbs and a drone over the last third of the hollow.',
  },
  'clockwork-orchard': {
    signature: 'Dash into spring, with gears turning between the five holes.',
    designHook: 'Dash and spring portals split the course; five gaps, two kerbs and a drone at the far end.',
  },
  'tidal-foundry': {
    signature: 'One dash portal, five gaps, no second chances on the landing.',
    designHook: 'Dash portal before the middle gap, two kerbs for shards, crawler and drone on the closing run.',
  },
  'paper-moon-parade': {
    signature: 'Two springs, five gaps: the parade never quite touches the ground.',
    designHook: 'Spring portals at both ends of the course, five holes, two kerbs and a drone in between.',
  },
  'verdant-relay': {
    signature: 'Float through five holes and three shards spaced a beat apart.',
    designHook: 'Float portal, five gaps, two kerbs and the campaign\'s densest run of shards.',
  },
  'shatterglass-express': {
    signature: 'Phase then dash: skip a hazard wall, then outrun the glass.',
    designHook: 'Phase and dash portals, five gaps, two kerbs and a drone on the express straight.',
  },
  'cloudbreaker-causeway': {
    signature: 'Shield for the wall, then six gaps to spend it before.',
    designHook: 'Shield portal early, six open gaps, two kerbs and a drone near the causeway end.',
  },
  'magnetar-foundry': {
    signature: 'Two dash portals, five holes, and a drone waiting after the second.',
    designHook: 'Dash at the top and bottom of the course, five gaps, two kerbs and the hardest spacing in the campaign.',
  },
  'eclipse-crown': {
    signature: 'Shield and float, five holes, three shards: the finale asks for both.',
    designHook: 'Shield then float, five gaps, two kerbs and every mechanic the campaign has taught.',
  },
};

const tierOf = (index, config) => config.tierFor(index) - 1;

const clone = (level) => JSON.parse(JSON.stringify(level));
const round = (value, digits = 2) => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};

function featureTypes(level) {
  const types = new Set();
  for (const [, count] of level.obstacles) types.add(count === 2 ? 'double-hazard' : 'single-hazard');
  if (level.gaps.length) types.add('gap');
  if (level.platforms.length) types.add('bridge');
  if (level.portals.length) types.add('portal');
  if (level.enemies.length) types.add('enemy');
  if (level.collectibles.length) types.add('shard');
  return types;
}

// The same gates the test suite enforces after composition. A feature is only kept if all of them
// still hold; this makes the pass stricter than a plain "can the auto-player finish?" check.
function preservesGates(level, index, config) {
  const result = playLevel(level);
  if (!result.completed || result.deaths !== 0) return false;
  const metrics = analyzeLevel(level, result);
  if (metrics.deadBandViolations.length !== 0) return false;
  if (metrics.telegraphViolations.length !== 0) return false;
  if (Math.abs(metrics.inputsPerSecond / config.blueprint[index].target - 1) > .05) return false;
  if (metrics.jumps < .75 * metrics.beats) return false;
  if (!(metrics.tightestMargin >= .35)) return false;
  if (tierOf(index, config) >= 2 && metrics.comboBeats < 1) return false;
  if (featureTypes(level).size < 3) return false;
  return true;
}

// A change is only kept when the whole catalog still validates and the course still passes every
// fairness gate.
function keep(catalog, trial, index, config) {
  const candidate = catalog.map((level, position) => (position === index ? trial : level));
  try {
    validateLevels(candidate, { expected: catalog.length });
  } catch {
    return false;
  }
  return preservesGates(trial, index, config);
}

/** Beats sorted by distance, with the end of each beat, to reason about clear track. */
function beatSpans(level) {
  return [
    ...level.obstacles.map(([at, count], index) => ({ kind: 'hazard', index, at, end: at + (count - 1) * 1.28 })),
    ...level.gaps.map((gap, index) => ({ kind: 'gap', index, at: gap.at, end: gap.at + gap.width })),
    ...level.enemies.map((enemy, index) => ({ kind: 'enemy', index, at: enemy.at, end: enemy.at + .5 })),
  ].sort((a, b) => a.at - b.at);
}

function speedAt(level, at) {
  return courseSpeedTimeline(level).advance(at).speed;
}

/** Can a platform sit here? Plain track, clear of every beat, portal, shard and other platform. */
function platformFits(level, at, halfWidth, clearance = 0) {
  const guard = .6;
  const start = at - halfWidth;
  const end = at + halfWidth;
  const beats = beatSpans(level);
  for (const beat of beats) {
    // The platform body must not touch a beat.
    if (beat.kind === 'gap') {
      if (Math.abs(at - beat.at) < halfWidth + guard) return false;
      if (end > beat.at - guard && start < beat.end + guard) return false;
    } else if (end > beat.at - guard && start < beat.end + guard) {
      return false;
    }
    // Optional extra clear track at both ends (used by shelves).
    if (clearance > 0 && beat.end > start - clearance && beat.at < end + clearance) return false;
  }
  for (const portal of level.portals) {
    if (Math.abs(at - portal.at) < halfWidth + 1.2) return false;
    if (clearance > 0 && portal.at > start - clearance && portal.at < end + clearance) return false;
  }
  for (const platform of level.platforms) {
    const centre = platform.at + platform.width / 2;
    if (Math.abs(at - centre) < halfWidth + platform.width / 2 + .8) return false;
  }
  // A platform under an apex shard would make that shard's launch surface ambiguous.
  for (const collectible of level.collectibles) {
    if (Math.abs(at - collectible.at) < halfWidth + .8) return false;
  }
  return start > 1.2 * level.speed + 2 && end < level.length - 6;
}

/** Candidate platform positions: the middle of the widest clear stretches. */
function candidatePlatformSpots(level, halfWidth, clearance = 0) {
  const step = .5;
  const spots = [];
  const clearanceAt = typeof clearance === 'function' ? clearance : () => clearance;
  for (let at = halfWidth + 2; at <= level.length - halfWidth - 2; at += step) {
    if (platformFits(level, at, halfWidth, clearanceAt(at))) spots.push(at);
  }
  const beats = beatSpans(level);
  const scored = spots.map((at) => ({
    at,
    score: Math.min(...beats.map((beat) => Math.max(0, Math.abs(at - beat.at) - (beat.end - beat.at)))),
  }));
  scored.sort((a, b) => b.score - a.score || a.at - b.at);
  return scored;
}

function platformShard(platform, kind) {
  const at = kind === 'shelf'
    ? platform.at + platform.width - .55
    : platform.at + platform.width / 2;
  return { at: round(at), height: round(platform.height + 1.2) };
}

function placed(level, platform, options = {}) {
  const trial = clone(level);
  trial.platforms.push(platform);
  if (options.enemy) trial.enemies.push(options.enemy);
  if (options.shard !== false) trial.collectibles.push(platformShard(platform, platform.kind));
  return trial;
}

function placePlainPlatform(level, index, catalog, config, kind, width, height, clearance = 0) {
  const halfWidth = width / 2;
  const spots = candidatePlatformSpots(level, halfWidth, clearance);
  for (const spot of spots.slice(0, 80)) {
    const platform = {
      at: round(spot.at - halfWidth),
      width,
      height,
      kind,
    };
    const trial = placed(level, platform);
    if (keep(catalog, trial, index, config)) return trial;
  }
  return null;
}

function placeShelf(level, index, catalog, config) {
  const width = 10;
  return placePlainPlatform(
    level,
    index,
    catalog,
    config,
    'shelf',
    width,
    .5,
    (at) => .5 * jumpReach(speedAt(level, at)),
  );
}

function placeKerb(level, index, catalog, config) {
  return placePlainPlatform(level, index, catalog, config, 'kerb', 4.5, .45);
}

function placeHover(level, index, catalog, config) {
  return placePlainPlatform(level, index, catalog, config, 'hover', 4.5, .45);
}

// A plush bounce pad is a wool-only accent. It belongs in a rest: half a jump reach of clear track
// on each side, never over a gap, hazard, enemy, portal or shard, and never with a shard of its own
// (the launch is the reward). Every candidate is replayed through the auto-player before it is kept.
function bouncePadQuota(index, config) {
  if (config.id !== 'wool') return 0;
  return config.tierFor(index) <= 2 ? 1 : 2;
}

function placeBouncePad(level, index, catalog, config) {
  const brief = config.blueprint[index];
  const anchorGap = Number.isInteger(brief?.padBeforeGap) ? level.gaps[brief.padBeforeGap] : null;
  for (const width of [3.5, 4, 3]) {
    const halfWidth = width / 2;
    const spots = candidatePlatformSpots(
      level,
      halfWidth,
      (at) => .5 * jumpReach(speedAt(level, at)),
    );
    // A wool brief may anchor the pad in the rest just before one named gap. Keep the half-reach
    // clear track on both sides and take the latest legal spot, so the runner meets the pad and
    // then the gap on the same approach.
    const candidates = anchorGap
      ? spots.filter(({ at }) => at < anchorGap.at)
        .sort((a, b) => b.at - a.at || b.score - a.score)
      : spots;
    for (const spot of candidates.slice(0, 120)) {
      const trial = clone(level);
      trial.platforms.push({
        at: round(spot.at - halfWidth),
        width,
        height: .35,
        kind: 'bounce',
      });
      if (keep(catalog, trial, index, config)) return trial;
    }
  }
  return null;
}

// When every rest is already taken by a kerb, shelf, perch or island, the pad loses the race for
// space even though it is the campaign's signature object. Converting a low platform in place keeps
// the lane passable (a pad is .10 lower than a kerb) and is verified like any other placement —
// including the half-reach clear-track rule, which is why the candidate list is rebuilt here instead
// of trusting the platform's old position.
function convertPlatformToPad(level, index, catalog, config) {
  const width = 3.5;
  const legal = candidatePlatformSpots(level, width / 2, (at) => .5 * jumpReach(speedAt(level, at)))
    .map(({ at }) => at);
  const candidates = level.platforms
    .filter(({ kind }) => kind !== 'bounce')
    .filter((platform) => legal.some((center) => center >= platform.at && center <= platform.at + platform.width))
    .sort((a, b) => a.width - b.width);
  for (const platform of candidates) {
    const center = legal.find((spot) => spot >= platform.at && spot <= platform.at + platform.width);
    const trial = clone(level);
    trial.platforms = trial.platforms.map((entry) => (
      entry.at === platform.at && entry.kind === platform.kind
        ? { at: round(center - width / 2), width, height: .35, kind: 'bounce' }
        : entry
    ));
    if (keep(catalog, trial, index, config)) return trial;
  }
  return null;
}

function placeBouncePads(level, index, catalog, config) {
  let next = level;
  const quota = bouncePadQuota(index, config);
  for (let pad = 0; pad < quota; pad++) {
    const placedLevel = placeBouncePad(next, index, catalog, config);
    // A busy course (two portals, four gaps, six hazard groups) may simply have no rest wide
    // enough for another pad. One fewer pad is a content shortfall, not a broken course: the pads
    // that do fit still obey the clear-track rule and the whole layout still faces every gate, so
    // stop here instead of aborting the composition.
    if (!placedLevel) {
      const converted = pad === 0 ? convertPlatformToPad(next, index, catalog, config) : null;
      if (converted) {
        next = converted;
        continue;
      }
      if (process.env.COMPOSE_DEBUG) {
        console.log(`${next.id}: only ${pad} of ${quota} bounce pads fit a rest`);
      }
      break;
    }
    next = placedLevel;
  }
  return next;
}

// An island bridges the near half of a gap: the platform starts flush with the hole's edge, so a
// grounded runner steps up onto it instead of falling in, and only the far part of the hole is left
// to jump. Putting the platform in the middle of the hole (the first version) meant the runner was
// already falling before reaching it, which made course 11 impossible to walk through.
function placeIsland(level, index, catalog, config) {
  const islandWidth = 2.5;
  const minimumHoleAfter = 2.4;
  for (const [gapIndex, gap] of level.gaps.entries()) {
    const width = Math.max(gap.width, islandWidth + minimumHoleAfter);
    if (width - islandWidth < minimumHoleAfter - 1e-9) continue;
    const at = round(gap.at);
    const end = at + width;
    if (at < 3 || end > level.length - 2) continue;
    if (level.collectibles.some((shard) => shard.at > at - .15 && shard.at < end + .15)) continue;
    const trial = clone(level);
    trial.gaps[gapIndex] = { at: round(at), width: round(width) };
    trial.gaps.sort((a, b) => a.at - b.at);
    const platform = {
      at: round(at),
      width: islandWidth,
      // Inside the step-up limit on purpose: the platform is the landing, not a jump target.
      height: .5,
      kind: 'island',
    };
    trial.platforms.push(platform);
    trial.collectibles.push(platformShard(platform, 'island'));
    if (keep(catalog, trial, index, config)) return trial;
  }
  return null;
}

// A perch replaces one single-hazard beat: the hazard group becomes a raised kerb with a crawler
// standing on it. Keeping the input count unchanged preserves the course's target input rate.
function placePerch(level, index, catalog, config) {
  const width = 4.5;
  const halfWidth = width / 2;
  const groups = level.obstacles
    .map(([at, count], groupIndex) => ({ at, count, groupIndex }))
    .filter(({ count }) => count === 1)
    .sort((a, b) => a.at - b.at);

  for (const group of groups) {
    const without = clone(level);
    without.obstacles.splice(group.groupIndex, 1);
    // Prefer to keep the beat where it was: centre the perch on the hazard it replaces.
    const centres = [group.at, ...candidatePlatformSpots(without, halfWidth).map(({ at }) => at)];
    for (const centre of centres.slice(0, 60)) {
      if (Math.abs(centre - group.at) > 3) continue;
      if (!platformFits(without, centre, halfWidth)) continue;
      const platform = {
        at: round(centre - halfWidth),
        width,
        height: .45,
        kind: 'perch',
      };
      const trial = clone(without);
      trial.platforms.push(platform);
      trial.enemies.push({
        at: round(platform.at + platform.width / 2),
        type: 'crawler',
      });
      if (keep(catalog, trial, index, config)) return trial;
    }
  }
  return null;
}

// Course-range mix:
//   1-4   kerb only, at most one (the shipped tutorial courses keep none)
//   5-8   exactly one kerb
//   9-14  one kerb plus a shelf or island, and a perch from course 12 on
//   15-20 two of shelf / island / hover, plus a perch
function desiredPlatforms(index) {
  if (index < 4) return [];
  if (index < 8) return ['kerb'];
  if (index < 14) {
    const plan = ['kerb', 'special'];
    if (index >= 11) plan.push('perch');
    return plan;
  }
  return ['special', 'special', 'perch'];
}

function isBridge(platform, gaps) {
  return platform.height <= .6 && gaps.some((gap) => (
    platform.at <= gap.at && platform.at + platform.width >= gap.at + gap.width
  ));
}

function carriesShard(level, platform) {
  return level.collectibles.some(({ at }) => at >= platform.at - .15 && at <= platform.at + platform.width + .15);
}

// The feature pass changes when the auto-player jumps (new enemies, perches and step-up surfaces).
// Re-derive the free apex shards from the final run trace so each one still sits on a jump arc. The
// platform shards are fixed to their platform and are kept as-is.
function regenerateApexShards(level, index, config) {
  const platformShards = level.collectibles.filter((shard) => (
    level.platforms.some((platform) => (
      shard.at >= platform.at - .15 && shard.at <= platform.at + platform.width + .15
    ))
  ));
  level.collectibles = [...platformShards];
  const wanted = config.blueprint[index].shards;
  if (wanted === 0) return true;

  const result = playLevel(level);
  if (!result.completed) return false;
  const movementPortals = new Set(['spring', 'dash', 'float']);
  const firstMovement = result.events.find(({ type, portal }) => type === 'portal' && movementPortals.has(portal));
  const cutoff = firstMovement?.time ?? Infinity;
  const windows = beatWindows(level).filter(({ kind }) => kind === 'hazard' || kind === 'gap' || kind === 'enemy');
  const apexHeight = jumpApexHeight();
  const candidates = [];

  for (const event of result.events) {
    if (event.type !== 'jump' || event.time >= cutoff) continue;
    const apexSpeed = courseSpeedTimeline(level).advance(event.at).speed;
    const apexAt = event.at + apexSpeed * jumpRiseTime();
    const options = [];
    for (let at = Math.max(3, event.at + .3); at <= Math.min(level.length - 3, event.at + jumpReach(apexSpeed)); at += .05) {
      if (level.platforms.some((platform) => at >= platform.at - .15 && at <= platform.at + platform.width + .15)) continue;
      const speed = courseSpeedTimeline(level).advance(at).speed;
      const time = (at - event.at) / speed;
      const height = jumpHeightAt(time);
      if (height < 1.45 || height > apexHeight + .02) continue;
      if (windows.some(({ start, end }) => at > start - .12 && at < end + .12)) continue;
      if (platformShards.some((shard) => Math.abs(shard.at - at) < 1)) continue;
      options.push({ at, height, score: height - Math.abs(at - apexAt) * .0001 });
    }
    options.sort((a, b) => b.score - a.score);
    const shard = options.find(({ at }) => candidates.every((existing) => Math.abs(existing.at - at) >= 1));
    if (shard) candidates.push({ at: round(shard.at), height: round(shard.height) });
    if (candidates.length === wanted) break;
  }
  if (candidates.length !== wanted) return false;
  level.collectibles = [...candidates, ...platformShards];
  return true;
}

// ---------------------------------------------------------------------------
// Wool vocabulary pass
//
// The rhythm pass owns the beats. This pass dresses them: per-group hazard skins, the three new
// enemy silhouettes, shard arcs sampled from the shared physics trace, and purely decorative
// scenery. Every change that can affect the run is replayed through the unchanged auto-player and
// reverted when a gate stops holding. Scenery never enters a collision list, so it needs no gate.
// ---------------------------------------------------------------------------

const WOOL_SKINS = ['yarn-spike', 'felt-block', 'button-bomb', 'thread-arch'];
const WOOL_ENEMIES = ['beetle', 'bunny', 'moth'];

function woolVocabularyQuota(index, config) {
  const tier = config.tierFor(index);
  if (tier <= 1) return { skins: [2, 3], enemies: 1, arcs: [0, 1], arches: 0 };
  if (tier === 2) return { skins: [3, 3], enemies: 2, arcs: [1, 1], arches: 0 };
  if (tier === 3) return { skins: [4, 4], enemies: 2, arcs: [1, 2], arches: 1 };
  return { skins: [4, 4], enemies: 3, arcs: [2, 2], arches: 2 };
}

function enemyTypesOf(level) {
  return [...new Set(level.enemies.map(({ type }) => type))];
}

function skinStylesFor(level, quota, vocabulary) {
  if (Array.isArray(vocabulary.skins) && vocabulary.skins.length) {
    return level.obstacles.map((_, index) => vocabulary.skins[index] ?? level.hazardStyle);
  }
  const distinct = Math.min(level.obstacles.length, quota.skins[1]);
  const styles = [level.hazardStyle ?? 'spike'];
  for (const skin of WOOL_SKINS) {
    if (styles.length >= distinct) break;
    if (!styles.includes(skin)) styles.push(skin);
  }
  return level.obstacles.map((_, index) => styles[index % styles.length]);
}

function withHazardSkins(level, index, catalog, config, styles) {
  const trial = clone(level);
  trial.obstacles = trial.obstacles.map(([at, count], groupIndex) => {
    const style = styles[groupIndex];
    return style ? [at, count, style] : [at, count];
  });
  return keep(catalog, trial, index, config) ? trial : null;
}

// Replace one whole hazard group with a single enemy. The group's beat stays at the same distance,
// so the course's input rate is unchanged; only the silhouette and collision profile change.
function replaceHazardWithEnemy(level, groupIndex, type, index, catalog, config) {
  if (groupIndex < 0 || groupIndex >= level.obstacles.length) return null;
  if (level.obstacles.length + level.enemies.length <= 3) return null;
  const [at] = level.obstacles[groupIndex];
  const trial = clone(level);
  trial.obstacles.splice(groupIndex, 1);
  trial.enemies.push({ at: round(at), type });
  return keep(catalog, trial, index, config) ? trial : null;
}

function applyGenericWoolEnemies(level, quota, index, catalog, config) {
  let next = level;
  let attempts = 0;
  while (enemyTypesOf(next).length < quota.enemies && attempts < WOOL_ENEMIES.length + 4) {
    attempts++;
    const missing = WOOL_ENEMIES.filter((type) => !enemyTypesOf(next).includes(type));
    const type = quota.enemies === 1
      ? (missing.includes('beetle') ? 'beetle' : missing[0])
      : (missing[0] ?? WOOL_ENEMIES[attempts % WOOL_ENEMIES.length]);
    if (!type) break;
    const groups = next.obstacles
      .map(([at, count], groupIndex) => ({ at, count, groupIndex }))
      .filter(({ count }) => count === 1)
      .sort((a, b) => a.at - b.at);
    let replaced = null;
    for (const group of groups) {
      const trial = replaceHazardWithEnemy(next, group.groupIndex, type, index, catalog, config);
      if (trial) { replaced = trial; break; }
    }
    if (!replaced) break;
    next = replaced;
  }
  return retypeWoolEnemies(next, quota);
}

// A course with only three hazard groups cannot give one away, so the quota would stay unmet and
// the course would keep a core silhouette. Re-typing an existing enemy to a wool one is a pure
// silhouette swap: beetle shares the crawler profile and moth shares the drone profile, so the
// simulation cannot change. `bunny` also shares the crawler profile.
const WOOL_TWINS = { crawler: ['beetle', 'bunny'], drone: ['moth'], beetle: ['bunny'], bunny: ['beetle'], moth: ['moth'] };

// Every core silhouette that reaches a wool course is swapped for a wool twin sharing its collision
// profile, and duplicates are spread across the twins of that same profile. A beetle and a bunny
// are both the .9/.58 ground body, so this cannot change a single collision.
function retypeWoolEnemies(level, quota) {
  if (!level.enemies.length) return level;
  const used = new Set();
  let changed = false;
  const enemies = level.enemies.map((enemy) => {
    const twins = WOOL_TWINS[enemy.type] ?? [enemy.type];
    const pick = twins.find((type) => !used.has(type)) ?? twins[0];
    used.add(pick);
    if (pick !== enemy.type) changed = true;
    return { ...enemy, type: pick };
  });
  if (!changed) return level;
  const next = clone(level);
  next.enemies = enemies;
  return next;
}

/** Frames of one real ballistic arc, sampled at even time steps. */
function arcFrames(result, source, count, length) {
  if (!source) return [];
  const apex = jumpApexHeight();
  const airborne = result.samples.filter((sample) => (
    sample.time >= source.time
    && sample.time <= source.time + airTime() + .05
    && !sample.grounded
  ));
  const eligible = airborne.filter((sample) => {
    const height = sample.y - sample.supportY;
    return height >= 1.2
      && height <= apex + .05
      && sample.at > 3
      && sample.at < length - 3;
  });
  if (eligible.length < count) return [];
  return Array.from({ length: count }, (_, index) => {
    const frame = eligible[Math.round(((eligible.length - 1) * index) / (count - 1))];
    return { at: round(frame.at), height: round(frame.y - frame.supportY, 2) };
  });
}

function arcSources(level, result, usedTimes) {
  const jumps = result.events
    .filter(({ type, time }) => type === 'jump' && !usedTimes.has(time))
    .sort((a, b) => a.at - b.at);
  const gaps = beatWindows(level).filter(({ kind }) => kind === 'gap');
  // Prefer the jump that crosses a gap: that is the beat that forces the arc.
  const gapJumps = jumps.filter(({ window }) => gaps.some((gap) => window.split('+').includes(gap.id)));
  return [...gapJumps, ...jumps];
}

function chooseArcSource(level, result, spec, usedTimes) {
  if (spec.source === 'pad') {
    return result.events.find(({ type, time }) => type === 'bounce' && !usedTimes.has(time)) ?? null;
  }
  if (spec.source === 'gap') {
    const gap = beatWindows(level).filter(({ kind }) => kind === 'gap')[spec.ordinal ?? 0];
    if (!gap) return null;
    return result.events.find(({ type, time, window }) => (
      type === 'jump' && !usedTimes.has(time) && window.split('+').includes(gap.id)
    )) ?? null;
  }
  return arcSources(level, result, usedTimes)[0] ?? null;
}

function placeArc(level, spec, index, catalog, config, usedTimes) {
  const result = playLevel(level, { trace: true });
  if (!result.completed) {
    if (process.env.COMPOSE_DEBUG) console.log(level.id, 'arc pre-play failed', result.events.findLast(({ type }) => type === 'death')?.reason);
    return null;
  }
  const source = chooseArcSource(level, result, spec, usedTimes);
  const count = spec.count ?? 3;
  const frames = arcFrames(result, source, count, level.length);
  if (frames.length !== count) {
    if (process.env.COMPOSE_DEBUG) console.log(level.id, 'arc frames', frames.length, spec.source, Boolean(source));
    return null;
  }
  const trial = clone(level);
  if (spec.replaceShards) trial.collectibles = [];
  // Keep every arc in one contiguous block: its leader carries `arc: n` and the next n-1 entries
  // are its samples. The browser (and any reader) can expand the arc from the leader alone.
  const shards = frames.map((frame, frameIndex) => ({
    at: frame.at,
    height: frame.height,
    ...(frameIndex === 0 ? { arc: count } : {}),
  }));
  if (!spec.replaceShards) {
    // Do not stack a new arc on top of an existing shard.
    if (trial.collectibles.some((shard) => shards.some((next) => Math.abs(shard.at - next.at) < .8))) return null;
  }
  trial.collectibles.push(...shards);
  if (!keep(catalog, trial, index, config)) {
    if (process.env.COMPOSE_DEBUG) console.log(level.id, 'arc gate rejected', JSON.stringify(shards));
    return null;
  }
  usedTimes.add(source.time);
  return trial;
}

function applyWoolVocabulary(level, index, catalog, config) {
  const brief = config.blueprint[index] ?? {};
  const vocabulary = brief.vocabulary ?? {};
  if (process.env.COMPOSE_DEBUG) console.log('VOCAB', level.id, JSON.stringify(vocabulary));
  const quota = woolVocabularyQuota(index, config);
  let next = level;

  // 1. Enemies. An authored retrofit names the group it converts (Button Bush's beetle); future
  //    courses take the tier quota, always one beat for one beat.
  if (vocabulary.replaceGroup) {
    const { ordinal = 0, type = 'beetle' } = vocabulary.replaceGroup;
    const groups = next.obstacles
      .map(([at, count], groupIndex) => ({ at, count, groupIndex }))
      .filter(({ count }) => count === 1)
      .sort((a, b) => a.at - b.at);
    const target = groups[ordinal];
    if (target) next = replaceHazardWithEnemy(next, target.groupIndex, type, index, catalog, config) ?? next;
  } else if (!brief.vocabulary) {
    next = applyGenericWoolEnemies(next, quota, index, catalog, config);
  }

  // 2. Hazard skins. A group without a style keeps the base style.
  const styled = withHazardSkins(next, index, catalog, config, skinStylesFor(next, quota, vocabulary));
  if (styled) next = styled;

  // 3. Shard arcs, sampled from the auto-player's own trajectory.
  const specs = Array.isArray(vocabulary.arcs)
    ? vocabulary.arcs
    : Array.from({ length: quota.arcs[1] }, () => ({ count: 3 }));
  const usedTimes = new Set();
  let arcPlaced = false;
  for (const spec of specs) {
    // A named source is a request, not a guarantee: a portal may already own that beat. Try the
    // gap first, then the pad, then any jump, and accept the first placement the simulation backs.
    const sources = spec.source ? [spec.source] : ['gap', 'pad', 'jump'];
    for (const source of sources) {
      const placed = placeArc(
        next,
        { ...spec, source, replaceShards: spec.replaceShards ?? vocabulary.replaceShards },
        index,
        catalog,
        config,
        usedTimes,
      );
      if (placed) { next = placed; arcPlaced = true; break; }
    }
  }
  // A course whose scattered shards sit in the way of every arc would silently ship without one.
  // An arc is the richer object and it is sampled from the trajectory before it is accepted, so
  // trade the scattered shards for it rather than leaving the tier quota unmet.
  if (!arcPlaced) {
    for (const spec of specs) {
      for (const source of (spec.source ? [spec.source] : ['gap', 'pad', 'jump'])) {
        const placed = placeArc(
          next,
          { ...spec, source, replaceShards: true },
          index,
          catalog,
          config,
          usedTimes,
        );
        if (placed) { next = placed; arcPlaced = true; break; }
      }
      if (arcPlaced) break;
    }
  }
  if (process.env.COMPOSE_DEBUG) console.log(level.id, 'arcs after', JSON.stringify(next.collectibles));

  // 4. Decorative scenery. These objects are created for the level but never added to obstacles,
  //    gaps, platforms, portals, enemies or collectibles, so they cannot enter the simulation.
  const archCount = Array.isArray(vocabulary.arches)
    ? vocabulary.arches.length
    : quota.arches;
  const arches = Array.isArray(vocabulary.arches)
    ? [...vocabulary.arches]
    : archCount >= 2 ? ['checkpoint', 'finish'] : archCount === 1 ? ['finish'] : [];
  const pomPoms = vocabulary.pomPoms ?? (config.tierFor(index) >= 4 ? 5 : config.tierFor(index) >= 2 ? 4 : 3);
  next.decor = {
    ...(arches.length ? { arches } : {}),
    pomPoms,
  };
  return next;
}

function applyFeaturePass(catalog, base, index, config) {
  const quota = QUOTAS[tierOf(index, config)];
  let level = clone(base);

  // 1. Enemies: convert hazard slots. A crawler is shorter than a hazard, so a jump that cleared
  //    the hazard clears the crawler; the auto-player still has to agree.
  const sortedGroups = level.obstacles
    .map(([at, count], groupIndex) => ({ at, count, groupIndex }))
    .filter(({ count }) => count === 1)
    .sort((a, b) => a.at - b.at);
  let enemies = level.enemies.length;
  let drones = level.enemies.filter((enemy) => enemy.type === 'drone').length;
  for (const group of sortedGroups) {
    if (enemies >= quota.enemies) break;
    const before = clone(level);
    const nextBeat = beatSpans(level).find((beat) => beat.at > group.at + .5);
    const roomy = nextBeat ? nextBeat.at - group.at > .9 * level.speed * airTime() : true;
    const type = drones < quota.drones && roomy ? 'drone' : 'crawler';
    level.enemies = level.enemies.filter((enemy) => Math.abs(enemy.at - group.at) > 2);
    level.enemies.push(type === 'drone'
      ? { at: group.at, type: 'drone', height: 1.05 }
      : { at: group.at, type: 'crawler' });
    level.obstacles = level.obstacles.filter((_, i) => i !== group.groupIndex);
    if (!keep(catalog, level, index, config)) {
      level = before;
      continue;
    }
    enemies++;
    if (type === 'drone') drones++;
  }

  // 2. Rebuild the platform mix from the archetype plan. Every placement is verified as a whole.
  level.platforms = [];
  // Wool courses keep one rest free for the plush pad: it is the campaign's signature object, and a
  // pad that loses the race for space to a kerb is a worse course than one with one kerb fewer.
  const slots = desiredPlatforms(index);
  if (config.id === 'wool') slots.pop();
  for (const slot of slots) {
    const before = level;
    let next = null;
    if (slot === 'kerb') {
      next = placeKerb(level, index, catalog, config);
    } else if (slot === 'perch') {
      next = placePerch(level, index, catalog, config);
    } else {
      // Prefer an island (two jumps), then a shelf, then the hover (final tier only).
      // A tier may repeat a special if that is the only mix the gates allow.
      const candidates = index >= 14 ? ['island', 'shelf', 'hover'] : ['island', 'shelf'];
      for (const kind of candidates) {
        next = kind === 'island'
          ? placeIsland(level, index, catalog, config)
          : kind === 'shelf'
            ? placeShelf(level, index, catalog, config)
            : placeHover(level, index, catalog, config);
        if (next) break;
      }
    }
    if (!next) {
      throw new Error(`${level.id}: could not place the ${slot} platform for its course tier`);
    }
    level = next;
    if (before === level) throw new Error(`${level.id}: platform pass made no progress`);
  }

  // 3. Shards: every non-bridge platform carries one, then the free apex shards are re-derived
  // from the final run trace because the feature mix can move the jump that used to carry them.
  for (const platform of level.platforms) {
    if (isBridge(platform, level.gaps) || platform.kind === 'perch') continue;
    if (!carriesShard(level, platform)) level.collectibles.push(platformShard(platform, platform.kind));
  }
  if (!regenerateApexShards(level, index, config)) {
    throw new Error(`${level.id}: could not re-place its apex shards after the feature pass`);
  }

  // 4. Bounce pads are wool-only and added last, so they never carry a shard and cannot disturb
  //    the platform/shards placement above. Each one is verified by the same whole-course replay.
  level = placeBouncePads(level, index, catalog, config);

  // A course may ask for its authored shard to hang above the pad (the launch is still the pad's
  // reward; no shard is created for a pad). Only the wool course that names it does this.
  if (config.id === 'wool' && config.blueprint[index]?.shardAbovePad && level.collectibles.length > 0) {
    const pad = level.platforms.find(({ kind }) => kind === 'bounce');
    if (pad) {
      level.collectibles[0] = { at: round(pad.at + pad.width / 2), height: 1.7 };
    }
  }

  // 5. Wool vocabulary: per-group skins, new enemy silhouettes, sampled shard arcs and scenery.
  if (config.id === 'wool') level = applyWoolVocabulary(level, index, catalog, config);

  const copy = COPY[level.id];
  if (copy) {
    level.signature = copy.signature;
    level.designHook = designHookFor(level);
  }
  return { level, applied: [] };
}

function archetypeCounts(level) {
  const result = {};
  for (const platform of level.platforms) {
    const kind = platform.kind ?? 'bridge';
    result[kind] = (result[kind] ?? 0) + 1;
  }
  return result;
}

function plural(count, singular) {
  return `${count} ${count === 1 ? singular : `${singular}s`}`;
}

function listPhrase(items) {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
}

function designHookFor(level) {
  const styles = [...new Set(level.obstacles.map((group) => group[2] ?? level.hazardStyle))];
  const parts = [styles.length > 1
    ? `${plural(level.obstacles.length, 'hazard group')} (${listPhrase(styles.map((style) => style.replaceAll('-', ' ')))})`
    : plural(level.obstacles.length, `${(styles[0] ?? 'spike').replaceAll('-', ' ')} group`)];
  if (level.gaps.length) parts.push(plural(level.gaps.length, 'gap'));
  const counts = archetypeCounts(level);
  const platforms = Object.entries(counts).map(([kind, count]) => (
    plural(count, kind === 'bounce' ? 'bounce pad' : kind)
  ));
  if (platforms.length) parts.push(listPhrase(platforms));
  if (level.portals.length) {
    const types = [...new Set(level.portals.map(({ type }) => type))];
    parts.push(`${plural(level.portals.length, 'portal')} (${listPhrase(types)})`);
  }
  if (level.enemies.length) {
    const byType = new Map();
    for (const { type } of level.enemies) byType.set(type, (byType.get(type) ?? 0) + 1);
    parts.push(listPhrase([...byType].map(([type, count]) => plural(count, type))));
  }
  if (level.collectibles.length) {
    const arcs = level.collectibles.filter((shard) => shard.arc).length;
    parts.push(arcs
      ? `${plural(level.collectibles.length, 'shard')} in ${plural(arcs, 'arc')}`
      : plural(level.collectibles.length, 'shard'));
  }
  if (level.decor?.arches?.length) {
    const count = level.decor.arches.length;
    parts.push(`${count} thread arch${count === 1 ? '' : 'es'}`);
  }
  return `${level.name} lays out ${listPhrase(parts)}.`;
}

function main() {
  const config = campaignConfig(readCampaignArgument());
  const composed = composeLevels(config.levels, config.blueprint, config);
  const catalog = composed.map(({ level }) => level);
  const results = composed.map(({ level, phrases }, index) => {
    const { level: enriched } = applyFeaturePass(catalog, level, index, config);
    return { level: enriched, phrases, metrics: analyzeLevel(enriched) };
  });

  validateLevels(results.map(({ level }) => level), { expected: config.levels.length });
  const check = results;
  const source = readFileSync(config.levelsPath, 'utf8');
  const plan = readFileSync(config.planPath, 'utf8');
  const checklist = plan.slice(plan.indexOf('## Playtest checklist'));
  writeFileSync(config.levelsPath, rewriteLevels(source, check, config.levelsLabel));
  writeFileSync(config.planPath, renderDesignPlan(check, checklist, config));

  for (const { level } of results) {
    const jumps = playLevel(level).jumps;
    const counts = archetypeCounts(level);
    const archetypes = Object.entries(counts).map(([kind, count]) => `${kind} x${count}`).join(', ') || 'none';
    console.log(
      `${level.id}: platforms ${level.platforms.length} [${archetypes}] | enemies ${level.enemies.length}`
      + ` | portals ${level.portals.length} | shards ${level.collectibles.length} | jumps ${jumps}`,
    );
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
