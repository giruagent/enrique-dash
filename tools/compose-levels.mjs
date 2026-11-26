import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { getHazardProfile, jumpTuning, motionTuning, portalEffects } from '../src/game-logic.js';
import { levels, validateLevels } from '../src/levels.js';
import { playLevel } from './auto-player.mjs';
import { analyzeLevel } from './level-report.mjs';
import { beatWindows, courseSpeedTimeline, jumpReach } from './level-physics.mjs';

const LEVELS_PATH = new URL('../src/levels.js', import.meta.url);
const PLAN_PATH = new URL('../LEVEL_DESIGN_PLAN.md', import.meta.url);
const INTRO_SECONDS = 1.2;
const OUTRO_SECONDS = 1.2;
const COMBO_MIN = .55;
const COMBO_MAX = .8;
const REST_MIN = 1.35;

// The course identity, speed, length, palette, environment, music and hazard
// profile stay in src/levels.js. This table owns only the v0.6.0 rhythm brief.
export const blueprint = [
  { id: 'neon-run', target: .62, phrase: [1, 2], rest: 2.2, portals: [], shards: 0 },
  { id: 'skyline-rush', target: .64, phrase: [2, 2], rest: 2.0, portals: ['float'], shards: 1 },
  { id: 'solar-flare', target: .66, phrase: [2, 2], rest: 2.0, portals: ['spring'], shards: 1 },
  { id: 'gravity-garden', target: .68, phrase: [2, 3], rest: 1.9, portals: ['float'], shards: 1 },
  { id: 'pixel-pier', target: .70, phrase: [2, 3], rest: 1.8, portals: ['spring'], shards: 1 },
  { id: 'midnight-circuit', target: .72, phrase: [3, 3], rest: 1.7, portals: ['dash'], shards: 1 },
  { id: 'candy-comet', target: .74, phrase: [3, 3], rest: 1.6, portals: ['spring'], shards: 1 },
  { id: 'aqua-pulse', target: .76, phrase: [3, 3], rest: 1.6, portals: ['float'], shards: 1 },
  { id: 'crystal-cavern', target: .78, phrase: [3, 3], rest: 1.5, portals: ['phase'], shards: 1 },
  { id: 'stormbreaker', target: .80, phrase: [3, 4], rest: 1.5, portals: ['float', 'dash'], shards: 1 },
  { id: 'final-orbit', target: .82, phrase: [3, 4], rest: 1.4, portals: ['spring', 'dash'], shards: 1 },
  { id: 'mosslight-hollow', target: .84, phrase: [4, 4], rest: 1.4, portals: ['float'], shards: 2 },
  { id: 'clockwork-orchard', target: .86, phrase: [4, 4], rest: 1.3, portals: ['dash', 'spring'], shards: 2 },
  { id: 'tidal-foundry', target: .88, phrase: [4, 4], rest: 1.3, portals: ['dash'], shards: 2 },
  { id: 'paper-moon-parade', target: .90, phrase: [4, 4], rest: 1.2, portals: ['spring', 'spring'], shards: 2 },
  { id: 'verdant-relay', target: .92, phrase: [4, 4], rest: 1.2, portals: ['float'], shards: 3 },
  { id: 'shatterglass-express', target: .95, phrase: [4, 4], rest: 1.1, portals: ['phase', 'dash'], shards: 2 },
  { id: 'cloudbreaker-causeway', target: .97, phrase: [4, 4], rest: 1.1, portals: ['shield'], shards: 2 },
  { id: 'magnetar-foundry', target: 1, phrase: [4, 5], rest: 1.0, portals: ['dash', 'dash'], shards: 2 },
  { id: 'eclipse-crown', target: 1, phrase: [5, 5], rest: 1.0, portals: ['shield', 'float'], shards: 3 },
];

const platformKinds = {
  'pixel-pier': 'pier',
  'midnight-circuit': 'curb',
  'candy-comet': 'nougat',
  'aqua-pulse': 'reef',
  'crystal-cavern': 'crystal',
  stormbreaker: 'cliff',
  'final-orbit': 'gantry',
  'mosslight-hollow': 'hover',
  'clockwork-orchard': 'trellis',
  'tidal-foundry': 'conveyor',
  'paper-moon-parade': 'float',
  'verdant-relay': 'leaf',
  'shatterglass-express': 'rail',
  'cloudbreaker-causeway': 'cloudstone',
  'magnetar-foundry': 'magnetic',
  'eclipse-crown': 'observatory',
};

function tierFor(index) {
  if (index < 4) return 1;
  if (index < 8) return 2;
  if (index < 14) return 3;
  return 4;
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function seededRandom(id, variant) {
  let hash = 2166136261;
  const seed = `${id}:v0.6.0:${variant}`;
  for (let index = 0; index < seed.length; index++) {
    hash ^= seed.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  let state = hash >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function partitionBeats(total, [minimum, maximum], random) {
  const preferred = (minimum + maximum) / 2;
  const phraseCount = Math.max(1, Math.round(total / preferred));
  const phrases = Array.from({ length: phraseCount }, () => (
    minimum === maximum ? minimum : minimum + Math.floor(random() * (maximum - minimum + 1))
  ));
  let sum = phrases.reduce((totalBeats, beats) => totalBeats + beats, 0);
  let cursor = 0;
  while (sum > total) {
    const index = cursor % phrases.length;
    if (phrases[index] > 1 && (phrases[index] > minimum || !phrases.some((beats) => beats > minimum))) {
      phrases[index]--;
      sum--;
    }
    cursor++;
  }
  while (sum < total) {
    const index = cursor % phrases.length;
    if (phrases[index] < maximum || !phrases.some((beats) => beats < maximum)) {
      phrases[index]++;
      sum++;
    }
    cursor++;
  }
  return phrases;
}

function beatKinds(total, tier, random, phrases) {
  const patterns = tier <= 2
    ? [
        ['hazard', 'gap'],
        ['hazard', 'gap', 'hazard', 'hazard', 'gap'],
      ]
    : [
        ['hazard', 'gap', 'enemy', 'hazard', 'gap', 'hazard', 'enemy', 'gap'],
        ['hazard', 'enemy', 'gap', 'hazard', 'gap', 'enemy', 'hazard', 'gap'],
      ];
  const withEnemies = patterns.map((pattern) => pattern.map((kind) => (
    kind === 'enemy' && tier === 2 ? 'hazard' : kind
  )));
  const pattern = withEnemies[Math.floor(random() * withEnemies.length)];
  const result = Array.from({ length: total }, (_, index) => pattern[index % pattern.length]);
  // A gap-first combo lets the solver plan the gap arc before any following
  // hazard. This matters especially while float gravity is active.
  let phraseStart = 0;
  for (const length of phrases) {
    const section = result.slice(phraseStart, phraseStart + length);
    section.sort((a, b) => Number(b === 'gap') - Number(a === 'gap'));
    result.splice(phraseStart, length, ...section);
    phraseStart += length;
  }
  for (let index = 2; index < result.length; index++) {
    if (result[index] === result[index - 1] && result[index] === result[index - 2]) {
      result[index] = result[index] === 'hazard' ? 'gap' : 'hazard';
    }
  }
  return result;
}

function speedAt(level, at) {
  const timing = courseSpeedTimeline(level).advance(at);
  return { ...timing, reach: jumpReach(timing.speed) };
}

function portalBoundaries(phraseCount, portalTypes) {
  const result = new Map();
  portalTypes.forEach((type, index) => {
    const boundary = Math.max(1, Math.min(phraseCount - 1, Math.floor((index + 1) * phraseCount / (portalTypes.length + 1))));
    result.set(boundary, { type, index });
  });
  return result;
}

function minimumRest(portalType, reach, variant) {
  const margin = 1.43 + (variant % 3) * .025;
  if (portalType === 'spring') return 1.78 * reach;
  if (portalType === 'dash') return margin * reach * portalEffects.dash.speedMultiplier;
  return margin * reach;
}

function addBeat(layout, beat) {
  const at = round(beat.at);
  if (beat.kind === 'hazard') {
    layout.obstacles.push([at, beat.count]);
  } else if (beat.kind === 'gap') {
    layout.gaps.push({ at, width: beat.width });
  } else {
    const enemyIndex = layout.enemies.length;
    const type = beat.tier === 2 ? 'crawler' : (enemyIndex % 2 === 0 ? 'drone' : 'crawler');
    layout.enemies.push(type === 'drone' ? { at, type, height: 1.05 } : { at, type });
  }
}

function phraseCopy(level) {
  const beats = beatWindows(level)
    .filter(({ kind }) => kind === 'hazard' || kind === 'gap' || kind === 'enemy')
    .sort((a, b) => a.at - b.at);
  let pair = null;
  for (let index = 1; index < beats.length; index++) {
    if (beats[index].at - beats[index - 1].at <= COMBO_MAX * beats[index].reach) {
      pair = [beats[index - 1], beats[index]];
      break;
    }
  }
  if (!pair) return `${level.name} leaves a full rest between every beat.`;
  const [previous, next] = pair;
  const style = level.hazardStyle.replaceAll('-', ' ');
  if (previous.kind === 'gap' && next.kind === 'hazard') {
    return `Gap, then a ${next.count === 2 ? 'double ' : ''}${style} group in the same jump.`;
  }
  if (previous.kind === 'hazard' && next.kind === 'gap') {
    return `A ${previous.count === 2 ? 'double ' : ''}${style} group into a gap in the same jump.`;
  }
  if (previous.kind === 'hazard' && next.kind === 'hazard') {
    return `Two ${style} groups in one jump.`;
  }
  if (previous.kind === 'gap' && next.kind === 'enemy') {
    return `Gap, then a ${next.type} in the same jump.`;
  }
  if (previous.kind === 'hazard' && next.kind === 'enemy') {
    return `A ${style} group into a ${next.type} in the same jump.`;
  }
  if (previous.kind === 'enemy' && next.kind === 'gap') {
    return `A ${previous.type} into a gap in one arc.`;
  }
  if (previous.kind === 'enemy' && next.kind === 'hazard') {
    return `A ${previous.type} into a ${style} group in one arc.`;
  }
  return `${level.name} joins two gaps in one jump.`;
}

function plural(count, singular) {
  return `${count} ${count === 1 ? singular : `${singular}s`}`;
}

function listPhrase(items) {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`;
}

function designCopy(level) {
  const parts = [`${level.obstacles.length} ${level.hazardStyle.replaceAll('-', ' ')} groups`];
  if (level.gaps.length) parts.push(plural(level.gaps.length, 'gap'));
  if (level.platforms.length) parts.push(`${level.platforms.length} low ${level.platforms[0].kind} ${level.platforms.length === 1 ? 'bridge' : 'bridges'}`);
  if (level.portals.length) {
    const types = [...new Set(level.portals.map(({ type }) => type))];
    parts.push(`${plural(level.portals.length, 'portal')} (${listPhrase(types)})`);
  }
  if (level.enemies.length) {
    const types = [...new Set(level.enemies.map(({ type }) => type))];
    parts.push(`${level.enemies.length} ${listPhrase(types)}`);
  }
  if (level.collectibles.length) parts.push(`${level.collectibles.length} apex ${level.collectibles.length === 1 ? 'shard' : 'shards'}`);
  return `${level.name} lays out ${listPhrase(parts)}.`;
}

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

function placeShards(level, brief) {
  if (brief.shards === 0) return true;
  const result = playLevel(level);
  if (!result.completed) return false;
  const movementPortals = new Set(['spring', 'dash', 'float']);
  const firstMovement = result.events.find(({ type, portal }) => type === 'portal' && movementPortals.has(portal));
  const cutoff = firstMovement?.time ?? Infinity;
  const windows = beatWindows(level).filter(({ kind }) => kind === 'hazard' || kind === 'gap' || kind === 'enemy');
  const apexDistance = level.speed * jumpTuning.initialVelocity / motionTuning.gravity;
  const apexHeight = jumpTuning.initialVelocity ** 2 / (2 * motionTuning.gravity);
  const candidates = [];
  for (const event of result.events) {
    if (event.type !== 'jump' || event.time >= cutoff) continue;
    const apexAt = event.at + apexDistance;
    const options = [];
    for (let at = Math.max(3, event.at + .3); at <= Math.min(level.length - 3, event.at + jumpReach(level.speed)); at += .05) {
      const time = (at - event.at) / level.speed;
      const height = jumpTuning.initialVelocity * time - .5 * motionTuning.gravity * time ** 2;
      if (height < 1.45 || height > apexHeight + .02) continue;
      if (windows.some(({ start, end }) => at > start - .12 && at < end + .12)) continue;
      options.push({ at, height, score: height - Math.abs(at - apexAt) * .0001 });
    }
    options.sort((a, b) => b.score - a.score);
    const shard = options.find(({ at }) => candidates.every((existing) => Math.abs(existing.at - at) >= 1));
    if (shard) candidates.push({ at: round(shard.at), height: round(shard.height, 2) });
    if (candidates.length === brief.shards) break;
  }
  if (candidates.length !== brief.shards) return false;
  level.collectibles = candidates;
  return true;
}

function compoundCount(level) {
  let count = 0;
  for (const gap of level.gaps) {
    const bridged = level.platforms.some((platform) => (
      platform.at <= gap.at && platform.at + platform.width >= gap.at + gap.width
    ));
    if (bridged) count++;
  }
  return count;
}

export function buildCandidate(base, brief, index, totalBeats, variant) {
  const random = seededRandom(base.id, variant);
  const tier = tierFor(index);
  const requiredBridges = tier === 2 ? 1 : tier === 3 ? 2 : tier === 4 ? 3 : 0;
  const phrases = partitionBeats(totalBeats, brief.phrase, random);
  const kinds = beatKinds(totalBeats, tier, random, phrases);
  const hasEnemy = tier >= 3 || (tier === 2 && index >= 6);
  const bridgeBeatIndices = new Set();
  const fixedIndices = new Set();
  const floatCourse = tier > 1 && tier < 4 && brief.portals.includes('float');
  const floatOpenPhrases = [];
  if (tier > 1) {
    kinds.fill('hazard');
    let phraseStart = 0;
    for (let phraseIndex = 0; phraseIndex < phrases.length; phraseIndex++) {
      const phraseLength = phrases[phraseIndex];
      const fixed = new Map();
      if (phraseIndex < requiredBridges && phraseLength >= 2) {
        fixed.set(phraseLength - 1, 'gap');
        if (phraseIndex % 2 === 0) fixed.set(phraseLength - 2, 'gap');
        bridgeBeatIndices.add(phraseStart + phraseLength - 1);
      }
      if (hasEnemy && phraseIndex === phrases.length - 1) {
        if (tier === 4) {
          fixed.set(0, 'enemy');
        } else {
          fixed.set(phraseLength - 1, 'enemy');
          if (phraseLength >= 2 && !fixed.has(phraseLength - 2)) fixed.set(phraseLength - 2, 'gap');
        }
      }
      for (const [within, kind] of fixed) {
        kinds[phraseStart + within] = kind;
        fixedIndices.add(phraseStart + within);
      }
      const open = Array.from({ length: phraseLength }, (_, within) => within).filter((within) => !fixed.has(within));
      if (floatCourse) {
        floatOpenPhrases.push({ phraseStart, open });
      } else {
        const gapCount = open.length <= 1 ? 0 : Math.max(1, open.length - 2);
        open.forEach((within, openIndex) => {
          kinds[phraseStart + within] = openIndex < gapCount ? 'gap' : 'hazard';
        });
      }
      phraseStart += phraseLength;
    }
    if (floatCourse) {
      const attempts = 2 ** floatOpenPhrases.length;
      for (let attempt = 0; attempt < attempts; attempt++) {
        const mask = (attempt + variant) % attempts;
        floatOpenPhrases.forEach(({ phraseStart, open }, phraseIndex) => {
          open.forEach((within, openIndex) => {
            kinds[phraseStart + within] = (openIndex + phraseIndex + ((mask >> phraseIndex) & 1) + variant) % 2 === 0 ? 'gap' : 'hazard';
          });
        });
        const triple = kinds.some((kind, kindIndex) => kindIndex >= 2 && kind === kinds[kindIndex - 1] && kind === kinds[kindIndex - 2]);
        const hazards = kinds.filter((kind) => kind === 'hazard').length;
        if (!triple && hazards >= 3) break;
      }
    } else {
      kinds[0] = 'hazard';
    }
  } else {
    kinds[0] = 'hazard';
  }
  for (let kindIndex = 2; kindIndex < kinds.length; kindIndex++) {
    if (kinds[kindIndex] !== kinds[kindIndex - 1] || kinds[kindIndex] !== kinds[kindIndex - 2]) continue;
    const replacement = kinds[kindIndex] === 'hazard' ? 'gap' : 'hazard';
    const order = kinds[kindIndex] === 'hazard'
      ? [kindIndex - 1, kindIndex, kindIndex - 2]
      : [kindIndex - 2, kindIndex - 1, kindIndex];
    const candidates = order.filter((candidate) => !fixedIndices.has(candidate));
    const target = candidates[0] ?? kindIndex;
    kinds[target] = replacement;
  }
  if (tier > 1 && brief.portals.some((type) => type === 'float' || type === 'dash')) {
    let phraseStart = 0;
    for (const phraseLength of phrases) {
      for (let within = 1; within < phraseLength; within++) {
        const kindIndex = phraseStart + within;
        if (kinds[kindIndex] === 'gap' && kinds[kindIndex - 1] === 'hazard') bridgeBeatIndices.add(kindIndex);
      }
      phraseStart += phraseLength;
    }
  }
  const boundaries = portalBoundaries(phrases.length, brief.portals);
  const layout = {
    ...base,
    obstacles: [],
    gaps: [],
    platforms: [],
    portals: [],
    enemies: [],
    collectibles: [],
  };
  const beats = [];
  const portalFractions = new Map();
  const baseReach = jumpReach(base.speed);
  let globalIndex = 0;

  for (let phraseIndex = 0; phraseIndex < phrases.length; phraseIndex++) {
    for (let withinPhrase = 0; withinPhrase < phrases[phraseIndex]; withinPhrase++) {
      const previous = beats.at(-1);
      let at = base.speed * INTRO_SECONDS;
      if (previous && withinPhrase === 0) {
        const portal = boundaries.get(phraseIndex);
        const fraction = .34 + (variant % 4) * .055;
        let rest = minimumRest(portal?.type, baseReach, variant);
        let portalAt = previous.at + rest * fraction;
        const workingPortals = portal ? [...layout.portals, { at: portalAt, type: portal.type }] : layout.portals;
        const reach = speedAt({ ...layout, portals: workingPortals }, previous.at + rest).reach;
        rest = Math.max(rest, REST_MIN * 1.055 * reach);
        if (portal) {
          portalAt = previous.at + rest * fraction;
          layout.portals.push({ at: round(portalAt), type: portal.type });
          portalFractions.set(phraseIndex, fraction);
        }
        at = previous.at + rest;
      } else if (previous) {
        const ratio = previous.kind === 'gap'
          ? .565 + Math.floor(random() * 4) * .018
          : .75 + Math.floor(random() * 4) * .0125;
        let distance = ratio * speedAt(layout, previous.at).reach;
        for (let iteration = 0; iteration < 3; iteration++) {
          distance = ratio * speedAt(layout, previous.at + distance).reach;
          if (previous.kind !== 'gap') distance = Math.min(distance, .775 * baseReach);
        }
        if (previous.kind === 'gap') {
          const radius = kinds[globalIndex] === 'enemy' ? .8 : getHazardProfile(base.hazardStyle).width / 2 + .15;
          const separateLanding = previous.separate || previous.bridge || kinds[globalIndex] === 'gap' || distance > 5 + radius;
          if (separateLanding) {
            for (let iteration = 0; iteration < 3; iteration++) {
              distance = Math.min(.78 * speedAt(layout, previous.at + distance).reach, .775 * baseReach);
            }
          }
        }
        at = previous.at + distance;
      }
      const hazardIndex = layout.obstacles.length + beats.filter((beat) => beat.kind === 'hazard').length;
      const double = kinds[globalIndex] === 'hazard'
        && withinPhrase === phrases[phraseIndex] - 1
        && (base.id === 'neon-run'
          ? hazardIndex % 3 === 1
          : ((globalIndex + variant) % (tier >= 3 ? 3 : 4) === 1));
      // Keep enough supported landing track for a following combo beat. A
      // wider gap can make the runner land inside that beat's collision window.
      const width = 2.5;
      beats.push({
        at,
        kind: kinds[globalIndex],
        count: double ? 2 : 1,
        width,
        phrase: phraseIndex,
        tier,
        bridge: bridgeBeatIndices.has(globalIndex),
        separate: brief.shards >= 2 && globalIndex === 0 && kinds[globalIndex] === 'gap',
      });
      globalIndex++;
    }
  }

  const last = beats.at(-1);
  const lastEnd = last.at + (last.kind === 'gap' ? last.width : last.kind === 'hazard' ? (last.count - 1) * 1.28 : .8);
  let extra = base.length - base.speed * OUTRO_SECONDS - lastEnd;
  if (extra < 0 || phrases.length < 2) {
    if (process.env.COMPOSE_DEBUG) console.log(base.id, variant, 'length rejection', extra, phrases);
    return null;
  }

  const additions = Array(phrases.length - 1).fill(0);
  for (let boundary = 1; boundary < phrases.length; boundary++) {
    const previousPhrase = beats.filter((beat) => beat.phrase === boundary - 1);
    const nextPhrase = beats.filter((beat) => beat.phrase === boundary);
    const current = nextPhrase[0].at - previousPhrase.at(-1).at;
    const desired = brief.rest * base.speed;
    const addition = Math.min(extra, Math.max(0, desired - current));
    additions[boundary - 1] = addition;
    extra -= addition;
  }
  while (extra > .0001) {
    const share = extra / additions.length;
    for (let index = 0; index < additions.length; index++) additions[index] += share;
    extra = 0;
  }

  for (const beat of beats) {
    for (let boundary = 1; boundary <= beat.phrase; boundary++) beat.at += additions[boundary - 1];
  }
  layout.portals = [];
  for (const [boundary, portal] of boundaries) {
    const previous = beats.filter((beat) => beat.phrase === boundary - 1).at(-1);
    const next = beats.find((beat) => beat.phrase === boundary);
    const fraction = portalFractions.get(boundary);
    layout.portals.push({
      at: round(previous.at + (next.at - previous.at) * fraction),
      type: portal.type,
      index: portal.index,
    });
  }
  layout.portals.sort((a, b) => a.at - b.at || a.index - b.index);
  layout.portals = layout.portals.map(({ at, type }) => ({ at, type }));

  for (let index = 0; index < beats.length; index++) {
    const beat = beats[index];
    const next = beats[index + 1];
    if (beat.kind === 'gap' && !beat.bridge && !beat.separate && next?.phrase === beat.phrase && next.kind !== 'gap') {
      // Join collision windows when the five-unit gap limit permits it. At
      // dash speed a wider combo instead retains a narrow gap and a supported
      // landing lane for a second takeoff.
      const distance = next.at - beat.at;
      const radius = next.kind === 'enemy' ? .8 : getHazardProfile(base.hazardStyle).width / 2 + .15;
      beat.width = distance <= 5 + radius
        ? round(Math.min(5, Math.max(2.5, distance - .1)), 1)
        : 2.5;
    }
  }
  for (const beat of beats) addBeat(layout, beat);

  if (layout.gaps.length < requiredBridges) return null;
  const bridgeAts = new Set(beats.filter((beat) => beat.bridge).map((beat) => round(beat.at)));
  if (bridgeAts.size < requiredBridges) {
    if (process.env.COMPOSE_DEBUG) console.log(base.id, variant, 'bridge rejection', bridgeAts.size, requiredBridges);
    return null;
  }
  const kind = platformKinds[base.id];
  layout.platforms = layout.gaps.filter((gap) => bridgeAts.has(gap.at)).map((gap, platformIndex) => ({
    at: gap.at,
    width: gap.width,
    height: .05,
    kind,
  }));

  if (!placeShards(layout, brief)) {
    if (process.env.COMPOSE_DEBUG) console.log(base.id, variant, 'shard or completion rejection');
    return null;
  }
  layout.signature = phraseCopy(layout);
  layout.designHook = designCopy(layout);
  const result = playLevel(layout);
  const metrics = analyzeLevel(layout, result);
  return { level: layout, phrases, result, metrics };
}

function acceptable(candidate, brief, tier) {
  if (!candidate) return false;
  const { level, result, metrics } = candidate;
  if (!result.completed || result.deaths !== 0) return false;
  if (metrics.deadBandViolations.length !== 0) return false;
  if (Math.abs(metrics.inputsPerSecond / brief.target - 1) > .08) return false;
  if (level.collectibles.length !== brief.shards) return false;
  const requiredCompounds = tier === 3 ? 2 : tier === 4 ? 3 : 0;
  if (compoundCount(level) < requiredCompounds) return false;
  if (featureTypes(level).size < 3) return false;
  const inputs = beatWindows(level).filter(({ kind }) => kind === 'hazard' || kind === 'gap' || kind === 'enemy');
  if (inputs[0].at < level.speed * (INTRO_SECONDS - .02)) return false;
  const final = inputs.at(-1);
  if (final.courseEnd > level.length - level.speed * (OUTRO_SECONDS - .03)) return false;
  for (let index = 1; index < inputs.length; index++) {
    const distance = inputs[index].at - inputs[index - 1].at;
    const reach = inputs[index].reach;
    if (distance <= 0 || (distance > COMBO_MAX * reach && distance < REST_MIN * reach)) return false;
  }
  return true;
}

export function composeLevel(base, brief, index) {
  const dashCount = brief.portals.filter((type) => type === 'dash').length;
  const dashSaving = dashCount * portalEffects.dash.duration * (1 - 1 / portalEffects.dash.speedMultiplier);
  const estimatedTime = base.length / base.speed - dashSaving;
  const expected = Math.round(brief.target * estimatedTime);
  const totals = [expected];
  for (let offset = 1; offset <= 3; offset++) totals.push(expected + offset, expected - offset);
  let bestFailure = null;
  for (const total of totals) {
    if (total < 3) continue;
    for (let variant = 0; variant < 48; variant++) {
      const candidate = buildCandidate(base, brief, index, total, variant);
      if (acceptable(candidate, brief, tierFor(index))) return candidate;
      if (candidate && !bestFailure) bestFailure = candidate;
    }
  }
  const failure = bestFailure?.result.events.findLast(({ type }) => type === 'death')?.reason ?? 'no fair candidate';
  throw new Error(`${base.id}: composer could not meet the blueprint (${failure})`);
}

export function composeLevels(catalog = levels) {
  if (catalog.length !== blueprint.length) throw new Error('The composer expects twenty courses.');
  return catalog.map((level, index) => {
    const brief = blueprint[index];
    if (level.id !== brief.id) throw new Error(`Blueprint order mismatch at ${index + 1}: ${level.id}`);
    return composeLevel(level, brief, index);
  });
}

function quote(value) {
  return `'${value.replaceAll('\\', '\\\\').replaceAll("'", "\\'")}'`;
}

function formatValue(value) {
  if (Array.isArray(value)) return `[${value.map(formatValue).join(', ')}]`;
  if (typeof value === 'object') {
    return `{ ${Object.entries(value).map(([key, entry]) => `${key}: ${formatValue(entry)}`).join(', ')} }`;
  }
  if (typeof value === 'string') return quote(value);
  return String(value);
}

function rewriteLevels(source, composed) {
  const replacements = composed.map(({ level }) => {
    const idIndex = source.indexOf(`id: '${level.id}'`);
    if (idIndex < 0) throw new Error(`Cannot find ${level.id} in src/levels.js`);
    const start = source.lastIndexOf('  {', idIndex);
    const end = source.indexOf('\n  },', idIndex);
    if (start < 0 || end < 0) throw new Error(`Cannot parse ${level.id}'s course block`);
    let block = source.slice(start, end);
    block = block.replace(/signature: '(?:\\.|[^'])*', designHook: '(?:\\.|[^'])*',/, `signature: ${quote(level.signature)}, designHook: ${quote(level.designHook)},`);
    const keys = ['obstacles', 'gaps', 'platforms', 'portals', 'enemies', 'collectibles'];
    const lines = block.split('\n').filter((line) => !keys.some((key) => line.startsWith(`    ${key}:`)));
    const hookIndex = lines.findIndex((line) => line.includes('hazardStyle:'));
    if (hookIndex < 0) throw new Error(`Cannot locate ${level.id}'s layout anchor`);
    lines.splice(hookIndex + 1, 0, ...keys.map((key) => `    ${key}: ${formatValue(level[key])},`));
    return { start, end, block: lines.join('\n') };
  });
  let output = source;
  for (const { start, end, block } of replacements.reverse()) output = output.slice(0, start) + block + output.slice(end);
  return output;
}

function featureLine(level) {
  const hazards = level.obstacles.map(([at, count]) => `${at}${count === 2 ? ' (double)' : ''}`).join(', ');
  const gaps = level.gaps.map(({ at, width }) => `${at} (${width})`).join(', ') || 'none';
  const bridges = level.platforms.map(({ at, width, height, kind }) => `${kind} at ${at}, width ${width}, height ${height}`).join('; ') || 'none';
  const portals = level.portals.map(({ at, type }) => `${type} at ${at}`).join(', ') || 'none';
  const enemies = level.enemies.map(({ at, type }) => `${type} at ${at}`).join(', ') || 'none';
  const shards = level.collectibles.map(({ at, height }) => `${at} (height ${height})`).join(', ') || 'none';
  return `- **Layout:** Hazard groups at ${hazards}; gaps at ${gaps}; bridges: ${bridges}; portals: ${portals}; enemies: ${enemies}; shards: ${shards}.`;
}

export function renderDesignPlan(composed, checklist) {
  const output = [
    '# Enrique Dash — 20-Level Course Plan',
    '',
    '## How the courses are composed',
    '',
    'Run `npm run levels:compose` to deterministically rebuild every layout from its level-id seed and the v0.6.0 blueprint. The composer preserves course identity, art, music, speed and length; lays combo phrases and fair rests against the real portal speed profile; places low bridges and apex shards; and rejects any layout that the unchanged auto-player cannot finish without a death or dead-band violation. See [the level verification pipeline](docs/LEVEL_PIPELINE.md) for the shared physics and checks.',
    '',
    '## Individual designs',
    '',
  ];
  composed.forEach(({ level, phrases, metrics }, index) => {
    output.push(
      `### ${String(index + 1).padStart(2, '0')} — ${level.name} (${level.length} units)`,
      `- **Signature:** ${level.signature}`,
      `- **Rhythm:** ${phrases.join(' + ')} input beats; target ${blueprint[index].target.toFixed(2)} inputs/s, measured ${metrics.inputsPerSecond.toFixed(2)}; ${plural(level.gaps.length, 'gap')} and ${plural(level.platforms.length, 'compound bridge')}.`,
      `- **Design hook:** ${level.designHook}`,
      featureLine(level),
      `- **Audio:** ${level.music.bpm} BPM with the existing sixteen-step procedural motif.`,
      '',
    );
  });
  output.push(checklist.trim(), '');
  return output.join('\n');
}

function main() {
  const composed = composeLevels(levels);
  validateLevels(composed.map(({ level }) => level));
  const source = readFileSync(LEVELS_PATH, 'utf8');
  const plan = readFileSync(PLAN_PATH, 'utf8');
  const checklist = plan.slice(plan.indexOf('## Playtest checklist'));
  if (!checklist) throw new Error('LEVEL_DESIGN_PLAN.md is missing its Playtest checklist.');
  writeFileSync(LEVELS_PATH, rewriteLevels(source, composed));
  writeFileSync(PLAN_PATH, renderDesignPlan(composed, checklist));
  for (const { level, metrics } of composed) {
    console.log(`${level.id}: ${metrics.beats} inputs | ${metrics.inputsPerSecond.toFixed(3)} inputs/s | ${metrics.result.deaths} deaths | ${metrics.deadBandViolations.length} dead-band violations`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
