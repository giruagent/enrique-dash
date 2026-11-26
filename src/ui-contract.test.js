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

test('the course legend names all four gameplay roles', () => {
  const legend = html.match(/<ul class="game-legend"[\s\S]*?<\/ul>/)?.[0] ?? '';
  assert.notEqual(legend, '');
  assert.match(legend, /aria-label="Course legend: danger, shard, power-up, platform"/);
  for (const role of ['DANGER', 'SHARD', 'POWER-UP', 'PLATFORM']) {
    assert.match(legend, new RegExp(`>${role}<`), `the legend is missing ${role}`);
  }
  assert.match(styles, /\.game-legend\s*\{[^}]*display:\s*flex[^}]*flex-wrap:\s*wrap/);
  assert.match(styles, /\.game-legend\s*\{[^}]*font-size:\s*9px/);
});

test('the HUD keeps a hidden finish chip until the course is close', () => {
  const chip = html.match(/<div[^>]*id="finish-chip"[^>]*>/)?.[0] ?? '';
  assert.notEqual(chip, '');
  assert.match(chip, /\bhidden\b/);
  assert.match(chip, /aria-hidden="true"/);
  const hudStart = html.indexOf('<div class="game-hud">');
  const canvasStart = html.indexOf('<div id="game-canvas"');
  const chipStart = html.indexOf('id="finish-chip"');
  assert.ok(hudStart !== -1 && chipStart > hudStart && chipStart < canvasStart, 'the finish chip belongs inside the game HUD');
  assert.match(styles, /\.finish-chip\[hidden\]\s*\{[^}]*display:\s*none/);
  assert.match(styles, /\.finish-chip\s*\{[^}]*position:\s*absolute[^}]*font-size:\s*10px/);
});

test('power-up labels come from the shared copy and announce on activation', async () => {
  const main = await readFile(new URL('./main.js', import.meta.url), 'utf8');
  assert.match(main, /portalLabel\(/);
  assert.match(main, /message\.textContent\s*=\s*copy\.announcement/);
  assert.match(main, /gameStatus\.textContent\s*=\s*copy\.announcement/);
});

test('starting a run never consumes a jump', async () => {
  const main = await readFile(new URL('./main.js', import.meta.url), 'utf8');
  // The tap that starts or restarts a run must only start it. Applying it as a jump dropped the
  // player into the first gap on thirteen of the twenty composed courses.
  assert.doesNotMatch(main, /jumpAfterLoad/);
  assert.doesNotMatch(main, /pendingStartJump/);
  assert.match(main, /void start\(\);/);
});
