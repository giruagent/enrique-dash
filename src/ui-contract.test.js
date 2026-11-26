import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const styles = await readFile(new URL('./style.css', import.meta.url), 'utf8');

test('the document declares the expected Content Security Policy', () => {
  const policy = html.match(/<meta http-equiv="Content-Security-Policy" content="([^"]+)">/)?.[1];
  assert.equal(policy, "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob:; media-src 'self'; connect-src 'self'; worker-src 'self' blob:; base-uri 'self'; form-action 'none'; frame-ancestors 'none'");
});

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

test('starting a run never consumes a jump', async () => {
  const main = await readFile(new URL('./main.js', import.meta.url), 'utf8');
  // The tap that starts or restarts a run must only start it. Applying it as a jump dropped the
  // player into the first gap on thirteen of the twenty composed courses.
  assert.doesNotMatch(main, /jumpAfterLoad/);
  assert.doesNotMatch(main, /pendingStartJump/);
  assert.match(main, /void start\(\);/);
});
