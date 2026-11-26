import test from 'node:test';
import assert from 'node:assert/strict';
import { getLevel, levelValidationError, levels, validateLevels } from './levels.js';
import { jumpTuning, motionTuning, platformTuning } from './game-logic.js';
import { playLevel } from '../tools/auto-player.mjs';
import { analyzeLevel } from '../tools/level-report.mjs';
import { beatWindows, courseSpeedTimeline } from '../tools/level-physics.mjs';
import { blueprint } from '../tools/compose-levels.mjs';

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

test('course lengths rise gradually to a maximum of 150 track units', () => {
  for (let index = 1; index < levels.length; index++) {
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
          const height = jumpTuning.initialVelocity * time - .5 * motionTuning.gravity * time ** 2;
          return height >= 1.2 && height <= apexHeight + .05 && Math.abs(height - shard.height) <= .1;
        });
        assert.ok(reachable, `${level.id} shard ${index} is not above a jump arc`);
        assert.ok(collected.has(`collectible-${index}`), `${level.id} shard ${index} was not collected by the jump`);
      }
      assert.equal(hazards.some(({ start, end }) => shard.at > start && shard.at < end), false, `${level.id} shard ${index} sits inside a gap or hazard window`);
    });
  }
});
