// Medal and streak rules are pure so the UI cannot invent a medal the progress store would not
// reproduce on the next load. Bronze is "cleared", silver is "every shard", gold is "every shard
// without leaning on the checkpoint".

export const MEDALS = ['bronze', 'silver', 'gold'];

/**
 * @param {{shards: number, totalShards: number, usedCheckpoint: boolean}} run
 * @returns {'bronze'|'silver'|'gold'}
 */
export function medalFor({ shards = 0, totalShards = 0, usedCheckpoint = false } = {}) {
  const all = totalShards === 0 || shards >= totalShards;
  if (!all) return 'bronze';
  return usedCheckpoint ? 'silver' : 'gold';
}

export function medalLabel(medal) {
  return MEDALS.includes(medal) ? medal.toUpperCase() : '';
}

/**
 * A run is a new best when the course had never been cleared, or when it found more shards than the
 * stored best. Distance is always full on a clear, so shards are the only comparable axis.
 */
export function isNewBest(previous, { shards = 0 } = {}) {
  if (!previous || previous.cleared !== true) return true;
  return shards > (Number.isFinite(previous.shards) ? previous.shards : 0);
}

/**
 * The HUD chip only earns its space once a run is actually chaining pickups: `streak` 0 is the
 * first shard, so the chip appears from the second one and reads as a multiplier.
 */
export function streakLabel(streak) {
  const value = Number.isFinite(streak) ? Math.floor(streak) : 0;
  return value >= 1 ? `×${Math.min(5, value + 1)}` : '';
}
