import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { emitBurst, emitRing } from './particles.js';

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

test('level cards show a progress bar, shard pips and a medal dot', async () => {
  const main = await readFile(new URL('./main.js', import.meta.url), 'utf8');
  const cardRenderer = main.match(/function renderLevelCards\(\)[\s\S]*?\n\}/)?.[0] ?? '';
  assert.notEqual(cardRenderer, '');
  assert.match(cardRenderer, /level-card-progress/);
  assert.match(cardRenderer, /setAttribute\('role', 'presentation'\)/);
  assert.match(cardRenderer, /level-card-percent/);
  assert.match(cardRenderer, /aria-hidden', 'true'/);
  assert.match(cardRenderer, /level-card-shards/);
  assert.match(cardRenderer, /◆/);
  assert.match(cardRenderer, /level-card-medal/);
  assert.match(cardRenderer, /courseMedal\(/);
  assert.match(styles, /\.level-card-shards\s*\{[^}]*color:\s*#ffe066/);
  assert.match(styles, /\.level-card-medal\.bronze\s*\{[^}]*background:\s*#c98a4b/);
  assert.match(styles, /\.level-card-medal\.silver\s*\{[^}]*background:\s*#dfe8f5/);
});

test('the HUD shows an effect pill row that main.js fills from activeEffects', async () => {
  const main = await readFile(new URL('./main.js', import.meta.url), 'utf8');
  const effectHud = html.match(/<ul[^>]*id="effect-hud"[^>]*>/)?.[0] ?? '';
  assert.notEqual(effectHud, '');
  assert.match(effectHud, /class="effect-hud"/);
  assert.match(effectHud, /aria-hidden="true"/);
  const hudStart = html.indexOf('<div class="game-hud">');
  const canvasStart = html.indexOf('<div id="game-canvas"');
  const effectStart = html.indexOf('id="effect-hud"');
  assert.ok(hudStart !== -1 && effectStart > hudStart && effectStart < canvasStart, 'the effect HUD belongs inside the game HUD');
  assert.match(styles, /\.effect-hud\[hidden\]\s*\{[^}]*display:\s*none/);
  assert.match(styles, /\.effect-pill-fill\s*\{[^}]*background:\s*var\(--effect-color/);
  assert.match(main, /activeEffects\(/);
  assert.match(main, /EFFECT_BAR_INTERVAL_MS\s*=\s*100/);
  assert.match(main, /Math\.round\(effect\.ratio \* 100\)/);
});

test('the active effect ring and shield halo use the authored geometry', async () => {
  const main = await readFile(new URL('./main.js', import.meta.url), 'utf8');
  assert.match(main, /new THREE\.TorusGeometry\(\.55, \.04,/);
  assert.match(main, /emissiveIntensity:\s*\.8/);
  assert.match(main, /effectCopy\.shield\.color/);
  assert.match(main, /reducedMotion \? 0 : Math\.sin\(simulationTime/);
});

test('long courses use safeCheckpointDistance and resume attempts from the checkpoint', async () => {
  const main = await readFile(new URL('./main.js', import.meta.url), 'utf8');
  assert.match(main, /safeCheckpointDistance\(/);
  assert.match(main, /attemptStart/);
  assert.match(main, /One more try — from the checkpoint\./);
  assert.match(main, /checkpointPassed/);
});

test('the shelf has two campaign tabs with pressed state and arrow-key navigation', async () => {
  const switcher = html.match(/<div[^>]*id="campaign-switcher"[^>]*>[\s\S]*?<\/div>/)?.[0] ?? '';
  assert.notEqual(switcher, '');
  assert.match(switcher, /role="tablist"/);
  assert.match(switcher, /aria-label="Campaigns"/);
  const tabs = switcher.match(/<button[^>]*class="campaign-tab"[^>]*>/g) ?? [];
  assert.equal(tabs.length, 2, 'the shelf needs exactly two campaign tabs');
  assert.match(switcher, /data-campaign-id="core"/);
  assert.match(switcher, /data-campaign-id="wool"/);
  assert.match(switcher, /NEON ROAD/);
  assert.match(switcher, /WOOL ROAD/);
  assert.equal((switcher.match(/aria-pressed=/g) ?? []).length, 2);
  assert.match(styles, /\.campaign-switcher\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(styles, /\.campaign-tab\s*\{[^}]*min-height:\s*44px/);
  const main = await readFile(new URL('./main.js', import.meta.url), 'utf8');
  assert.match(main, /campaignSwitcher/);
  assert.match(main, /ArrowLeft/);
  assert.match(main, /ArrowRight/);
});

test('chapter headers render only for campaigns that define chapters', async () => {
  const main = await readFile(new URL('./main.js', import.meta.url), 'utf8');
  const campaigns = await readFile(new URL('./campaigns.js', import.meta.url), 'utf8');
  assert.match(campaigns, /chapters:\s*null/, 'the core campaign must not define chapters');
  assert.match(campaigns, /chapters:\s*\[\s*\{\s*at:\s*0,\s*name:\s*'THIMBLE MEADOW'\s*\}/, 'the wool campaign needs its Thimble Meadow chapter');
  assert.match(main, /if \(activeCampaign\.chapters\)/);
  assert.match(main, /activeCampaign\.chapters\.findIndex\(\(chapter\) => chapter\.at === index\)/);
  assert.match(main, /WORLD \$\{chapterIndex \+ 1\} · \$\{chapter\.name\}/);
});

test('clearing a course advances instead of replaying the same one', async () => {
  const main = await readFile(new URL('./main.js', import.meta.url), 'utf8');
  // The old handler did `if (dead || completed) reset()`, so a tap after a clear replayed the
  // course that had just been finished.
  const jumpBody = main.match(/function jump\(\) \{[\s\S]*?\n\}/)?.[0] ?? '';
  assert.match(jumpBody, /if \(completed\) \{\s*advanceAfterClear\(\);/, 'a clear must advance');
  assert.doesNotMatch(jumpBody, /dead \|\| completed/, 'the cleared case must be handled before the loss case');
  assert.match(main, /nextLevelButton\.addEventListener\('click', advanceAfterClear\)/);
  const helper = main.match(/function advanceAfterClear\(\) \{[\s\S]*?\n\}/)?.[0] ?? '';
  assert.match(helper, /selectedLevelIndex < activeLevels\.length - 1/, 'it must move to the next course in the active campaign');
  assert.match(helper, /selectLevel\(selectedLevelIndex \+ 1\)/, 'it must select that course');
});

test('the page labels match the package version', async () => {
  const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'));
  const labels = [...html.matchAll(/v(\d+\.\d+\.\d+)/g)].map((match) => match[1]);
  const footer = html.match(/VERSION (\d+\.\d+\.\d+)/)?.[1];
  assert.ok(labels.length >= 2, 'expected the header and HUD version labels');
  for (const label of [...labels, footer]) {
    assert.equal(label, pkg.version, `index.html advertises ${label} but package.json is ${pkg.version}`);
  }
});

test('the shard counter pop class is applied, animated and removed on animationend', async () => {
  const main = await readFile(new URL('./main.js', import.meta.url), 'utf8');
  assert.match(main, /collectibleCountDisplay\.classList\.add\('is-pop'\)/);
  assert.match(main, /collectibleCountDisplay\?\.addEventListener\('animationend', \(\) => \{\s*collectibleCountDisplay\.classList\.remove\('is-pop'\)/);
  assert.match(styles, /@keyframes shard-pop/);
  assert.match(styles, /scale\(1\.35\)/);
  assert.match(styles, /\.collectible-hud \.hud-value\.is-pop\{animation:shard-pop \.18s/);
});

test('reduced motion suppresses particle bursts and ring pulses', async () => {
  const calls = [];
  const pool = {
    burst(options) { calls.push(['burst', options]); return 1; },
    ring(options) { calls.push(['ring', options]); return true; },
  };
  assert.equal(emitBurst(pool, { count: 8 }, { reducedMotion: true }), 0);
  assert.equal(emitRing(pool, { life: .4 }, { reducedMotion: true }), false);
  assert.deepEqual(calls, [], 'nothing reaches the pool under reduced motion');
  assert.equal(emitBurst(pool, { count: 8 }, { reducedMotion: false }), 1);
  assert.equal(emitRing(pool, { life: .4 }, { reducedMotion: false }), true);
  assert.equal(calls.length, 2);
  const main = await readFile(new URL('./main.js', import.meta.url), 'utf8');
  assert.match(main, /emitBurst\(particlePool, options, \{ reducedMotion \}\)/);
  assert.match(main, /emitRing\(particlePool, options, \{ reducedMotion \}\)/);
});

test('the MUSIC toggle gates SFX and the death feedback is reduced-motion aware', async () => {
  const main = await readFile(new URL('./main.js', import.meta.url), 'utf8');
  assert.match(main, /if \(!musicEnabled \|\| !sfxEngine\) return false/);
  assert.match(main, /sfxEngine\?\.setEnabled\(musicEnabled\)/);
  assert.match(main, /function flashDamage\(\) \{\s*if \(reducedMotion/);
  assert.match(html, /id="damage-vignette"/);
  assert.match(styles, /@keyframes damage-vignette/);
  assert.match(styles, /@keyframes screen-shake/);
  assert.match(styles, /@keyframes chip-pulse/);
});
