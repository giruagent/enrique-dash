import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { activeEffects, canConsumeJumpBuffer, checkpointTuning, courseMedal, effectCopy, emptyProgress, enemyProfiles, enemyTuning, findStepSurface, finishGateDistance, getEnemyProfile, getHazardProfile, getObstacleProfile, getTrackSupportHeight, hazardStyleForGroup, integrateVerticalMotion, isCollectibleContact, isGamePaused, isObstacleCollision, jumpTuning, levelProgressPercent, mergeJumpRequest, mergeRunProgress, parseProgress, portalCopy, portalEffects, portalLabel, PROGRESS_VERSION, safeCheckpointDistance, shouldAcceptJumpInput, shouldApplyBufferedStartJump, shouldHandleGameplayKey, shouldSpawnCourseFeatures, shouldStompEnemy } from './game-logic.js';
import { levels } from './levels.js';
import { woolLevels } from './levels-wool.js';
import { beatWindows, jumpApexHeight } from '../tools/level-physics.mjs';

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => (
    entry.isDirectory()
      ? sourceFiles(new URL(`${entry.name}/`, directory))
      : [new URL(entry.name, directory)]
  ));
}

test('hazard profiles give each environment collision geometry and a safe fallback', () => {
  assert.equal(getHazardProfile('crystal-beam').shape, 'beam');
  assert.ok(getHazardProfile('crystal-beam').clearanceHeight > .95);
  assert.equal(getHazardProfile('pixel-block').shape, 'block');
  assert.equal(getHazardProfile('unknown-hazard').shape, 'spike');
});

test('every wool hazard skin copies its base collision box exactly', () => {
  const skins = {
    'yarn-spike': 'spike',
    'felt-block': 'pixel-block',
    'button-bomb': 'vent',
    'thread-arch': 'circuit-beam',
  };
  for (const [skin, base] of Object.entries(skins)) {
    const skinProfile = getHazardProfile(skin);
    const baseProfile = getHazardProfile(base);
    assert.equal(skinProfile.width, baseProfile.width, `${skin} width drifted from ${base}`);
    assert.equal(skinProfile.height, baseProfile.height, `${skin} height drifted from ${base}`);
    assert.equal(skinProfile.clearanceHeight, baseProfile.clearanceHeight, `${skin} clearance drifted from ${base}`);
    assert.equal(skinProfile.offsetY, baseProfile.offsetY, `${skin} offset drifted from ${base}`);
    assert.notEqual(skinProfile.shape, baseProfile.shape, `${skin} needs its own silhouette`);
  }
  assert.equal(getHazardProfile('thread-arch').offsetY, 1.05);
});

test('a mixed-style course resolves each group style and keeps that group window identical', () => {
  const mixed = woolLevels.find(({ id }) => id === 'wool-thimble-meadow');
  const windows = beatWindows(mixed).filter(({ kind }) => kind === 'hazard');
  mixed.obstacles.forEach((group, groupIndex) => {
    const style = hazardStyleForGroup(mixed, group);
    assert.ok(style, `hazard group ${groupIndex} did not resolve a style`);
    const single = { ...mixed, obstacles: [[group[0], group[1], style]] };
    const [window] = beatWindows(single).filter(({ kind }) => kind === 'hazard');
    const resolved = windows.find(({ id }) => id === `hazard-${groupIndex}`);
    assert.equal(resolved.type, style);
    assert.equal(resolved.start, window.start);
    assert.equal(resolved.end, window.end);
    assert.equal(resolved.courseEnd, window.courseEnd);
    assert.equal(resolved.clearance, window.clearance);
  });
  // A group with no third element falls back to the course style, not to a neighbour's skin.
  const fallback = { ...mixed, hazardStyle: 'spike', obstacles: [[12, 1]] };
  assert.equal(hazardStyleForGroup(fallback, fallback.obstacles[0]), 'spike');
  assert.equal(getObstacleProfile(fallback, fallback.obstacles[0]).width, getHazardProfile('spike').width);

  // Two skins that copy the same profile produce identical windows whether mixed or uniform.
  const uniform = { ...mixed, obstacles: mixed.obstacles.map(([at, count]) => [at, count]) };
  const yarn = { ...mixed, obstacles: mixed.obstacles.map(([at, count]) => [at, count, 'yarn-spike']) };
  const project = (windows) => windows
    .filter(({ kind }) => kind === 'hazard')
    .map(({ id, start, end, clearance }) => ({ id, start, end, clearance }));
  assert.deepEqual(project(beatWindows(uniform)), project(beatWindows(yarn)));
});

test('the three new enemy silhouettes reuse the two shipped collision profiles', () => {
  for (const type of ['beetle', 'bunny']) {
    assert.deepEqual(getEnemyProfile(type), getEnemyProfile('crawler'), `${type} must reuse the crawler profile`);
    assert.equal(getEnemyProfile(type).stompable, true);
    assert.equal(getEnemyProfile(type).width, .9);
    assert.equal(getEnemyProfile(type).height, .58);
  }
  assert.deepEqual(getEnemyProfile('moth'), getEnemyProfile('drone'), 'moth must reuse the drone profile');
  assert.equal(getEnemyProfile('moth').stompable, false);
  assert.equal(getEnemyProfile('moth').width, .72);
  assert.equal(getEnemyProfile('moth').height, .68);
  assert.equal(getEnemyProfile('moth').altitude, 1.12);
  assert.deepEqual(Object.keys(enemyProfiles).sort(), ['beetle', 'bunny', 'crawler', 'drone', 'moth']);
});

test('a moth at its maximum wing offset is cleared by exactly the drone jump', () => {
  const base = {
    speed: 8,
    length: 40,
    hazardStyle: 'spike',
    obstacles: [],
    gaps: [],
    platforms: [],
    portals: [],
    collectibles: [],
  };
  const droneWindow = beatWindows({ ...base, enemies: [{ at: 12, type: 'drone' }] })[0];
  const mothWindow = beatWindows({ ...base, enemies: [{ at: 12, type: 'moth' }] })[0];
  assert.equal(mothWindow.clearance, droneWindow.clearance);
  assert.equal(mothWindow.start, droneWindow.start);
  assert.equal(mothWindow.end, droneWindow.end);
  // The visual wing flap is bounded well inside the solver's flyer clearance.
  const profile = getEnemyProfile('moth');
  const visualTop = profile.altitude + profile.height / 2 + enemyTuning.mothWingOffset;
  assert.ok(visualTop < mothWindow.clearance, `wing top ${visualTop} reaches the ${mothWindow.clearance} clearance`);
});

test('jump buffering and coyote time preserve a near-miss tap without allowing double jumps', () => {
  assert.ok(jumpTuning.initialVelocity > 8.3);
  assert.ok(jumpTuning.inputBufferSeconds >= .12);
  assert.ok(jumpTuning.coyoteSeconds >= .1);
  assert.equal(canConsumeJumpBuffer(true, 0, .12), true);
  assert.equal(canConsumeJumpBuffer(false, .08, .12), true);
  assert.equal(canConsumeJumpBuffer(false, 0, .12), false);
  assert.equal(canConsumeJumpBuffer(true, .1, 0), false);
});
test('a ground-level player collides only inside the horizontal hit window', () => {
  assert.equal(isObstacleCollision(-3, -3, 0), true);
  assert.equal(isObstacleCollision(-3, -2.2, 0), false);
});


test('jump height clears spikes only above the configured clearance threshold', () => {
  assert.equal(isObstacleCollision(-3, -3, .94), true);
  assert.equal(isObstacleCollision(-3, -3, .95), false);
});

test('small vertical forgiveness prevents a grazing obstacle collision', () => {
  assert.equal(isObstacleCollision(-3, -3, .9, { clearanceHeight: .95, verticalForgiveness: .1 }), false);
  assert.equal(isObstacleCollision(-3, -3, .82, { clearanceHeight: .95, verticalForgiveness: .1 }), true);
});
test('level progress stays within zero and one hundred percent', () => {
  assert.equal(levelProgressPercent(-1, 80), 0);
  assert.equal(levelProgressPercent(40, 80), 50);
  assert.equal(levelProgressPercent(90, 80), 100);
});

test('gaps remove ground support, while platforms provide a bridge or raised landing surface', () => {
  const hole = [{ center: -3, width: 3 }];
  assert.equal(getTrackSupportHeight(-3, -1.7, -1.7, hole, []), null);
  assert.equal(getTrackSupportHeight(-3, -1.7, -1.7, hole, [{ center: -3, width: 4, height: 0 }]), -1.7);
  assert.equal(getTrackSupportHeight(-3, -1.25, -1.7, [], [{ center: -3, width: 4, height: .45 }]), -1.25);
});

for (const height of [.4, .45, .5, .55]) {
  test(`a grounded player steps up onto a real ${height}-unit platform`, () => {
    const baseHeight = -1.7;
    const platforms = [{ center: -3, width: 4, height }];
    assert.equal(findStepSurface(-3, baseHeight, true, baseHeight, platforms), baseHeight + height);
  });
}

test('a grounded player does not step up when the rise exceeds maxStepHeight', () => {
  const baseHeight = -1.7;
  const platforms = [{ center: -3, width: 4, height: 1.5 }];
  assert.equal(findStepSurface(-3, baseHeight, true, baseHeight, platforms), null);
  assert.equal(getTrackSupportHeight(-3, baseHeight, baseHeight, [], platforms), baseHeight);
});

test('an airborne player does not step up onto a platform', () => {
  const baseHeight = -1.7;
  const platforms = [{ center: -3, width: 4, height: .45 }];
  assert.equal(findStepSurface(-3, baseHeight, false, baseHeight, platforms), null);
});

test('landing from above still returns the platform surface as support', () => {
  const platforms = [{ center: -3, width: 4, height: .45, currentHeight: .5 }];
  assert.equal(getTrackSupportHeight(-3, -1.1, -1.7, [], platforms), -1.2);
});

test('a player under a platform over solid ground is supported by the ground', () => {
  const baseHeight = -1.7;
  const platforms = [{ center: -3, width: 4, height: .45 }];
  assert.equal(getTrackSupportHeight(-3, baseHeight, baseHeight, [], platforms), baseHeight);
});

test('a grounded player under a platform over a gap steps up onto the bridge', () => {
  const baseHeight = -1.7;
  const hole = [{ center: -3, width: 3 }];
  const platforms = [{ center: -3, width: 4, height: .45 }];
  const stepSurface = findStepSurface(-3, baseHeight, true, baseHeight, platforms);
  assert.equal(stepSurface, -1.25);
  assert.equal(getTrackSupportHeight(-3, stepSurface, baseHeight, hole, platforms), stepSurface);
});

test('an airborne player under a platform over a gap has null support', () => {
  const baseHeight = -1.7;
  const hole = [{ center: -3, width: 3 }];
  const platforms = [{ center: -3, width: 4, height: .45 }];
  assert.equal(getTrackSupportHeight(-3, baseHeight, baseHeight, hole, platforms), null);
});

test('the obsolete platform crash message is absent from all source files', () => {
  const removedMessage = ['Missed the', 'platform.'].join(' ');
  for (const file of sourceFiles(new URL('./', import.meta.url))) {
    assert.equal(readFileSync(file, 'utf8').includes(removedMessage), false, file.pathname);
  }
});

test('portals expose distinct supported effects for movement and hazard defense', () => {
  assert.ok(portalEffects.spring.jumpVelocity > 8.3);
  assert.ok(portalEffects.dash.speedMultiplier > 1);
  assert.ok(portalEffects.float.gravityMultiplier < 1);
  assert.equal(portalEffects.shield.shieldCharges, 1);
  assert.ok(portalEffects.phase.duration > 0);
});

test('portal labels name and explain all five power-ups', () => {
  const expected = {
    spring: { name: 'SPRING', effect: 'HIGHER JUMP', announcement: 'Spring: higher jump.' },
    dash: { name: 'DASH', effect: 'FASTER FOR 2 s', announcement: 'Dash: faster for two seconds.' },
    float: { name: 'FLOAT', effect: 'LOW GRAVITY', announcement: 'Float: low gravity.' },
    shield: { name: 'SHIELD', effect: 'BLOCKS ONE HIT', announcement: 'Shield: blocks one hit.' },
    phase: { name: 'PHASE', effect: 'PASS THROUGH', announcement: 'Phase: pass through hazards.' },
  };
  assert.deepEqual(Object.keys(portalCopy), Object.keys(expected));
  for (const [type, copy] of Object.entries(expected)) {
    assert.equal(portalLabel(type), portalCopy[type]);
    assert.deepEqual(portalCopy[type], copy);
  }
});

test('an unknown portal type falls back to the phase label without throwing', () => {
  assert.equal(portalLabel('unknown-portal'), portalCopy.phase);
  assert.equal(portalLabel(), portalCopy.phase);
  assert.equal(portalLabel('toString'), portalCopy.phase);
});

test('effect copy names every visible power-up in its gameplay colour', () => {
  assert.deepEqual(effectCopy, {
    dash: { name: 'DASH', color: 0x52eaff },
    float: { name: 'FLOAT', color: 0xb884ff },
    phase: { name: 'PHASE', color: 0xff6fe0 },
    shield: { name: 'SHIELD', color: 0x6c9dff },
  });
});

test('activeEffects is empty for no effects or junk timers', () => {
  assert.deepEqual(activeEffects(), []);
  assert.deepEqual(activeEffects(null), []);
  assert.deepEqual(activeEffects({}), []);
  assert.deepEqual(activeEffects({
    dashTimer: '1',
    gravityTimer: Infinity,
    phaseTimer: {},
    shieldCharges: NaN,
  }), []);
});

for (const [type, timer, total] of [
  ['dash', 'dashTimer', portalEffects.dash.duration],
  ['float', 'gravityTimer', portalEffects.float.duration],
  ['phase', 'phaseTimer', portalEffects.phase.duration],
]) {
  test(`activeEffects reports a live ${type} with its remaining fraction`, () => {
    const active = activeEffects({ [timer]: total / 2 });
    assert.equal(active.length, 1);
    assert.equal(active[0].type, type);
    assert.equal(active[0].total, total);
    assert.equal(active[0].remaining, total / 2);
    assert.ok(Math.abs(active[0].ratio - .5) < 1e-12);
    assert.deepEqual({ name: active[0].name, color: active[0].color }, effectCopy[type]);
  });
}

test('two live effects keep the stable dash, float, phase, shield order', () => {
  const active = activeEffects({ phaseTimer: 1.2, gravityTimer: 1.4 });
  assert.deepEqual(active.map((effect) => effect.type), ['float', 'phase']);
  const all = activeEffects({
    phaseTimer: portalEffects.phase.duration / 2,
    dashTimer: portalEffects.dash.duration,
    gravityTimer: portalEffects.float.duration,
    shieldCharges: 1,
  });
  assert.deepEqual(all.map((effect) => effect.type), ['dash', 'float', 'phase', 'shield']);
  assert.deepEqual(all.map((effect) => effect.ratio), [1, 1, .5, 1]);
});

test('a near-zero timer clamps its ratio and the entry disappears at exactly zero', () => {
  const near = activeEffects({ dashTimer: 1e-9 });
  assert.equal(near.length, 1);
  assert.ok(near[0].ratio > 0 && near[0].ratio <= 1);
  assert.ok(Number.isFinite(near[0].ratio));
  assert.equal(activeEffects({ dashTimer: 1e6 })[0].ratio, 1);
  assert.deepEqual(activeEffects({ dashTimer: 0 }), []);
  assert.deepEqual(activeEffects({ dashTimer: -1 }), []);
  assert.deepEqual(activeEffects({ dashTimer: NaN }), []);
});

test('shield charges stay at full ratio until the saved hit is spent', () => {
  assert.deepEqual(activeEffects({ shieldCharges: 1 }), [{
    type: 'shield',
    remaining: 1,
    total: 1,
    ratio: 1,
    name: 'SHIELD',
    color: 0x6c9dff,
  }]);
  const two = activeEffects({ shieldCharges: 2 });
  assert.equal(two[0].remaining, 2);
  assert.equal(two[0].ratio, 1);
  assert.deepEqual(activeEffects({ shieldCharges: 0 }), []);
});

test('the finish gate helper returns the authored course length', () => {
  assert.equal(finishGateDistance({ length: 78 }), 78);
});

test('crawler stomps accept a small apex grace but reject high-speed upward contacts', () => {
  assert.equal(shouldStompEnemy(1.1, -2), true);
  assert.equal(shouldStompEnemy(.5, -2), false);
  assert.equal(shouldStompEnemy(1.2, 2), false);
  assert.equal(shouldStompEnemy(.84, .4), true);
  assert.equal(shouldStompEnemy(.84, .8), false);
});

test('collectibles require the player to be close in both course and jump height', () => {
  assert.equal(isCollectibleContact(-3, -3.4, 1.6, 1.7), true);
  assert.equal(isCollectibleContact(-3, -3.8, 1.6, 1.7), false);
  assert.equal(isCollectibleContact(-3, -3.1, .1, 1.7), false);
  assert.equal(isCollectibleContact(-3, -3.1, 1.6, 1.7), true);
});

test('pause is distinct from a new, failed, or completed run', () => {
  assert.equal(isGamePaused({ started: true, running: false, dead: false, completed: false }), true);
  assert.equal(isGamePaused({ started: false, running: false, dead: false, completed: false }), false);
  assert.equal(isGamePaused({ started: true, running: false, dead: true, completed: false }), false);
  assert.equal(isGamePaused({ started: true, running: false, dead: false, completed: true }), false);
});

test('an initialized course is not spawned again when a run resumes', () => {
  assert.equal(shouldSpawnCourseFeatures(false), true);
  assert.equal(shouldSpawnCourseFeatures(true), false);
});

test('keyboard jump ignores repeated keydown events', () => {
  assert.equal(shouldAcceptJumpInput(false), true);
  assert.equal(shouldAcceptJumpInput(true), false);
});

test('gameplay keys are ignored before a run when the game is unfocused', () => {
  for (const code of ['Space', 'ArrowUp', 'KeyW']) {
    assert.equal(shouldHandleGameplayKey({ code, repeat: false, running: false, gameFocused: false, interactiveTarget: false }), false);
  }
});

test('gameplay keys are handled during a run without game focus', () => {
  assert.equal(shouldHandleGameplayKey({ code: 'Space', repeat: false, running: true, gameFocused: false, interactiveTarget: false }), true);
});

test('gameplay keys are handled while paused when the game has focus', () => {
  assert.equal(shouldHandleGameplayKey({ code: 'ArrowUp', repeat: false, running: false, gameFocused: true, interactiveTarget: false }), true);
});

test('gameplay keys are ignored for interactive targets', () => {
  assert.equal(shouldHandleGameplayKey({ code: 'KeyW', repeat: false, running: true, gameFocused: true, interactiveTarget: true }), false);
});

test('unrelated keys are not handled as gameplay input', () => {
  assert.equal(shouldHandleGameplayKey({ code: 'KeyM', repeat: false, running: true, gameFocused: true, interactiveTarget: false }), false);
});

test('repeated gameplay keydown events still pass the gameplay key guard', () => {
  assert.equal(shouldHandleGameplayKey({ code: 'Space', repeat: true, running: true, gameFocused: false, interactiveTarget: false }), true);
});

test('jump intent received during deferred scene initialization is retained', () => {
  assert.equal(mergeJumpRequest(false, true), true);
  assert.equal(mergeJumpRequest(true, false), true);
  assert.equal(mergeJumpRequest(false, false), false);
  assert.equal(shouldApplyBufferedStartJump(true, true), true);
  assert.equal(shouldApplyBufferedStartJump(true, false), false);
});

test('vertical motion stays consistent across common render rates', () => {
  const outcomes = [30, 60, 120].map((rate) => {
    let position = 0;
    let velocity = jumpTuning.initialVelocity;
    const dt = 1 / rate;
    for (let step = 0; step < rate * .4; step++) {
      ({ position, velocity } = integrateVerticalMotion(position, velocity, 19, dt));
    }
    return { position, velocity };
  });
  for (const outcome of outcomes.slice(1)) {
    assert.ok(Math.abs(outcome.position - outcomes[0].position) < 1e-10);
    assert.ok(Math.abs(outcome.velocity - outcomes[0].velocity) < 1e-10);
  }
});

test('progress parsing tolerates junk and normalizes empty state', () => {
  assert.equal(PROGRESS_VERSION, 2);
  assert.deepEqual(emptyProgress(), { version: 2, courses: {} });
  for (const junk of [null, undefined, '', '{', 'null', '42', 'true', '"text"', JSON.stringify({ version: 2 })]) {
    assert.deepEqual(parseProgress(junk), { version: 2, courses: {} });
  }
});

test('progress parsing migrates the legacy completed-id array', () => {
  assert.deepEqual(parseProgress('["neon-run","candy-comet"]'), {
    version: 2,
    courses: {
      'neon-run': { cleared: true },
      'candy-comet': { cleared: true },
    },
  });
  assert.deepEqual(parseProgress(['neon-run', 7, null]), {
    version: 2,
    courses: { 'neon-run': { cleared: true } },
  });
});

test('progress parsing keeps unknown ids for render-time filtering and normalizes v2 fields', () => {
  const parsed = parseProgress(JSON.stringify({
    version: 99,
    courses: {
      'neon-run': { best: .4, shards: 2, cleared: true },
      'gone-level': { best: 2, shards: -3, cleared: 'yes' },
      broken: 'nope',
    },
  }));
  assert.deepEqual(parsed, {
    version: 2,
    courses: {
      'neon-run': { best: .4, shards: 2, cleared: true },
      'gone-level': { best: 1, shards: 0, cleared: false },
    },
  });
});

test('progress parsing never mutates the raw v2 object', () => {
  const raw = { version: 2, courses: { 'neon-run': { best: .4, shards: 1, cleared: false } } };
  const snapshot = structuredClone(raw);
  parseProgress(raw);
  assert.deepEqual(raw, snapshot);
});

test('a worse run never lowers best or shards and never clears a clear flag', () => {
  const progress = { version: 2, courses: { 'neon-run': { best: .8, shards: 2, cleared: true } } };
  const output = mergeRunProgress(progress, 'neon-run', { reached: .3, shards: 1, cleared: false });
  assert.deepEqual(output.courses['neon-run'], { best: .8, shards: 2, cleared: true, noCheckpoint: true });
  assert.equal(output.version, 2);
});

test('mergeRunProgress takes maxima, ORs cleared and stays immutable', () => {
  const progress = { version: 2, courses: { 'neon-run': { best: .8, shards: 2, cleared: false } } };
  const snapshot = structuredClone(progress);
  const output = mergeRunProgress(progress, 'neon-run', { reached: .55, shards: 1, cleared: true, usedCheckpoint: false });
  assert.deepEqual(progress, snapshot);
  assert.notEqual(output, progress);
  assert.notEqual(output.courses, progress.courses);
  assert.deepEqual(output.courses['neon-run'], { best: .8, shards: 2, cleared: true, noCheckpoint: true });
  assert.deepEqual(
    mergeRunProgress(emptyProgress(), 'candy-comet', { reached: .82, shards: 1.9, cleared: false }).courses['candy-comet'],
    { best: .82, shards: 1, cleared: false },
  );
});

test('course medals are bronze for a clear, silver for every shard, and none before clearing', () => {
  const withShards = { collectibles: [{}, {}, {}] };
  assert.equal(courseMedal(null, withShards), null);
  assert.equal(courseMedal({ cleared: false, shards: 3 }, withShards), null);
  assert.equal(courseMedal({ cleared: true, shards: 0 }, withShards), 'bronze');
  assert.equal(courseMedal({ cleared: true, shards: 2 }, withShards), 'bronze');
  assert.equal(courseMedal({ cleared: true, shards: 3 }, withShards), 'silver');
  assert.equal(courseMedal({ cleared: true, shards: 0 }, { collectibles: [] }), 'bronze');
  assert.equal(courseMedal({ cleared: true, shards: 3 }, { collectibles: [] }), 'bronze');
  assert.equal(courseMedal({ cleared: true, shards: 3 }, {}), 'bronze');
});

test('gold beats silver and is earned by any clear that never used its checkpoint', () => {
  const withShards = { collectibles: [{}, {}, {}] };
  assert.equal(courseMedal({ cleared: true, shards: 3, noCheckpoint: true }, withShards), 'gold');
  assert.equal(courseMedal({ cleared: true, shards: 0, noCheckpoint: true }, withShards), 'gold');
  assert.equal(courseMedal({ cleared: true, noCheckpoint: true }, { collectibles: [] }), 'gold');
  assert.equal(courseMedal({ cleared: false, noCheckpoint: true }, withShards), null);
});

test('a course shorter than the checkpoint minimum gets no flag', () => {
  assert.equal(checkpointTuning.minimumLength, 120);
  assert.equal(safeCheckpointDistance({ length: 119 }), null);
  assert.equal(safeCheckpointDistance({ length: 78 }), null);
  assert.equal(safeCheckpointDistance({}), null);
  assert.equal(safeCheckpointDistance(null), null);
});

test('every long course gets a mid-course checkpoint with a real reaction window', () => {
  for (const level of levels) {
    const distance = safeCheckpointDistance(level);
    if (level.length < checkpointTuning.minimumLength) {
      assert.equal(distance, null, `${level.id} is too short for a checkpoint`);
      continue;
    }
    assert.ok(Number.isFinite(distance), `${level.id} is long enough for a checkpoint`);
    assert.ok(distance >= level.length * checkpointTuning.windowStart, `${level.id} checkpoint is before the window`);
    assert.ok(distance <= level.length * checkpointTuning.windowEnd, `${level.id} checkpoint is after the window`);
    const spans = [
      ...beatWindows(level).filter(({ kind }) => ['hazard', 'gap', 'enemy'].includes(kind)).map(({ start: from, end: to }) => [from, to]),
      ...level.gaps.map(({ at, width }) => [at, at + width]),
      ...level.portals.map(({ at }) => [at, at]),
    ];
    for (const [from, to] of spans) {
      if (distance > from && distance < to) assert.fail(`${level.id} checkpoint sits inside a feature at ${from}`);
      if (distance <= from) {
        const seconds = (from - distance) / level.speed;
        assert.ok(seconds >= checkpointTuning.beforeSeconds - 1e-9, `${level.id} checkpoint leaves only ${seconds.toFixed(2)}s before the next feature`);
      } else {
        const seconds = (distance - to) / level.speed;
        assert.ok(seconds >= checkpointTuning.behindSeconds - 1e-9, `${level.id} checkpoint is only ${seconds.toFixed(2)}s past a feature`);
      }
    }
  }
});

test('the checkpoint scan is deterministic and returns null when the window is crowded', () => {
  const level = levels.find(({ length }) => length >= checkpointTuning.minimumLength);
  assert.equal(safeCheckpointDistance(level), safeCheckpointDistance(level));
  const crowded = {
    length: 120,
    speed: 9,
    hazardStyle: 'spike',
    obstacles: Array.from({ length: 75 }, (_, index) => [18 + index * 1.2, 1]),
    gaps: [],
    platforms: [],
    portals: [],
    enemies: [],
    collectibles: [],
  };
  assert.equal(safeCheckpointDistance(crowded), null);
});

test('mergeRunProgress remembers a checkpoint-free clear and never downgrades it', () => {
  const first = mergeRunProgress(emptyProgress(), 'neon-run', { reached: 1, cleared: true, usedCheckpoint: false });
  assert.equal(first.courses['neon-run'].noCheckpoint, true);
  const laterWithCheckpoint = mergeRunProgress(first, 'neon-run', { reached: 1, cleared: true, usedCheckpoint: true });
  assert.equal(laterWithCheckpoint.courses['neon-run'].noCheckpoint, true);
  const laterFailed = mergeRunProgress(first, 'neon-run', { reached: .4, cleared: false, usedCheckpoint: false });
  assert.equal(laterFailed.courses['neon-run'].noCheckpoint, true);
  const checkpointClear = mergeRunProgress(emptyProgress(), 'neon-run', { reached: 1, cleared: true, usedCheckpoint: true });
  assert.equal(checkpointClear.courses['neon-run'].noCheckpoint, undefined);
  const partialRun = mergeRunProgress(emptyProgress(), 'neon-run', { reached: .6, cleared: false, usedCheckpoint: false });
  assert.equal(partialRun.courses['neon-run'].noCheckpoint, undefined);
  assert.deepEqual(
    parseProgress(JSON.stringify({ version: 2, courses: { 'neon-run': { best: 1, shards: 0, cleared: true, noCheckpoint: true } } })),
    { version: 2, courses: { 'neon-run': { best: 1, shards: 0, cleared: true, noCheckpoint: true } } },
  );
});
