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

export function analyzeLevel(level, result = playLevel(level)) {
  const beats = beatWindows(level);
  const deadBandViolations = [];
  const telegraphViolations = [];
  let previousBeat = null;
  let previousEnd = 0;
  let minimumTelegraph = Infinity;

  for (const beat of beats) {
    if (previousBeat) {
      const distance = beat.at - previousBeat.at;
      if (distance >= beat.reach && distance < 1.35 * beat.reach) {
        deadBandViolations.push({
          from: previousBeat.id,
          to: beat.id,
          distance,
          reach: beat.reach,
          ratio: distance / beat.reach,
        });
      }
    }

    const clearDistance = Math.max(0, beat.courseStart - previousEnd);
    const seconds = clearDistance / level.speed;
    minimumTelegraph = Math.min(minimumTelegraph, seconds);
    if (seconds < .6) {
      telegraphViolations.push({ beat: beat.id, at: beat.at, clearDistance, seconds });
    }
    previousBeat = beat;
    previousEnd = Math.max(previousEnd, beat.courseEnd);
  }

  const counts = featureCounts(level);
  const used = Object.entries(counts).filter(([, count]) => count > 0);
  const finishTime = result.finishTime;
  const obstacleCount = (level.obstacles ?? []).reduce((sum, [, count]) => sum + count, 0);

  return {
    level,
    result,
    beats: beats.length,
    finishTime,
    inputsPerSecond: beats.length / finishTime,
    obstaclesPerSecond: obstacleCount / finishTime,
    gapCount: counts.gaps,
    enemyCount: counts.enemies,
    tightestMargin: result.tightestMargin,
    jumps: result.jumps,
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
    return [
      metric.level.id,
      fixed(metric.inputsPerSecond),
      fixed(metric.obstaclesPerSecond),
      metric.gapCount,
      metric.enemyCount,
      fixed(metric.tightestMargin),
      metric.jumps,
      dead ? `${dead}: ${metric.deadBandViolations.map(({ distance }) => fixed(distance)).join(', ')}` : '0',
      `${telegraph} (min ${fixed(metric.minimumTelegraph)}s)`,
      `${metric.variety.count}${single ? `; once: ${single}` : ''}`,
      metric.completed ? 'completed' : 'FAILED',
    ];
  });

  const output = [table(
    ['LEVEL', 'INPUT/S', 'OBS/S', 'GAPS', 'ENEMIES', 'MARGIN', 'JUMPS', 'DEAD-BAND: DISTANCES', 'TELEGRAPH <0.6s', 'VARIETY', 'RESULT'],
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

  return output.join('\n');
}

function main() {
  const metrics = levels.map((level) => analyzeLevel(level));
  console.log(formatReport(metrics));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
