import test from 'node:test';
import assert from 'node:assert/strict';
import { getLevel, levelValidationError, levels, validateLevels } from './levels.js';
import { woolLevels } from './levels-wool.js';
import { finishGateDistance, jumpTuning, motionTuning, platformTuning, safeCheckpointDistance } from './game-logic.js';
import { playLevel } from '../tools/auto-player.mjs';
import { analyzeLevel } from '../tools/level-report.mjs';
import { beatWindows, courseSpeedTimeline, jumpHeightAt, jumpReach } from '../tools/level-physics.mjs';
import { blueprint } from '../tools/compose-levels.mjs';
import { woolBlueprint } from '../tools/wool-blueprint.mjs';

test('the valid course catalog imports without a validation failure', () => {
  assert.equal(levelValidationError, null);
});

test('the campaign contains twenty uniquely named playable levels', () => {
  assert.equal(levels.length, 20);
  assert.equal(new Set(levels.map((level) => level.id)).size, levels.length);
  assert.equal(new Set(levels.map((level) => level.name)).size, levels.length);
});

test('each course has validated rhythm, length, and obstacle groups', () => {
  assert.equal(validateLevels(levels), true);
  for (const level of levels) {
    assert.ok(level.obstacles.length >= 3, `${level.name} needs a playable hazard rhythm`);
    assert.ok(level.music.motif.length === 16, `${level.name} needs a one-bar motif`);
  }
});

test('every course ends at the finish gate after its last beat', () => {
  for (const level of levels) {
    const gate = finishGateDistance(level);
    assert.equal(gate, level.length, `${level.id} finish gate drifted from the course length`);
    for (const beat of beatWindows(level)) {
      assert.ok(gate > beat.end, `${level.id} ${beat.id} ends at ${beat.end}, at or past the gate ${gate}`);
    }
  }
});

test('every course of 120 units or more has a checkpoint and no shorter course gets one', () => {
  for (const level of levels) {
    const checkpoint = safeCheckpointDistance(level);
    if (level.length >= 120) assert.ok(Number.isFinite(checkpoint), `${level.id} has no checkpoint`);
    else assert.equal(checkpoint, null, `${level.id} is too short for a checkpoint`);
  }
});

test('course lengths rise gradually to a maximum of 150 track units', () => {  for (let index = 1; index < levels.length; index++) {
    assert.ok(levels[index].length > levels[index - 1].length, `${levels[index].name} should be longer than the previous course`);
  }
  assert.ok(levels.at(-1).length <= 150);
});

test('each post-tutorial level has its own signature and working special mechanics', () => {
  const advanced = levels.slice(1);
  assert.equal(new Set(advanced.map((level) => level.signature)).size, advanced.length);
  for (const level of advanced) {
    assert.ok(level.designHook, `${level.name} needs a design hook`);
    assert.ok(['gaps', 'platforms', 'portals', 'enemies'].some((key) => level[key].length > 0), `${level.name} needs a special course feature`);
  }
});

test('level lookup is stable and returns undefined for unknown ids', () => {
  assert.equal(getLevel(levels[0].id), levels[0]);
  assert.equal(getLevel('not-a-level'), undefined);
});

function tierFor(index) {
  if (index < 4) return 1;
  if (index < 8) return 2;
  if (index < 14) return 3;
  return 4;
}

function inputBeats(level) {
  return beatWindows(level)
    .filter(({ kind }) => kind === 'hazard' || kind === 'gap' || kind === 'enemy')
    .sort((a, b) => a.at - b.at);
}

function featureTypes(level) {
  // Tier 1 is limited to hazards and gaps, so a single and a double hazard
  // group count as separate layout features alongside gaps.
  const types = new Set();
  for (const [, count] of level.obstacles) types.add(count === 2 ? 'double-hazard' : 'single-hazard');
  if (level.gaps.length) types.add('gap');
  if (level.platforms.length) types.add('bridge');
  if (level.portals.length) types.add('portal');
  if (level.enemies.length) types.add('enemy');
  if (level.collectibles.length) types.add('shard');
  return types;
}

function compoundBeats(level) {
  // A compound beat is a deliberate two-in-one: the following beat stays
  // inside the combo band instead of becoming a separate landing.
  const beats = inputBeats(level);
  let count = 0;
  for (let index = 1; index < beats.length; index++) {
    if (beats[index].at - beats[index - 1].at <= .8 * beats[index].reach) count++;
  }
  return count;
}

function bridgedGaps(level) {
  return level.gaps.filter((gap) => level.platforms.some((platform) => (
    platform.height <= platformTuning.maxStepHeight
    && platform.at <= gap.at
    && platform.at + platform.width >= gap.at + gap.width
  ))).length;
}

function averageRate(from, to) {
  const rates = levels.slice(from, to).map((level) => analyzeLevel(level).inputsPerSecond);
  return rates.reduce((sum, rate) => sum + rate, 0) / rates.length;
}

test('the auto-player finishes all twenty composed courses without a death', () => {
  for (const level of levels) {
    const result = playLevel(level);
    assert.equal(result.completed, true, `${level.id} was not completed`);
    assert.equal(result.deaths, 0, `${level.id} recorded a death: ${result.events.find(({ type }) => type === 'death')?.reason}`);
  }
});

test('no composed course authors a beat inside the 0.80–1.35 reach dead band', () => {
  for (const level of levels) {
    const violations = analyzeLevel(level).deadBandViolations;
    assert.deepEqual(violations, [], `${level.id} has ${violations.length} dead-band violations`);
  }
});

test('every course lands within five percent of its blueprint input rate', () => {
  levels.forEach((level, index) => {
    const measured = analyzeLevel(level).inputsPerSecond;
    const target = blueprint[index].target;
    assert.ok(
      Math.abs(measured / target - 1) <= .05,
      `${level.id} measured ${measured.toFixed(3)} inputs/s against a ${target.toFixed(2)} target`,
    );
  });
});

test('bridges stay a rare choice and every course from five on keeps two open gaps', () => {
  levels.forEach((level, index) => {
    const bridges = bridgedGaps(level);
    const cap = index < 4 ? 0 : index < 10 ? 1 : 2;
    assert.ok(bridges <= cap, `${level.id} carries ${bridges} bridges against a cap of ${cap}`);
    assert.ok(bridges * 3 <= level.gaps.length, `${level.id} bridges too many of its gaps (${bridges}/${level.gaps.length})`);
    if (index >= 4) {
      assert.ok(level.gaps.length - bridges >= 2, `${level.id} needs at least two open gaps`);
    }
  });
});

test('the auto-player jumps at least three quarters of the jump-triggering beats', () => {
  for (const level of levels) {
    const result = playLevel(level);
    const beats = inputBeats(level).length;
    assert.ok(
      result.jumps >= .75 * beats,
      `${level.id} jumped ${result.jumps} times for ${beats} beats`,
    );
  }
});

test('every course leaves at least 0.35 units of jump tolerance', () => {
  for (const level of levels) {
    const metrics = analyzeLevel(level);
    assert.ok(
      metrics.tightestMargin >= .35,
      `${level.id} has only ${metrics.tightestMargin?.toFixed(2)} units of margin`,
    );
  }
});

test('the first beat of each phrase has at least 0.6 seconds of telegraph', () => {
  for (const level of levels) {
    const metrics = analyzeLevel(level);
    assert.deepEqual(metrics.telegraphViolations, [], `${level.id} has short first-beat telegraphs`);
    assert.ok(metrics.minimumTelegraph >= .6, `${level.id} has only ${metrics.minimumTelegraph.toFixed(2)}s of telegraph`);
  }
});

test('beats keep 0.75 units of end clearance and gaps keep half a reach of landing room', () => {
  for (const level of levels) {
    const beats = inputBeats(level);
    for (let index = 1; index < beats.length; index++) {
      const previous = beats[index - 1];
      const beat = beats[index];
      assert.ok(beat.at - previous.courseEnd >= .75, `${level.id} starts ${beat.id} too soon after ${previous.id}`);
      if (previous.kind === 'gap') {
        assert.ok(
          beat.at - previous.courseEnd >= .5 * beat.reach,
          `${level.id} leaves too little landing room after ${previous.id}`,
        );
      }
    }
  }
});

test('average inputs per second rises across each five-course block', () => {
  const blocks = [averageRate(0, 5), averageRate(5, 10), averageRate(10, 15), averageRate(15, 20)];
  for (let index = 1; index < blocks.length; index++) {
    assert.ok(blocks[index] > blocks[index - 1], `block ${index + 1} (${blocks[index].toFixed(3)}) should beat block ${index} (${blocks[index - 1].toFixed(3)})`);
  }
});

test('every course uses three feature types, compounds from T3 and never repeats a beat three times', () => {
  levels.forEach((level, index) => {
    assert.ok(featureTypes(level).size >= 3, `${level.id} uses only ${[...featureTypes(level)].join(', ')}`);
    if (tierFor(index) >= 3) assert.ok(compoundBeats(level) >= 1, `${level.id} needs a compound beat`);
    const kinds = inputBeats(level).map(({ kind }) => kind);
    for (let kindIndex = 2; kindIndex < kinds.length; kindIndex++) {
      assert.ok(
        !(kinds[kindIndex] === kinds[kindIndex - 1] && kinds[kindIndex] === kinds[kindIndex - 2]),
        `${level.id} repeats ${kinds[kindIndex]} three times in a row`,
      );
    }
  });
});

// Shards come in two kinds: those sitting on a mandatory jump arc (collected by the auto-player)
// and those above a raised kerb (a deliberate optional jump from the kerb surface). Both must be
// reachable, clear of gaps and hazards, and inside the ballistic apex band measured from their
// own launch surface.
test('every shard sits in the reachable apex band above a jump, clear of gaps and hazards', () => {
  const apexHeight = jumpTuning.initialVelocity ** 2 / (2 * motionTuning.gravity);
  for (const level of levels) {
    const result = playLevel(level);
    const jumps = result.events.filter(({ type }) => type === 'jump');
    const collected = new Set(result.events.filter(({ type }) => type === 'collectible').map(({ feature }) => feature));
    const hazards = beatWindows(level).filter(({ kind }) => kind === 'gap' || kind === 'hazard');
    const timeline = courseSpeedTimeline(level);
    level.collectibles.forEach((shard, index) => {
      const kerb = level.platforms.find(({ at, width }) => shard.at >= at - .15 && shard.at <= at + width + .15);
      const launchHeight = kerb ? kerb.height : 0;
      const rise = shard.height - launchHeight;
      assert.ok(rise >= .6 && rise <= apexHeight + .05, `${level.id} shard ${index} is outside the apex band`);
      assert.ok(shard.height >= 1.2, `${level.id} shard ${index} hangs too low to be a shard`);
      if (kerb) {
        // Optional shard: a jump from the kerb surface reaches it. The auto-player only jumps for
        // hazards, so this one is proven analytically instead of against the run trace.
        assert.ok(shard.at > kerb.at && shard.at < kerb.at + kerb.width, `${level.id} shard ${index} is off its kerb`);
      } else {
        const reachable = jumps.some(({ at }) => {
          const time = (shard.at - at) / timeline.advance(shard.at).speed;
          if (time <= 0) return false;
          const height = jumpHeightAt(time);
          return height >= 1.2 && height <= apexHeight + .05 && Math.abs(height - shard.height) <= .1;
        });
        assert.ok(reachable, `${level.id} shard ${index} is not above a jump arc`);
        assert.ok(collected.has(`collectible-${index}`), `${level.id} shard ${index} was not collected by the jump`);
      }
      // An island shard is above a support surface inside an island gap, so the gap window is
      // interrupted by the island. Every other shard must sit clear of gap and hazard windows.
      const island = kerb?.kind === 'island'
        && level.gaps.find(({ at, width }) => kerb.at >= at && kerb.at + kerb.width <= at + width);
      const insideHazard = hazards.some(({ start, end }) => shard.at > start && shard.at < end);
      assert.equal(insideHazard && !island, false, `${level.id} shard ${index} sits inside a gap or hazard window`);
    });
  }
});

function platformKindCounts(level) {
  const counts = {};
  for (const { kind } of level.platforms) counts[kind] = (counts[kind] ?? 0) + 1;
  return counts;
}

function spansGap(platform, gaps) {
  return platform.height <= platformTuning.maxStepHeight
    && gaps.some((gap) => platform.at <= gap.at && platform.at + platform.width >= gap.at + gap.width);
}

test('platform archetypes follow the tier mix', () => {
  levels.forEach((level, index) => {
    const counts = platformKindCounts(level);
    const kinds = Object.keys(counts);
    if (index < 4) {
      assert.ok(level.platforms.length <= 1, `${level.id} may keep at most one tier-1 platform`);
      assert.ok(kinds.every((kind) => kind === 'kerb'), `${level.id} uses a non-kerb tutorial platform`);
    } else if (index < 8) {
      assert.equal(counts.kerb, 1, `${level.id} needs exactly one kerb`);
      assert.equal(level.platforms.length, 1, `${level.id} has extra tier-2 platforms`);
    } else if (index < 14) {
      assert.equal(counts.kerb, 1, `${level.id} needs one kerb`);
      assert.equal((counts.shelf ?? 0) + (counts.island ?? 0), 1, `${level.id} needs one shelf or island`);
      assert.equal(counts.hover ?? 0, 0, `${level.id} is below the hover tier`);
      assert.equal(counts.perch ?? 0, index >= 11 ? 1 : 0, `${level.id} has the wrong perch quota`);
      assert.equal(
        level.platforms.length,
        index >= 11 ? 3 : 2,
        `${level.id} has an unexpected platform count`,
      );
    } else {
      const specials = (counts.shelf ?? 0) + (counts.island ?? 0) + (counts.hover ?? 0);
      assert.equal(specials, 2, `${level.id} needs two shelf/island/hover platforms`);
      assert.equal(counts.perch, 1, `${level.id} needs exactly one perch`);
      assert.equal(counts.kerb ?? 0, 0, `${level.id} should spend both platform slots on specials`);
      assert.equal(level.platforms.length, 3, `${level.id} has an unexpected platform count`);
    }
  });
});

test('an island bridges its gap from the near edge and leaves a jumpable hole after it', () => {
  // Flush placement is the point: a grounded runner steps up onto the island at the hole's edge.
  // Put the platform in the middle of the hole and the runner is already falling when it arrives,
  // which is exactly the bug that made course 11 impossible.
  for (const level of levels) {
    for (const platform of level.platforms.filter(({ kind }) => kind === 'island')) {
      const gap = level.gaps.find(({ at, width }) => (
        platform.at >= at - 1e-6 && platform.at + platform.width <= at + width + 1e-6
      ));
      assert.ok(gap, `${level.id} island is not inside a gap`);
      assert.ok(
        platform.at - gap.at <= 1e-6,
        `${level.id} island starts ${(platform.at - gap.at).toFixed(2)} units into the hole instead of flush`,
      );
      const holeAfter = gap.at + gap.width - (platform.at + platform.width);
      assert.ok(holeAfter >= 2.4 - 1e-6, `${level.id} island leaves only ${holeAfter.toFixed(2)} units of hole after it`);
      assert.ok(platform.height <= platformTuning.maxStepHeight, `${level.id} island is taller than the step-up`);
    }
  }
});


test('every perch carries a crawler standing at the platform centre', () => {
  for (const level of levels) {
    for (const platform of level.platforms.filter(({ kind }) => kind === 'perch')) {
      const centre = platform.at + platform.width / 2;
      const enemy = level.enemies.find(({ at }) => at === centre);
      assert.ok(enemy, `${level.id} perch has no enemy at ${centre}`);
      assert.equal(enemy.type, 'crawler', `${level.id} perch must carry a crawler`);
      assert.equal(platform.height, .45, `${level.id} perch should be kerb height`);
    }
  }
});

test('every non-bridge platform carries a shard, except the perch', () => {
  for (const level of levels) {
    for (const platform of level.platforms) {
      if (spansGap(platform, level.gaps) || platform.kind === 'perch') continue;
      const shard = level.collectibles.find(({ at }) => at >= platform.at - .15 && at <= platform.at + platform.width + .15);
      assert.ok(shard, `${level.id} ${platform.kind} at ${platform.at} is missing its shard`);
    }
    for (const platform of level.platforms.filter(({ kind }) => kind === 'perch')) {
      const shard = level.collectibles.find(({ at }) => at >= platform.at && at <= platform.at + platform.width);
      assert.equal(shard, undefined, `${level.id} perch should carry the enemy instead of a shard`);
    }
  }
});

test('every shelf keeps half a jump reach of clear track on both ends', () => {
  for (const level of levels) {
    for (const platform of level.platforms.filter(({ kind }) => kind === 'shelf')) {
      assert.ok(platform.width >= 9 && platform.width <= 11, `${level.id} shelf width is outside 9–11`);
      assert.equal(platform.height, .5, `${level.id} shelf should be .5 high`);
      const centre = platform.at + platform.width / 2;
      const reach = jumpReach(courseSpeedTimeline(level).advance(centre).speed);
      const clearance = .5 * reach;
      for (const beat of inputBeats(level)) {
        const clear = beat.courseEnd <= platform.at - clearance + 1e-9
          || beat.courseStart >= platform.at + platform.width + clearance - 1e-9;
        assert.ok(clear, `${level.id} shelf at ${platform.at} has less than half a reach of track by ${beat.id}`);
      }
    }
  }
});

test('hover platforms only appear from course 15 on and use the short bob height', () => {
  levels.forEach((level, index) => {
    const hovers = level.platforms.filter(({ kind }) => kind === 'hover');
    if (index < 14) assert.equal(hovers.length, 0, `${level.id} has a hover before course 15`);
    for (const hover of hovers) {
      assert.equal(hover.height, .45, `${level.id} hover should bob around the kerb height`);
    }
  });
});

test('no platform over a hole is taller than the step-up limit', () => {
  // An island over a gap must be walkable: if it is taller than the step-up, the runner can neither
  // stand on it nor cross, which made course 11 impossible to get through.
  for (const level of levels) {
    for (const platform of level.platforms) {
      const overGap = level.gaps.some((gap) => platform.at < gap.at + gap.width && platform.at + platform.width > gap.at);
      if (!overGap) continue;
      assert.ok(
        platform.height <= platformTuning.maxStepHeight,
        `${level.id} has a ${platform.height}-high ${platform.kind} over a gap (step-up is ${platformTuning.maxStepHeight})`,
      );
    }
  }
});

// The second campaign is independent: however many courses exist must validate
// on their own, with the wool count rather than the core campaign's twenty.
test('the wool campaign validates independently of the core catalogue', () => {
  assert.ok(woolLevels.length >= 1, 'the wool campaign needs at least one course');
  assert.equal(validateLevels(woolLevels, { expected: woolLevels.length }), true);
  assert.equal(new Set(woolLevels.map((level) => level.id)).size, woolLevels.length);
  assert.equal(new Set(woolLevels.map((level) => level.name)).size, woolLevels.length);
  for (const level of woolLevels) {
    assert.equal(level.campaign, 'wool', `${level.id} must belong to the wool campaign`);
    assert.ok(level.palette, `${level.id} must carry its own palette`);
    for (const key of ['sky', 'lane', 'accent', 'platform']) {
      assert.equal(Number.isInteger(level.palette[key]), true, `${level.id} is missing palette.${key}`);
    }
    assert.equal(level.scenery, 'wool', `${level.id} must use the wool scenery`);
  }
});

test('the auto-player finishes every wool course without a death', () => {
  for (const level of woolLevels) {
    const result = playLevel(level);
    assert.equal(result.completed, true, `${level.id} was not completed`);
    assert.equal(result.deaths, 0, `${level.id} recorded a death: ${result.events.find(({ type }) => type === 'death')?.reason}`);
  }
});

test('every wool course holds the gap, hazard and fairness rules', () => {
  woolLevels.forEach((level, index) => {
    assert.ok(level.obstacles.length + level.enemies.length >= 3,
      `${level.id} needs at least three hazard beats`);
    const metrics = analyzeLevel(level);
    assert.deepEqual(metrics.deadBandViolations, [], `${level.id} has dead-band violations`);
    assert.deepEqual(metrics.telegraphViolations, [], `${level.id} has short first-beat telegraphs`);
    assert.ok(metrics.tightestMargin >= .35, `${level.id} has only ${metrics.tightestMargin?.toFixed(2)} units of margin`);
    assert.ok(metrics.jumps >= .75 * metrics.beats, `${level.id} jumps too few beats`);
    const target = woolBlueprint[index].target;
    assert.ok(
      Math.abs(metrics.inputsPerSecond / target - 1) <= .05,
      `${level.id} measured ${metrics.inputsPerSecond.toFixed(3)} inputs/s against a ${target.toFixed(2)} target`,
    );
  });
});

test('Thimble Meadow is the gentle tier-1 opener the Wool Road brief asks for', () => {
  const level = woolLevels.find(({ id }) => id === 'wool-thimble-meadow');
  assert.ok(level, 'Thimble Meadow is missing');
  assert.equal(level.name, 'Thimble Meadow');
  assert.equal(level.zone, 'FIRST STITCHES');
  assert.equal(level.length, 76);
  assert.equal(level.speed, 7.8);
  assert.equal(level.hazardStyle, 'spike');
  const styles = [...new Set(level.obstacles.map((group) => group[2] ?? level.hazardStyle))];
  assert.equal(styles.length, 3, 'the opener shows three hazard silhouettes');
  assert.ok(styles.includes('spike') && styles.includes('yarn-spike') && styles.includes('felt-block'));
  assert.equal(level.environment, 'wool-meadow');
  assert.equal(level.gaps.length, 3, 'the opener needs three open gaps');
  assert.equal(level.platforms.length, 1, 'the opener gains exactly one plush pad');
  assert.equal(level.platforms[0].kind, 'bounce', 'the opener pad must be a bounce pad');
  assert.equal(level.portals.length, 0, 'the opener needs no portals');
  assert.equal(level.enemies.length, 0, 'the opener needs no enemies');
  assert.equal(level.collectibles.length, 4, 'the opener keeps its shard and gains one arc');
  const arcs = level.collectibles.filter(({ arc }) => arc);
  assert.equal(arcs.length, 1, 'the opener carries one shard arc');
  assert.equal(arcs[0].arc, 3, 'the opener arc has three shards');
  assert.deepEqual(level.decor?.arches, ['finish'], 'the opener carries a thread arch at the finish');
  assert.ok(level.decor?.pomPoms >= 3 && level.decor?.pomPoms <= 5);
  assert.ok(level.obstacles.some(([, count]) => count === 1), 'the opener needs a single hazard group');
  assert.ok(level.obstacles.some(([, count]) => count === 2), 'the opener needs a double hazard group');
  for (const gap of level.gaps) {
    assert.ok(
      !level.platforms.some((platform) => platform.at <= gap.at && platform.at + platform.width >= gap.at + gap.width),
      `gap at ${gap.at} must stay open`,
    );
  }
  assert.equal(level.music.bpm, 108);
  assert.deepEqual(level.music.scale, [0, 2, 4, 7, 9]);
  assert.equal(level.music.motif.length, 16);
  assert.equal(new Set(woolLevels.map(({ signature }) => signature)).size, woolLevels.length);
  assert.ok(level.designHook);
  const measured = analyzeLevel(level).inputsPerSecond;
  assert.ok(Math.abs(measured / .62 - 1) <= .05, `Thimble Meadow measured ${measured.toFixed(3)} inputs/s`);
});

test('the core campaign contains zero bounce pads', () => {
  for (const level of levels) {
    assert.equal(
      level.platforms.some(({ kind }) => kind === 'bounce'),
      false,
      `${level.id} must not gain a bounce pad`,
    );
  }
});

function woolTierOf(index) {
  if (index < 5) return 1;
  if (index < 10) return 2;
  if (index < 15) return 3;
  return 4;
}

test('every wool bounce pad sits on plain track and matches its tier quota', () => {
  woolLevels.forEach((level, index) => {
    const pads = level.platforms.filter(({ kind }) => kind === 'bounce');
    assert.equal(pads.length, woolTierOf(index) <= 2 ? 1 : 2, `${level.id} has the wrong bounce-pad count`);
    for (const pad of pads) {
      assert.ok(pad.width >= 3 && pad.width <= 4, `${level.id} bounce pad width is outside 3–4`);
      assert.equal(pad.height, .35, `${level.id} bounce pad should be .35 high`);
      for (const gap of level.gaps) {
        assert.ok(
          pad.at >= gap.at + gap.width || pad.at + pad.width <= gap.at,
          `${level.id} bounce pad overlaps the gap at ${gap.at}`,
        );
      }
      for (const beat of beatWindows(level).filter(({ kind }) => kind === 'hazard' || kind === 'enemy')) {
        assert.ok(
          pad.at >= beat.end || pad.at + pad.width <= beat.start,
          `${level.id} bounce pad overlaps ${beat.id}`,
        );
      }
      for (const portal of level.portals) {
        assert.ok(
          Math.abs(pad.at + pad.width / 2 - portal.at) > pad.width / 2 + .5,
          `${level.id} bounce pad overlaps the portal at ${portal.at}`,
        );
      }
      const reach = jumpReach(courseSpeedTimeline(level).advance(pad.at + pad.width / 2).speed);
      const clearance = .5 * reach;
      for (const beat of inputBeats(level)) {
        assert.ok(
          beat.courseEnd <= pad.at - clearance + 1e-9
            || beat.courseStart >= pad.at + pad.width + clearance - 1e-9,
          `${level.id} bounce pad at ${pad.at} has less than half a reach of track by ${beat.id}`,
        );
      }
    }
  });
});

test('Button Bush is the sage tier-1 wool course with a wide gap and a pad under its shard', () => {
  const level = woolLevels.find(({ id }) => id === 'wool-02-button-bush');
  assert.ok(level, 'Button Bush is missing');
  assert.equal(level.name, 'Button Bush');
  assert.equal(level.zone, 'FIRST STITCHES');
  assert.equal(level.campaign, 'wool');
  assert.equal(level.length, 82);
  assert.equal(level.speed, 7.9);
  assert.equal(level.hazardStyle, 'spike');
  assert.deepEqual(level.palette, {
    sky: 0xF6EADF,
    lane: 0x4A3B36,
    accent: 0x8FBF9F,
    platform: 0xD8CCC0,
  });
  assert.equal(level.music.bpm, 112);
  assert.deepEqual(level.music.scale, [0, 2, 4, 7, 9]);
  assert.equal(level.music.motif.length, 16);
  assert.equal(level.portals.length, 0, 'Button Bush has no portals');
  assert.equal(level.enemies.length, 1, 'Button Bush gains one beetle');
  assert.equal(level.enemies[0].type, 'beetle');
  assert.ok(level.obstacles.length >= 3, 'Button Bush needs at least three hazard groups');
  const styles = [...new Set(level.obstacles.map((group) => group[2] ?? level.hazardStyle))];
  assert.equal(styles.length, 2, 'Button Bush shows two hazard skins');
  assert.deepEqual(level.decor?.arches, ['checkpoint'], 'Button Bush carries a thread arch at its checkpoint');
  assert.ok(Number.isFinite(safeCheckpointDistance(level)), 'Button Bush is long enough for a checkpoint');

  const pads = level.platforms.filter(({ kind }) => kind === 'bounce');
  assert.equal(pads.length, 1, 'Button Bush carries exactly one bounce pad');
  const [pad] = pads;
  const wideGaps = level.gaps.filter(({ width }) => width >= 4);
  assert.equal(wideGaps.length, 1, 'Button Bush needs one wide gap');
  assert.ok(level.gaps.length >= 2, 'Button Bush needs its open gaps');

  assert.equal(level.collectibles.length, 3, 'Button Bush carries one shard arc');
  const [arcLeader] = level.collectibles;
  assert.equal(arcLeader.arc, 3, 'the pad arc has three shards');
  assert.ok(
    level.collectibles.every(({ at }) => at >= pad.at && at <= pad.at + pad.width + 1),
    'the shard arc must start over the pad',
  );
  assert.ok(arcLeader.height > pad.height + .6, 'the arc must hang above the pad surface');

  const measured = analyzeLevel(level).inputsPerSecond;
  assert.ok(
    Math.abs(measured / woolBlueprint[1].target - 1) <= .05,
    `Button Bush measured ${measured.toFixed(3)} inputs/s`,
  );
  assert.ok(
    Math.abs(woolBlueprint[1].target / .64 - 1) <= .05,
    `Button Bush target ${woolBlueprint[1].target} must stay within 5% of the .64 brief`,
  );
});

function hazardStyles(level) {
  return [...new Set(level.obstacles.map((group) => group[2] ?? level.hazardStyle))];
}

function collectibleArcs(level) {
  const arcs = [];
  for (let index = 0; index < level.collectibles.length; index++) {
    const leader = level.collectibles[index];
    if (leader.arc) arcs.push(level.collectibles.slice(index, index + leader.arc));
  }
  return arcs;
}

test('core courses keep exactly one hazard skin, single shards and no scenery', () => {
  for (const level of levels) {
    assert.deepEqual(hazardStyles(level), [level.hazardStyle], `${level.id} must keep one hazard skin`);
    assert.equal(level.collectibles.every(({ arc }) => arc === undefined), true, `${level.id} gained a shard arc`);
    assert.equal(level.decor, undefined, `${level.id} gained wool scenery`);
  }
});

test('wool courses mix skins, and the tier vocabulary grows from tier 2 on', () => {
  woolLevels.forEach((level, index) => {
    const tier = woolTierOf(index);
    const styles = hazardStyles(level);
    const arcs = collectibleArcs(level);
    const enemyTypes = [...new Set(level.enemies.map(({ type }) => type))];
    assert.ok(styles.length >= 2, `${level.id} must show at least two hazard skins`);
    for (const arc of arcs) {
      assert.ok(arc.length >= 2 && arc.length <= 5, `${level.id} has an arc outside 2–5 shards`);
    }
    const silhouettes = new Set([...styles, ...enemyTypes]);
    for (const type of enemyTypes) {
      assert.ok(['beetle', 'moth', 'bunny'].includes(type), `${level.id} still shows a core silhouette: ${type}`);
    }
    if (tier >= 2) {
      // A beat can be an obstacle group or an enemy, so richness is measured on the silhouettes a
      // course actually shows, not on a fixed count of either.
      assert.ok(silhouettes.size >= 4, `${level.id} needs four distinct silhouettes from tier 2, has ${silhouettes.size}`);
      assert.ok(arcs.length >= 1, `${level.id} needs a shard arc from tier 2`);
    }
    if (tier >= 3) {
      assert.ok(silhouettes.size >= 5, `${level.id} needs five distinct silhouettes from tier 3, has ${silhouettes.size}`);
    }
  });
});

test('the two retrofitted wool courses keep speed, length, gaps, pads, palette and input rate', () => {
  const thimble = woolLevels.find(({ id }) => id === 'wool-thimble-meadow');
  const button = woolLevels.find(({ id }) => id === 'wool-02-button-bush');
  assert.equal(thimble.length, 76);
  assert.equal(thimble.speed, 7.8);
  assert.deepEqual(thimble.gaps, [{ at: 26.52, width: 2.5 }, { at: 50.69, width: 2.5 }, { at: 58.02, width: 2.5 }]);
  assert.deepEqual(button.gaps, [{ at: 26.86, width: 4 }, { at: 50.44, width: 2.5 }, { at: 65.12, width: 2.5 }]);
  assert.equal(button.speed, 7.9);
  assert.equal(button.length, 82);
  for (const [level, index] of [[thimble, 0], [button, 1]]) {
    assert.equal(level.platforms.filter(({ kind }) => kind === 'bounce').length, 1);
    assert.deepEqual(level.palette, woolLevels[index].palette);
    const measured = analyzeLevel(level).inputsPerSecond;
    assert.ok(
      Math.abs(measured / woolBlueprint[index].target - 1) <= .05,
      `${level.id} drifted to ${measured.toFixed(3)} inputs/s`,
    );
  }
});
