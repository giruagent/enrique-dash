// Feature pass: a second, gated stage of the course pipeline.
//
// tools/compose-levels.mjs owns the *rhythm* (how many beats, where, and how they are spaced).
// This pass owns the *mix*: it converts some hazard slots into enemies, and adds raised kerbs
// with a shard on plain track, so the courses use the whole feature vocabulary instead of only
// hazards and gaps.
//
// Every individual change is verified with the auto-player before it is kept: a conversion that
// makes a course uncompletable is reverted immediately. The pass is deterministic.

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { levels, validateLevels } from '../src/levels.js';
import { composeLevels, rewriteLevels, renderDesignPlan } from './compose-levels.mjs';
import { playLevel } from './auto-player.mjs';
import { analyzeLevel } from './level-report.mjs';

const LEVELS_PATH = new URL('../src/levels.js', import.meta.url);
const PLAN_PATH = new URL('../LEVEL_DESIGN_PLAN.md', import.meta.url);
const AIR_TIME = 2 * 8.5 / 19;

const QUOTAS = [
  { platforms: 0, enemies: 0, drones: 0, portals: 0, shards: 0 },   // courses 1-4
  { platforms: 1, enemies: 1, drones: 0, portals: 1, shards: 1 },   // 5-8
  { platforms: 2, enemies: 2, drones: 1, portals: 2, shards: 2 },   // 9-14
  { platforms: 2, enemies: 3, drones: 1, portals: 2, shards: 2 },   // 15-20
];


// Hand-written course copy. The composer generates a mechanically accurate but templated
// sentence; this table is the human layer, and it is written against the mix this pass leaves
// behind (gaps, kerbs, enemies, portals and shards as listed in the design plan).
const COPY = {
  'neon-run': {
    signature: 'Three open gaps on a clean straight, each one a single jump.',
    designHook: 'Six hazard-free openings and three holes, spaced so you can land and look before the next.',
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

const tierOf = (index) => (index < 4 ? 0 : index < 8 ? 1 : index < 14 ? 2 : 3);

const clone = (level) => JSON.parse(JSON.stringify(level));

function plays(level) {
  const result = playLevel(level);
  return { ok: result.completed && result.deaths === 0, result };
}

// A change is only kept when the whole catalog still validates and the course still plays.
function keep(catalog, trial, index) {
  const candidate = catalog.map((level, position) => (position === index ? trial : level));
  try {
    validateLevels(candidate);
  } catch {
    return false;
  }
  return plays(trial).ok;
}

/** Beats sorted by distance, with the end of each beat, to reason about clear track. */
function beatSpans(level) {
  return [
    ...level.obstacles.map(([at, count], index) => ({ kind: 'hazard', index, at, end: at + (count - 1) * 1.28 })),
    ...level.gaps.map((gap, index) => ({ kind: 'gap', index, at: gap.at, end: gap.at + gap.width })),
    ...level.enemies.map((enemy, index) => ({ kind: 'enemy', index, at: enemy.at, end: enemy.at + .5 })),
  ].sort((a, b) => a.at - b.at);
}

/** Can a platform sit here? Plain track, clear of every beat and portal. */
function platformFits(level, at, halfWidth) {
  const guard = .6;
  const beats = beatSpans(level);
  for (const beat of beats) {
    if (beat.kind === 'gap') {
      if (Math.abs(at - beat.at) < halfWidth + guard) return false;
      if (at + halfWidth > beat.at - guard && at - halfWidth < beat.end + guard) return false;
    } else if (at + halfWidth > beat.at - guard && at - halfWidth < beat.end + guard) {
      return false;
    }
  }
  for (const portal of level.portals) {
    if (Math.abs(at - portal.at) < halfWidth + 1.2) return false;
  }
  for (const platform of level.platforms) {
    const centre = platform.at + platform.width / 2;
    if (Math.abs(at - centre) < halfWidth + platform.width / 2 + .8) return false;
  }
  return at - halfWidth > 1.2 * level.speed + 2 && at + halfWidth < level.length - 6;
}

/** Candidate platform positions: the middle of the widest clear stretches. */
function candidatePlatformSpots(level, halfWidth) {
  const step = .5;
  const spots = [];
  for (let at = halfWidth + 2; at <= level.length - halfWidth - 2; at += step) {
    if (platformFits(level, at, halfWidth)) spots.push(at);
  }
  // Prefer spots far from anything else: score by distance to the closest beat.
  const beats = beatSpans(level);
  const scored = spots.map((at) => ({
    at,
    score: Math.min(...beats.map((beat) => Math.max(0, Math.abs(at - beat.at) - (beat.end - beat.at)))),
  }));
  scored.sort((a, b) => b.score - a.score || a.at - b.at);
  return scored;
}

function applyFeaturePass(catalog, base, index) {
  const quota = QUOTAS[tierOf(index)];
  let level = clone(base);
  const applied = [];

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
    const roomy = nextBeat ? nextBeat.at - group.at > .9 * level.speed * 2 * 8.5 / 19 : true;
    const type = drones < quota.drones && roomy ? 'drone' : 'crawler';
    level.enemies = level.enemies.filter((enemy) => Math.abs(enemy.at - group.at) > 2);
    level.enemies.push(type === 'drone'
      ? { at: group.at, type: 'drone', height: 1.05 }
      : { at: group.at, type: 'crawler' });
    level.obstacles = level.obstacles.filter((_, i) => i !== group.groupIndex);
    if (!keep(catalog, level, index)) {
      level = before;
      continue;
    }
    enemies++;
    if (type === 'drone') drones++;
    applied.push(`enemy ${type} @${group.at.toFixed(1)}`);
  }

  // 2. Platforms with a shard: raised kerbs on plain track.
  const halfWidth = 2;
  let platforms = 0;
  const desiredShards = Math.max(quota.shards, level.collectibles.length);
  const rejected = new Set();
  while (platforms < quota.platforms) {
    const spot = candidatePlatformSpots(level, halfWidth).find((candidate) => !rejected.has(candidate.at));
    if (!spot) break;
    if (level.portals.some((portal) => Math.abs(spot.at - portal.at) < 6)) {
      rejected.add(spot.at);
      continue;
    }
    const before = clone(level);
    level.platforms.push({ at: spot.at - halfWidth, width: halfWidth * 2, height: .45, kind: 'kerb' });
    if (level.collectibles.length < desiredShards) level.collectibles.push({ at: spot.at, height: 1.9 });
    if (!keep(catalog, level, index)) {
      level = before;
      rejected.add(spot.at);
      continue;
    }
    platforms++;
    applied.push(`platform @${spot.at.toFixed(1)}`);
  }

  // 3. Shards: make sure the quota is met, above existing beats where nothing else collides.
  while (level.collectibles.length < quota.shards) {
    const before = clone(level);
    const spots = candidatePlatformSpots(level, .8);
    if (!spots.length) break;
    level.collectibles.push({ at: spots[0].at, height: 1.9 });
    if (!keep(catalog, level, index)) {
      level = before;
      break;
    }
    applied.push(`shard @${spots[0].at.toFixed(1)}`);
  }

  const copy = COPY[level.id];
  if (copy) {
    level.signature = copy.signature;
    level.designHook = copy.designHook;
  }
  return { level, applied };
}

function main() {
  const composed = composeLevels(levels);
  const catalog = composed.map(({ level }) => level);
  const results = composed.map(({ level, phrases }, index) => {
    const { level: enriched, applied } = applyFeaturePass(catalog, level, index);
    return { level: enriched, phrases, metrics: analyzeLevel(enriched), applied };
  });

  validateLevels(results.map(({ level }) => level));
  const check = results;
  const source = readFileSync(LEVELS_PATH, 'utf8');
  const plan = readFileSync(PLAN_PATH, 'utf8');
  const checklist = plan.slice(plan.indexOf('## Playtest checklist'));
  writeFileSync(LEVELS_PATH, rewriteLevels(source, check));
  writeFileSync(PLAN_PATH, renderDesignPlan(check, checklist));

  for (const { level, applied } of results) {
    const jumps = playLevel(level).jumps;
    console.log(
      `${level.id}: platforms ${level.platforms.length} | enemies ${level.enemies.length}`
      + ` | portals ${level.portals.length} | shards ${level.collectibles.length} | jumps ${jumps}`
      + ` | ${applied.length ? applied.join(', ') : 'no change'}`,
    );
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
