import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const styles = await readFile(new URL('./style.css', import.meta.url), 'utf8');

test('the game surface is focusable and linked to visible control instructions', () => {
  const gameCanvas = html.match(/<div id="game-canvas"[^>]*>/)?.[0] ?? '';
  assert.match(gameCanvas, /role="application"/);
  assert.match(gameCanvas, /tabindex="0"/);
  assert.match(gameCanvas, /aria-describedby="game-instructions"/);
  assert.match(html, /id="game-instructions"/);
});

test('the game exposes a dedicated pause control', () => {
  const pauseButton = html.match(/<button id="pause-toggle"[^>]*>/)?.[0] ?? '';
  assert.notEqual(pauseButton, '');
  assert.doesNotMatch(pauseButton, /aria-pressed=/);
});

test('paused overlay has a dedicated high-contrast backdrop', () => {
  assert.match(styles, /\.game-wrap\.is-paused\s+\.game-overlay\s*\{[^}]*background:/);
});

test('paused overlay uses system colors in forced-colors mode', () => {
  assert.match(styles, /@media\s*\(forced-colors:\s*active\)[\s\S]*?\.game-wrap\.is-paused\s+\.game-overlay\s*\{[^}]*background:\s*Canvas/);
});
