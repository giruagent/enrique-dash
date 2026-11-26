import { pathToFileURL } from 'node:url';
import { levels } from '../src/levels.js';
import { playLevel } from './auto-player.mjs';
import { beatWindows } from './level-physics.mjs';

function featureCounts(level) {
  return {
    obstacles: (level.obstacles ?? []).length,
    gaps: (level.gaps ?? []).length,
    platforms: (level.platforms ?? []).length,
    portals: (level.portals ?? []).length,
    enemies: (level.enemies ?? []).length,
    collectibles: (level.collectibles ?? []).length,
  };
}

function bridgeCount(level) {
  return (level.gaps ?? []).filter((gap) => (level.platforms ?? []).some((platform) => (
    platform.height <= .6
    && platform.at <= gap.at
    && platform.at + platform.width >= gap.at + gap.width
  ))).length;
}

export function analyzeLevel(level, result = playLevel(level)) {
  const beats = beatWindows(level);
  const inputBeats = beats.filter(({ kind }) => kind === 'hazard' || kind === 'gap' || kind === 'enemy');
  const deadBandViolations = [];
  const telegraphViolations = [];
  let previousBeat = null;
  let previousEnd = 0;
  let minimumTelegraph = Infinity;
  let comboBeats = 0;

  for (const beat of inputBeats) {
    let sameJump = false;
    if (previousBeat) {
      const distance = beat.at - previousBeat.at;
      sameJump = distance <= .8 * beat.reach;
      if (!sameJump && distance < 1.35 * beat.reach) {
        deadBandViolations.push({
          from: previousBeat.id,
          to: beat.id,
          distance,
          reach: beat.reach,
          ratio: distance / beat.reach,
        });
      }
    }

    // Only the first beat of a phrase needs clear track. A beat sharing the
    // previous jump is already committed to and cannot be re-read in time.
    if (sameJump) {
      comboBeats++;
    } else {
      const clearDistance = Math.max(0, beat.courseStart - previousEnd);
      const seconds = clearDistance / level.speed;
      minimumTelegraph = Math.min(minimumTelegraph, seconds);
      if (seconds < .6) {
        telegraphViolations.push({ beat: beat.id, at: beat.at, clearDistance, seconds });
      }
    }
    previousBeat = beat;
    previousEnd = Math.max(previousEnd, beat.courseEnd);
  }

  const counts = featureCounts(level);
  const used = Object.entries(counts).filter(([, count]) => count > 0);
  const finishTime = result.finishTime;
  const obstacleCount = (level.obstacles ?? []).reduce((sum, [, count]) => sum + count, 0);
  const archetypes = {};
  for (const platform of level.platforms ?? []) {
    const kind = platform.kind ?? 'bridge';
    archetypes[kind] = (archetypes[kind] ?? 0) + 1;
  }

  return {
    level,
    result,
    beats: inputBeats.length,
    comboBeats,
    finishTime,
    inputsPerSecond: inputBeats.length / finishTime,
    obstaclesPerSecond: obstacleCount / finishTime,
    gapCount: counts.gaps,
    bridgeCount: bridgeCount(level),
    enemyCount: counts.enemies,
    archetypes,
    tightestMargin: result.tightestMargin,
    jumps: result.jumps,
    jumpsPerBeat: result.jumps / inputBeats.length,
    completed: result.completed,
    deadBandViolations,
    telegraphViolations,
    minimumTelegraph: Number.isFinite(minimumTelegraph) ? minimumTelegraph : 0,
    variety: {
      count: used.length,
      singleUse: used.filter(([, count]) => count === 1).map(([type]) => type),
    },
  };
}

function fixed(value, digits = 2) {
  return Number.isFinite(value) ? value.toFixed(digits) : '—';
}

function table(headers, rows) {
  const widths = headers.map((header, index) => Math.max(
    header.length,
    ...rows.map((row) => String(row[index]).length),
  ));
  const line = (row) => row.map((cell, index) => String(cell).padEnd(widths[index])).join(' | ').trimEnd();
  return [line(headers), widths.map((width) => '-'.repeat(width)).join('-|-'), ...rows.map(line)].join('\n');
}

export function formatReport(metrics) {
  const rows = metrics.map((metric) => {
    const dead = metric.deadBandViolations.length;
    const telegraph = metric.telegraphViolations.length;
    const single = metric.variety.singleUse.join(',');
    const archetypes = Object.entries(metric.archetypes)
      .map(([kind, count]) => `${kind} x${count}`)
      .join(' ');
    return [
      metric.level.id,
      fixed(metric.inputsPerSecond),
      fixed(metric.obstaclesPerSecond),
      metric.gapCount,
      metric.bridgeCount,
      metric.enemyCount,
      archetypes || '—',
      fixed(metric.tightestMargin),
      metric.jumps,
      fixed(metric.jumpsPerBeat),
      metric.comboBeats,
      dead ? `${dead}: ${metric.deadBandViolations.map(({ distance }) => fixed(distance)).join(', ')}` : '0',
      `${telegraph} (min ${fixed(metric.minimumTelegraph)}s)`,
      `${metric.variety.count}${single ? `; once: ${single}` : ''}`,
      metric.completed ? 'completed' : 'FAILED',
    ];
  });

  const output = [table(
    ['LEVEL', 'INPUT/S', 'OBS/S', 'GAPS', 'BRIDGES', 'ENEMIES', 'ARCHETYPES', 'MARGIN', 'JUMPS', 'JUMP/BEAT', 'COMBO', 'DEAD-BAND: DISTANCES', 'FIRST-BEAT TELEGRAPH <0.6s', 'VARIETY', 'RESULT'],
    rows,
  )];

  const telegraphs = metrics.flatMap((metric) => metric.telegraphViolations.map((violation) => (
    `${metric.level.id}: ${violation.beat} at ${fixed(violation.at)} has ${fixed(violation.seconds)}s telegraph (${fixed(violation.clearDistance)} clear units)`
  )));
  if (telegraphs.length) output.push('', 'Telegraph flags:', ...telegraphs.map((line) => `  ${line}`));

  const failures = metrics.filter(({ completed }) => !completed);
  if (failures.length) {
    output.push('', 'Auto-player failures:');
    for (const metric of failures) {
      const death = [...metric.result.events].reverse().find(({ type }) => type === 'death');
      output.push(`  ${metric.level.id}: ${death?.reason ?? 'course did not reach the finish'}`);
    }
  }

  const averageInputs = metrics.reduce((sum, metric) => sum + metric.inputsPerSecond, 0) / metrics.length;
  const completed = metrics.length - failures.length;
  const deadCount = metrics.reduce((sum, metric) => sum + metric.deadBandViolations.length, 0);
  const telegraphCount = metrics.reduce((sum, metric) => sum + metric.telegraphViolations.length, 0);
  const flagged = metrics.filter((metric) => metric.deadBandViolations.length || metric.telegraphViolations.length);
  output.push('', [
    `Summary: ${metrics.length} levels`,
    `average inputs/s ${fixed(averageInputs)}`,
    `auto-player ${completed}/${metrics.length} completed`,
    `dead-band violations ${deadCount}`,
    `telegraph violations ${telegraphCount}`,
    `total violations ${deadCount + telegraphCount}`,
    `levels that fail ${failures.length}${failures.length ? ` (${failures.map(({ level }) => level.id).join(', ')})` : ''}`,
    `levels with fairness flags ${flagged.length}`,
  ].join(' | '));

  const archetypeTotals = {};
  for (const metric of metrics) {
    for (const [kind, count] of Object.entries(metric.archetypes)) {
      archetypeTotals[kind] = (archetypeTotals[kind] ?? 0) + count;
    }
  }
  const archetypes = Object.entries(archetypeTotals)
    .map(([kind, count]) => `${kind} x${count}`)
    .join(', ') || 'none';
  output.push(`Archetypes: ${archetypes}`);

  return output.join('\n');
}

function main() {
  const metrics = levels.map((level) => analyzeLevel(level));
  console.log(formatReport(metrics));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
