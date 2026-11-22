export function isObstacleCollision(playerX, obstacleX, jumpHeight, options = {}) {
  const { horizontalRadius = .72, clearanceHeight = .95 } = options;
  return Math.abs(obstacleX - playerX) < horizontalRadius && jumpHeight < clearanceHeight;
}

export function levelProgressPercent(distance, length) {
  if (!Number.isFinite(length) || length <= 0) return 0;
  return Math.max(0, Math.min(100, (distance / length) * 100));
}
