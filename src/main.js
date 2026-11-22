let THREE;
import packageInfo from '../package.json';
import { getLevel, levels } from './levels.js';
import { isObstacleCollision, levelProgressPercent } from './game-logic.js';
import { MusicEngine } from './music.js';
import './style.css';

const stage = document.querySelector('#game-canvas');
const gameWrap = document.querySelector('#game-wrap');
const overlay = document.querySelector('#game-overlay');
const playButton = document.querySelector('#play-button');
const nextLevelButton = document.querySelector('#next-level-button');
const progressFill = document.querySelector('#progress-fill');
const progressTrack = document.querySelector('#progress-track');
const attemptDisplay = document.querySelector('#attempt');
const message = document.querySelector('#game-message');
const levelName = document.querySelector('#level-name');
const fullscreenButton = document.querySelector('#fullscreen-toggle');
const musicButton = document.querySelector('#music-toggle');
const laneY = -1.7;
const musicEngine = new MusicEngine();
let selectedLevelIndex = 0;
let level = levels[selectedLevelIndex];
let renderer, scene, camera, player, playerSprite, spriteMaterial, atlasTexture, spriteMap, clock, raf, resizeObserver;
let sceneStarted = false;
let scenePromise = null;
let floor, floorMaterial, trackEdgeMaterial;
let running = false, started = false, dead = false, completed = false, distance = 0, attempt = 1;
let musicEnabled = true, pseudoFullscreen = false, activeAnimation = '', animationTime = 0;
const obstacles = [];
const completionKey = 'enrique-dash.completed-levels.v1';
let completedLevelIds = readCompletedLevels();

function readCompletedLevels() {
  try {
    const saved = JSON.parse(localStorage.getItem(completionKey) || '[]');
    return new Set(Array.isArray(saved) ? saved.filter((id) => levels.some((item) => item.id === id)) : []);
  } catch {
    return new Set();
  }
}

function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(level.background);
  scene.fog = new THREE.Fog(level.background, 15, 47);
  camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
  camera.position.set(0, 5.6, 15);
  camera.lookAt(0, 0, 0);
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  } catch {
    stage.innerHTML = '<div class="webgl-fallback">WebGL could not start. Try a recent Safari or Chrome browser.</div>';
    return false;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setSize(stage.clientWidth, stage.clientHeight);
  stage.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0x99c5ff, 0x251c4a, 2));
  const light = new THREE.DirectionalLight(0xffffff, 2.2);
  light.position.set(-3, 8, 7);
  scene.add(light);
  floorMaterial = new THREE.MeshStandardMaterial({ color: level.floor, roughness: .86 });
  floor = new THREE.Mesh(new THREE.PlaneGeometry(130, 18), floorMaterial);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(22, laneY, 0);
  scene.add(floor);
  const grid = new THREE.GridHelper(120, 64, 0x456276, 0x28374f);
  grid.position.set(22, laneY + .02, 0);
  grid.material.transparent = true;
  grid.material.opacity = .35;
  scene.add(grid);
  for (let index = 0; index < 14; index++) {
    const height = 1.5 + ((index * 37) % 7) * .5;
    const building = new THREE.Mesh(new THREE.BoxGeometry(1.5, height, .45), new THREE.MeshBasicMaterial({ color: index % 2 ? 0x263451 : 0x202d49 }));
    building.position.set(-12 + index * 2.7, laneY + height / 2, -5.2);
    scene.add(building);
    for (let windowIndex = 0; windowIndex < 3; windowIndex++) {
      const windowLight = new THREE.Mesh(new THREE.BoxGeometry(.06, .17, .04), new THREE.MeshBasicMaterial({ color: index % 3 ? 0x526289 : 0xb7ef73 }));
      windowLight.position.set(building.position.x - .35 + windowIndex * .35, laneY + height / 2 + .2, -4.94);
      scene.add(windowLight);
    }
  }
  trackEdgeMaterial = new THREE.MeshBasicMaterial({ color: level.color });
  const edge = new THREE.Mesh(new THREE.BoxGeometry(120, .06, .12), trackEdgeMaterial);
  edge.position.set(22, laneY + .04, .15);
  scene.add(edge);
  player = new THREE.Group();
  player.position.set(-3, laneY, 0);
  player.userData.vy = 0;
  player.userData.grounded = true;
  const fallbackMaterial = new THREE.MeshStandardMaterial({ color: level.color, emissive: level.color, emissiveIntensity: .55 });
  const fallback = new THREE.Mesh(new THREE.BoxGeometry(.78, .78, .78), fallbackMaterial);
  fallback.position.y = .4;
  player.add(fallback);
  player.userData.fallback = fallback;
  scene.add(player);
  resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);
  clock = new THREE.Clock();
  renderer.domElement.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    running = false;
    void musicEngine.stop();
    showOverlay('Graphics paused.', 'Reload the page to restart this demo.');
  });
  loadCharacter();
  updateTheme();
  gameWrap.classList.add('scene-ready');
  draw();
  return true;
}

async function ensureScene() {
  if (sceneStarted) return true;
  if (scenePromise) return scenePromise;
  showOverlay('Loading your level…', 'Getting the 3D world ready.');
  scenePromise = (async () => {
    try {
      THREE = await import('three');
      sceneStarted = initScene();
      if (!sceneStarted) {
        showOverlay('WebGL is unavailable.', 'Try a browser with WebGL enabled.');
        scenePromise = null;
      }
      return sceneStarted;
    } catch (error) {
      console.error('The game engine could not load.', error);
      showOverlay('The game could not load.', 'Check your connection and try again.');
      scenePromise = null;
      return false;
    }
  })();
  return scenePromise;
}

async function loadCharacter() {
  try {
    const base = import.meta.env.BASE_URL;
    const [mappingResponse, texture] = await Promise.all([
      fetch(`${base}character/sprite_map.json`),
      new THREE.TextureLoader().loadAsync(`${base}character/atlas_all.png`),
    ]);
    if (!mappingResponse.ok) throw new Error(`Sprite map returned ${mappingResponse.status}`);
    spriteMap = await mappingResponse.json();
    atlasTexture = texture;
    atlasTexture.colorSpace = THREE.SRGBColorSpace;
    atlasTexture.magFilter = THREE.LinearFilter;
    atlasTexture.minFilter = THREE.LinearMipmapLinearFilter;
    atlasTexture.generateMipmaps = true;
    spriteMaterial = new THREE.MeshBasicMaterial({ map: atlasTexture, transparent: true, alphaTest: .03, side: THREE.DoubleSide, toneMapped: false });
    playerSprite = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6), spriteMaterial);
    // The supplied sprite-map foot anchor stays aligned with the track surface.
    playerSprite.position.set(0, 3.6 * (232 / 256 - .5), .12);
    player.add(playerSprite);
    player.userData.fallback.visible = false;
    playAnimation('idle');
  } catch (error) {
    console.warn('Character atlas unavailable; using the built-in placeholder.', error);
  }
}

function playAnimation(name) {
  const animation = spriteMap?.animations?.[name];
  if (!animation || !playerSprite) return;
  if (activeAnimation !== name) {
    activeAnimation = name;
    animationTime = 0;
    setSpriteFrame(animation.frames[0]);
  }
}

function setSpriteFrame(frameId) {
  const rect = spriteMap?.frames?.[frameId]?.rects?.['atlas_all.png'];
  if (!rect || !atlasTexture) return;
  const width = spriteMap.atlas.all.width;
  const height = spriteMap.atlas.all.height;
  atlasTexture.repeat.set(rect.w / width, rect.h / height);
  atlasTexture.offset.set(rect.x / width, 1 - (rect.y + rect.h) / height);
}

function updateAnimation(dt) {
  if (!spriteMap || !playerSprite) return;
  const velocityY = player.userData.vy;
  const animationName = dead ? 'hurt' : completed ? 'victory' : !started ? 'idle' : player.userData.grounded ? 'run' : velocityY > 2 ? 'jump_rise' : velocityY > -1.5 ? 'jump_apex' : 'fall';
  playAnimation(animationName);
  const animation = spriteMap.animations[animationName];
  animationTime += dt;
  if (animationTime >= 1 / animation.fps) {
    animationTime = 0;
    const frameIndex = Math.floor(clock.elapsedTime * animation.fps) % animation.frames.length;
    setSpriteFrame(animation.frames[frameIndex]);
  }
}

function resize() {
  if (!renderer || !stage.clientWidth || !stage.clientHeight) return;
  camera.aspect = stage.clientWidth / stage.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(stage.clientWidth, stage.clientHeight);
}

function draw() {
  raf = requestAnimationFrame(draw);
  if (!renderer) return;
  const dt = Math.min(clock.getDelta(), .04);
  if (running) update(dt);
  updateAnimation(dt);
  renderer.render(scene, camera);
}

function update(dt) {
  distance += dt * level.speed;
  player.position.y += player.userData.vy * dt;
  player.userData.vy -= 19 * dt;
  if (player.position.y <= laneY) {
    player.position.y = laneY;
    player.userData.vy = 0;
    player.userData.grounded = true;
  }
  for (let index = obstacles.length - 1; index >= 0; index--) {
    const obstacle = obstacles[index];
    obstacle.position.x -= level.speed * dt;
    if (obstacle.position.x < -8) {
      scene.remove(obstacle);
      obstacle.geometry.dispose();
      obstacle.material.dispose();
      obstacles.splice(index, 1);
      continue;
    }
    if (isObstacleCollision(player.position.x, obstacle.position.x, player.position.y - laneY)) {
      crash();
      break;
    }
  }
  updateProgress(levelProgressPercent(distance, level.length));
  if (distance >= level.length) finish();
}

function updateProgress(percent) {
  const rounded = Math.round(percent);
  progressFill.style.width = `${percent}%`;
  progressTrack.setAttribute('aria-valuenow', String(rounded));
}

function spawnObstacles() {
  for (const [distanceAlongTrack, count] of level.obstacles) {
    for (let index = 0; index < count; index++) {
      const geometry = new THREE.ConeGeometry(.57, .95, 4);
      geometry.rotateY(Math.PI / 4);
      const material = new THREE.MeshStandardMaterial({ color: 0xff557d, emissive: 0x761c45, emissiveIntensity: .55, metalness: .15 });
      const obstacle = new THREE.Mesh(geometry, material);
      obstacle.position.set(distanceAlongTrack - 3 + index * 1.28, laneY + .475, 0);
      scene.add(obstacle);
      obstacles.push(obstacle);
    }
  }
}

function updateTheme() {
  if (!scene || !floorMaterial || !trackEdgeMaterial) return;
  scene.background.setHex(level.background);
  scene.fog.color.setHex(level.background);
  floorMaterial.color.setHex(level.floor);
  trackEdgeMaterial.color.setHex(level.color);
  document.documentElement.style.setProperty('--level-accent', `#${level.color.toString(16).padStart(6, '0')}`);
  const fallbackMaterial = player?.userData.fallback?.material;
  fallbackMaterial?.color.setHex(level.color);
  fallbackMaterial?.emissive.setHex(level.color);
}

function showOverlay(title, instructions, showNext = false) {
  overlay.hidden = false;
  overlay.querySelector('h2').textContent = title;
  overlay.querySelector('p').textContent = instructions;
  nextLevelButton.hidden = !showNext;
}

function selectLevel(index) {
  if (!Number.isInteger(index) || index < 0 || index >= levels.length) return;
  reset();
  selectedLevelIndex = index;
  level = getLevel(levels[index].id);
  levelName.textContent = `${String(index + 1).padStart(2, '0')} / ${level.name}`;
  attempt = 1;
  attemptDisplay.textContent = '01';
  updateProgress(0);
  updateTheme();
  showOverlay(`${level.name} is ready.`, 'Tap anywhere or press Space to jump.');
  document.querySelectorAll('.level-card').forEach((card, cardIndex) => {
    const selected = cardIndex === selectedLevelIndex;
    card.classList.toggle('selected', selected);
    card.setAttribute('aria-pressed', String(selected));
  });
}

async function start({ jumpAfterLoad = false } = {}) {
  if (running) return true;
  if (dead || completed) reset();
  if (musicEnabled) musicEngine.start(level.music).catch((error) => console.warn('Music could not start.', error));
  if (!await ensureScene()) {
    void musicEngine.stop();
    return false;
  }
  if (running) return true;
  started = true;
  running = true;
  overlay.hidden = true;
  message.textContent = 'TAP / CLICK / SPACE TO JUMP';
  playButton.innerHTML = '<span class="play-icon" aria-hidden="true">↻</span> RESTART LEVEL';
  spawnObstacles();
  if (jumpAfterLoad && player.userData.grounded) {
    player.userData.vy = 8.3;
    player.userData.grounded = false;
  }
  return true;
}

function jump() {
  if (dead || completed) reset();
  if (!sceneStarted || !running) {
    void start({ jumpAfterLoad: true });
    return;
  }
  if (!player.userData.grounded) return;
  player.userData.vy = 8.3;
  player.userData.grounded = false;
}

function crash() {
  running = false;
  dead = true;
  attempt++;
  attemptDisplay.textContent = String(attempt).padStart(2, '0');
  showOverlay('One more try.', 'Tap or press Space to try this level again.');
  message.textContent = 'RUN ENDED — TRY AGAIN';
  void musicEngine.stop();
}

function finish() {
  running = false;
  completed = true;
  distance = level.length;
  updateProgress(100);
  completedLevelIds.add(level.id);
  try { localStorage.setItem(completionKey, JSON.stringify([...completedLevelIds])); } catch { /* Completion remains available for this session. */ }
  renderLevelCards();
  showOverlay(`${level.name} cleared!`, `Course ${selectedLevelIndex + 1} of ${levels.length} complete.`, selectedLevelIndex < levels.length - 1);
  message.textContent = 'LEVEL COMPLETE';
  void musicEngine.stop();
}

function reset() {
  dead = false;
  completed = false;
  started = false;
  running = false;
  distance = 0;
  attempt = 1;
  if (player) {
    player.position.set(-3, laneY, 0);
    player.userData.vy = 0;
    player.userData.grounded = true;
  }
  for (const obstacle of obstacles) {
    scene?.remove(obstacle);
    obstacle.geometry.dispose();
    obstacle.material.dispose();
  }
  obstacles.length = 0;
  attemptDisplay.textContent = '01';
  updateProgress(0);
  message.textContent = 'TAP / CLICK / SPACE TO JUMP';
  playButton.innerHTML = '<span class="play-icon" aria-hidden="true">▶</span> PLAY LEVEL';
  showOverlay(`${level.name} is ready.`, 'Tap anywhere or press Space to jump.');
  void musicEngine.stop();
}

function renderLevelCards() {
  const list = document.querySelector('#level-list');
  list.replaceChildren();
  levels.forEach((item, index) => {
    const button = document.createElement('button');
    button.className = `level-card${index === selectedLevelIndex ? ' selected' : ''}${completedLevelIds.has(item.id) ? ' completed' : ''}`;
    button.type = 'button';
    button.setAttribute('aria-pressed', String(index === selectedLevelIndex));
    button.setAttribute('aria-label', `Play level ${index + 1}: ${item.name}${completedLevelIds.has(item.id) ? ', completed' : ''}`);
    const number = document.createElement('span');
    number.className = 'level-number';
    number.textContent = `LEVEL ${String(index + 1).padStart(2, '0')}`;
    const title = document.createElement('span');
    title.className = 'level-card-title';
    title.textContent = item.name;
    const zone = document.createElement('span');
    zone.className = 'level-card-zone';
    zone.textContent = item.zone;
    button.append(number, title, zone);
    button.addEventListener('click', () => selectLevel(index));
    list.appendChild(button);
  });
}

function syncFullscreenUI() {
  const nativeFullscreen = document.fullscreenElement === gameWrap || document.webkitFullscreenElement === gameWrap;
  const isFullscreen = nativeFullscreen || pseudoFullscreen;
  gameWrap.classList.toggle('fullscreen-mode', isFullscreen);
  document.body.classList.toggle('fullscreen-active', isFullscreen);
  fullscreenButton.textContent = isFullscreen ? 'EXIT FULLSCREEN' : 'FULLSCREEN';
  fullscreenButton.setAttribute('aria-label', isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen');
  fullscreenButton.setAttribute('aria-pressed', String(isFullscreen));
  requestAnimationFrame(resize);
}

async function toggleFullscreen() {
  const nativeFullscreen = document.fullscreenElement === gameWrap || document.webkitFullscreenElement === gameWrap;
  if (nativeFullscreen) {
    const exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen;
    if (exitFullscreen) {
      try { await exitFullscreen.call(document); } catch { /* Browser already exited fullscreen. */ }
    }
    return;
  }
  if (pseudoFullscreen) {
    pseudoFullscreen = false;
    syncFullscreenUI();
    return;
  }
  try {
    const requestFullscreen = gameWrap.requestFullscreen || gameWrap.webkitRequestFullscreen;
    if (!requestFullscreen) throw new Error('Fullscreen API unavailable');
    await requestFullscreen.call(gameWrap, { navigationUI: 'hide' });
  } catch {
    pseudoFullscreen = true;
    syncFullscreenUI();
  }
}

function toggleMusic() {
  musicEnabled = !musicEnabled;
  musicButton.textContent = musicEnabled ? 'MUSIC ON' : 'MUSIC OFF';
  musicButton.setAttribute('aria-label', musicEnabled ? 'Mute music' : 'Enable music');
  musicButton.setAttribute('aria-pressed', String(musicEnabled));
  if (musicEnabled && running) musicEngine.start(level.music).catch((error) => console.warn('Music could not start.', error));
  else if (!musicEnabled) void musicEngine.stop();
}

playButton.addEventListener('click', () => {
  if (running) reset();
  void start();
});
stage.addEventListener('pointerdown', (event) => { event.preventDefault(); jump(); });
overlay.addEventListener('pointerdown', (event) => { if (event.target === overlay) jump(); });
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && pseudoFullscreen) {
    pseudoFullscreen = false;
    syncFullscreenUI();
    return;
  }
  if (!['Space', 'ArrowUp', 'KeyW'].includes(event.code)) return;
  if (event.target instanceof Element && event.target.closest('button, a, input, select, textarea')) return;
  event.preventDefault();
  jump();
});
fullscreenButton.addEventListener('click', () => { void toggleFullscreen(); });
musicButton.addEventListener('click', toggleMusic);
nextLevelButton.addEventListener('click', () => {
  if (selectedLevelIndex < levels.length - 1) {
    selectLevel(selectedLevelIndex + 1);
    void start();
  }
});
document.addEventListener('fullscreenchange', syncFullscreenUI);
document.addEventListener('webkitfullscreenchange', syncFullscreenUI);
gameWrap.addEventListener('fullscreenerror', () => {
  pseudoFullscreen = true;
  syncFullscreenUI();
});
window.addEventListener('resize', resize);
document.addEventListener('visibilitychange', () => {
  if (document.hidden && running) {
    running = false;
    showOverlay('Paused.', 'Tap anywhere or press Space to resume.');
    void musicEngine.stop();
  }
});
document.querySelector('#version-label').textContent = `v${packageInfo.version}`;
document.querySelector('#footer-version').textContent = `VERSION ${packageInfo.version}`;
musicButton.setAttribute('aria-pressed', String(musicEnabled));
renderLevelCards();
window.addEventListener('pagehide', () => {
  cancelAnimationFrame(raf);
  resizeObserver?.disconnect();
  renderer?.dispose();
  atlasTexture?.dispose();
  void musicEngine.stop();
});
