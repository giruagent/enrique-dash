let THREE;
import packageInfo from '../package.json';
import { getLevel, levelValidationError, levels } from './levels.js';
import { createLossCue, playOneShot, primeOneShot, stopOneShot } from './audio-cues.js';
import { activeEffects, canConsumeJumpBuffer, courseMedal, effectCopy, emptyProgress, finishGateDistance, getHazardProfile, isCollectibleContact, isGamePaused, isObstacleCollision, jumpTuning, levelProgressPercent, mergeRunProgress, parseProgress, portalEffects, portalLabel, safeCheckpointDistance, shouldAcceptJumpInput, shouldHandleGameplayKey, shouldSpawnCourseFeatures, shouldStompEnemy, stepPlayerMotion } from './game-logic.js';
import { MusicEngine } from './music.js';
import './style.css';

const stage = document.querySelector('#game-canvas');
const gameWrap = document.querySelector('#game-wrap');
const overlay = document.querySelector('#game-overlay');
const playButton = document.querySelector('#play-button');
const pauseButton = document.querySelector('#pause-toggle');
const nextLevelButton = document.querySelector('#next-level-button');
const progressFill = document.querySelector('#progress-fill');
const progressTrack = document.querySelector('#progress-track');
const attemptDisplay = document.querySelector('#attempt');
const collectibleHud = document.querySelector('#collectible-hud');
const collectibleCountDisplay = document.querySelector('#collectible-count');
const finishChip = document.querySelector('#finish-chip');
const effectHud = document.querySelector('#effect-hud');
effectHud.hidden = true;
const message = document.querySelector('#game-message');
const gameStatus = document.querySelector('#game-status');
const levelName = document.querySelector('#level-name');
const fullscreenButton = document.querySelector('#fullscreen-toggle');
const musicButton = document.querySelector('#music-toggle');
const laneY = -1.7;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
// One global gameplay language. Course colour belongs to the environment, never to a gameplay
// object: danger reads red, collectibles gold, portals per type, and platforms as slate ground.
const GAMEPLAY_COLORS = Object.freeze({
  hazard: 0xff3b57,
  shard: 0xffe066,
  platform: 0x9fb4d6,
  portal: Object.freeze({
    spring: 0xffb54f,
    dash: 0x52eaff,
    float: 0xb884ff,
    shield: 0x6c9dff,
    phase: 0xff6fe0,
  }),
});
const musicEngine = new MusicEngine();
const lossCue = typeof Audio === 'function' ? createLossCue(import.meta.env.BASE_URL, Audio) : null;
let selectedLevelIndex = 0;
let level = levels[selectedLevelIndex];
let renderer, scene, camera, player, playerSprite, spriteMaterial, atlasTexture, spriteMap, clock, raf, resizeObserver;
let sceneStarted = false;
let scenePromise = null;
let floor, floorMaterial, trackEdgeMaterial, sceneryGroup;
let running = false, started = false, dead = false, completed = false, distance = 0, runBestDistance = 0, attempt = 1;
let checkpointDistance = null, checkpointPassed = false, attemptStart = 0;
let simulationTime = 0, graphicsUnavailable = false;
let musicEnabled = true, pseudoFullscreen = false, activeAnimation = '', animationTime = 0;
const obstacles = [];
const gaps = [];
const platforms = [];
const portals = [];
const enemies = [];
const collectibles = [];
const finishGates = [];
const checkpointFlags = [];
let collectedCount = 0;
const DEFAULT_RUN_MESSAGE = 'TAP / CLICK / SPACE TO JUMP · P TO PAUSE';
const PORTAL_ANNOUNCEMENT_SECONDS = 1.6;
const EFFECT_BAR_INTERVAL_MS = 100;
let finishChipLabel = '';
let portalAnnouncementTime = 0;
let effectHudSignature = '';
let effectHudBarElapsedMs = 0;
const effectPills = new Map();
let effectAura = null;
let effectAuraColor = null;
let effectHalo = null;
const completionKey = 'enrique-dash.completed-levels.v1';
const progressKey = 'enrique-dash.progress.v2';
let progress = readProgress();
let runRecorded = false;

// The v2 object is authoritative, but the legacy id array is still read forever so downgrades
// and old saves keep their clears. Unknown course ids survive parsing and are ignored by the
// selector, which only ever looks up ids from the level catalogue.
function readProgress() {
  let storedV2 = null;
  let storedLegacy = null;
  try { storedV2 = localStorage.getItem(progressKey); } catch { /* Storage is optional. */ }
  try { storedLegacy = localStorage.getItem(completionKey); } catch { /* Storage is optional. */ }
  const merged = parseProgress(storedV2);
  const legacy = parseProgress(storedLegacy);
  const courses = { ...merged.courses };
  for (const [id, entry] of Object.entries(legacy.courses)) {
    const current = courses[id];
    courses[id] = current
      ? {
        best: Math.max(current.best, entry.best ?? 0),
        shards: Math.max(current.shards, entry.shards ?? 0),
        cleared: current.cleared || entry.cleared,
        ...(current.noCheckpoint === true || entry.noCheckpoint === true ? { noCheckpoint: true } : {}),
      }
      : entry;
  }
  return { ...emptyProgress(), courses };
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
  sceneryGroup = new THREE.Group();
  scene.add(sceneryGroup);
  trackEdgeMaterial = new THREE.MeshBasicMaterial({ color: level.color });
  const edge = new THREE.Mesh(new THREE.BoxGeometry(120, .06, .12), trackEdgeMaterial);
  edge.position.set(22, laneY + .04, .15);
  scene.add(edge);
  player = new THREE.Group();
  player.position.set(-3, laneY, 0);
  player.userData.vy = 0;
  player.userData.grounded = true;
  player.userData.coyoteTimer = 0;
  player.userData.jumpBufferTimer = 0;
  player.userData.supportY = laneY;
  player.userData.effects = { dashTimer: 0, gravityTimer: 0, shieldCharges: 0, phaseTimer: 0 };
  const fallbackMaterial = new THREE.MeshStandardMaterial({ color: level.color, emissive: level.color, emissiveIntensity: .55 });
  const fallback = new THREE.Mesh(new THREE.BoxGeometry(.78, .78, .78), fallbackMaterial);
  fallback.position.y = .4;
  player.add(fallback);
  player.userData.fallback = fallback;
  scene.add(player);
  effectHalo = new THREE.Mesh(
    new THREE.TorusGeometry(.34, .025, 8, 24),
    new THREE.MeshStandardMaterial({
      color: effectCopy.shield.color,
      emissive: effectCopy.shield.color,
      emissiveIntensity: .8,
      metalness: .2,
      roughness: .3,
      transparent: true,
      opacity: .85,
    }),
  );
  effectHalo.rotation.x = -Math.PI / 2;
  effectHalo.position.set(0, 3.35, 0);
  effectHalo.visible = false;
  player.add(effectHalo);
  resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);
  clock = new THREE.Clock();
  renderer.domElement.addEventListener('webglcontextlost', (event) => {
    event.preventDefault();
    graphicsUnavailable = true;
    running = false;
    stopRenderLoop();
    playButton.disabled = true;
    syncPauseButton();
    void musicEngine.stop();
    showOverlay('Graphics paused.', 'Reload the page to restart this demo.');
  });
  loadCharacter();
  updateTheme();
  gameWrap.classList.add('scene-ready');
  renderScene();
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
      new THREE.TextureLoader().loadAsync(`${base}character/atlas_game.webp`),
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
  const rect = spriteMap?.frames?.[frameId]?.rects?.['atlas_game.webp'];
  if (!rect || !atlasTexture) return;
  const width = spriteMap.atlas.game.width;
  const height = spriteMap.atlas.game.height;
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
    const frameIndex = Math.floor(simulationTime * animation.fps) % animation.frames.length;
    setSpriteFrame(animation.frames[frameIndex]);
  }
}

function resize() {
  if (!renderer || !stage.clientWidth || !stage.clientHeight) return;
  camera.aspect = stage.clientWidth / stage.clientHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(stage.clientWidth, stage.clientHeight);
  renderScene();
}

function renderScene() {
  if (!renderer || !scene || !camera || graphicsUnavailable) return;
  renderer.render(scene, camera);
}

function startRenderLoop() {
  if (!renderer || graphicsUnavailable || raf != null) return;
  clock.start();
  raf = requestAnimationFrame(draw);
}

function stopRenderLoop() {
  if (raf != null) cancelAnimationFrame(raf);
  raf = null;
  clock?.stop();
}

function draw() {
  raf = null;
  if (!renderer || graphicsUnavailable) return;
  const dt = Math.min(clock.getDelta(), .04);
  if (running) {
    simulationTime += dt;
    update(dt);
  } else if (dead || completed) {
    simulationTime += dt;
  }
  if (running || dead || completed) {
    updateAnimation(dt);
    renderScene();
    raf = requestAnimationFrame(draw);
    return;
  }
  renderScene();
}

function update(dt) {
  const effects = player.userData.effects;
  player.userData.jumpBufferTimer = Math.max(0, player.userData.jumpBufferTimer - dt);
  player.userData.coyoteTimer = Math.max(0, player.userData.coyoteTimer - dt);
  effects.dashTimer = Math.max(0, effects.dashTimer - dt);
  effects.gravityTimer = Math.max(0, effects.gravityTimer - dt);
  effects.phaseTimer = Math.max(0, effects.phaseTimer - dt);
  const speed = level.speed * (effects.dashTimer > 0 ? portalEffects.dash.speedMultiplier : 1);
  distance += dt * speed;
  runBestDistance = Math.max(runBestDistance, distance);

  moveFeatureGroup(obstacles, dt, speed, removeObstacle);
  moveFeatureGroup(gaps, dt, speed, removeGap);
  moveFeatureGroup(platforms, dt, speed, removeMeshFeature);
  moveFeatureGroup(portals, dt, speed, removeMeshFeature);
  moveFeatureGroup(enemies, dt, speed, removeMeshFeature);
  moveFeatureGroup(collectibles, dt, speed, removeMeshFeature);
  moveFeatureGroup(finishGates, dt, speed, removeMeshFeature);
  moveFeatureGroup(checkpointFlags, dt, speed, removeMeshFeature);
  triggerPortals();
  updateCheckpoint();
  const result = stepPlayerMotion({
    x: player.position.x,
    y: player.position.y,
    velocityY: player.userData.vy,
    grounded: player.userData.grounded,
    coyoteTimer: player.userData.coyoteTimer,
  }, dt, {
    baseHeight: laneY,
    gaps: gaps.map(({ center, width }) => ({ center, width })),
    platforms,
  }, {
    gravityMultiplier: effects.gravityTimer > 0 ? portalEffects.float.gravityMultiplier : 1,
  });
  player.position.y = result.y;
  player.userData.vy = result.velocityY;
  player.userData.grounded = result.grounded;
  player.userData.coyoteTimer = result.coyoteTimer;
  player.userData.supportY = result.supportY;
  consumeBufferedJump();
  if (result.fell) {
    crash('Missed the jump.');
    return;
  }

  if (effects.phaseTimer <= 0) {
    for (let index = obstacles.length - 1; index >= 0; index--) {
      const obstacle = obstacles[index];
      const jumpHeight = player.position.y - player.userData.supportY;
      if (!isObstacleCollision(player.position.x, obstacle.mesh.position.x, jumpHeight, {
        horizontalRadius: obstacle.width / 2 + .15,
        clearanceHeight: obstacle.clearanceHeight,
        verticalForgiveness: jumpTuning.obstacleVerticalForgiveness,
      })) continue;
      if (effects.shieldCharges > 0) {
        effects.shieldCharges--;
        removeObstacle(obstacle, index);
        message.textContent = 'SHIELD SAVED YOU';
        continue;
      }
      crash();
      return;
    }
    if (handleEnemyCollisions()) return;
  }
  handleCollectibleCollisions();

  updateProgress(levelProgressPercent(distance, level.length));
  updateFinishChip();
  updateEffectHud(dt);
  updateEffectVisuals();
  updatePortalAnnouncement(dt);
  if (distance >= level.length) finish();
}

function moveFeatureGroup(group, dt, speed, removeFeature) {
  for (let index = group.length - 1; index >= 0; index--) {
    const feature = group[index];
    feature.mesh.position.x -= speed * dt;
    feature.center = feature.mesh.position.x;
    if (feature.decorations) {
      for (const decoration of feature.decorations) decoration.position.x = feature.center;
    }
    if (!reducedMotion && group === platforms && feature.bob > 0) {
      feature.currentHeight = feature.height + Math.sin(simulationTime * 2 + feature.phase) * feature.bob;
      feature.mesh.position.y = laneY + feature.currentHeight - .14;
    }
    if (group === enemies) {
      feature.mesh.rotation.y += dt * (feature.type === 'drone' ? 1.7 : .8);
      if (feature.type === 'drone') feature.mesh.position.y = feature.baseY + Math.sin(simulationTime * 2.2 + feature.phase) * .16;
    }
    if (!reducedMotion && group === portals && feature.spin) feature.spin.rotation.z += dt * 1.2;
    if (!reducedMotion && group === collectibles) feature.mesh.rotation.y += dt * .6;
    if (feature.center + (feature.width ?? 0) / 2 < -9) {
      if (removeFeature === removeMeshFeature) removeFeature(feature, index, group);
      else removeFeature(feature, index);
    }
  }
}

function removeObstacle(feature, index = obstacles.indexOf(feature)) {
  disposeMesh(feature.mesh);
  obstacles.splice(index, 1);
}

function removeGap(feature, index = gaps.indexOf(feature)) {
  disposeMesh(feature.mesh);
  feature.decorations?.forEach(disposeMesh);
  gaps.splice(index, 1);
}

function removeMeshFeature(feature, index, group) {
  disposeMesh(feature.mesh);
  group.splice(index, 1);
}

function disposeMesh(mesh) {
  if (!mesh || !scene) return;
  scene.remove(mesh);
  const disposeMaterial = (material) => {
    material.map?.dispose();
    material.dispose();
  };
  // Feature meshes may be groups (portals, shards, hover and island platforms).
  mesh.traverse?.((child) => {
    child.geometry?.dispose();
    if (Array.isArray(child.material)) child.material.forEach(disposeMaterial);
    else if (child.material) disposeMaterial(child.material);
  });
  if (typeof mesh.traverse !== 'function') {
    mesh.geometry?.dispose();
    if (Array.isArray(mesh.material)) mesh.material.forEach(disposeMaterial);
    else if (mesh.material) disposeMaterial(mesh.material);
  }
}

// A passed checkpoint is a one-way door for the rest of the level: it never un-passes on a
// retry, and a manual restart clears it in reset(). The run keeps moving on the same frame.
function updateCheckpoint() {
  if (checkpointPassed || checkpointDistance === null) return;
  if (distance < checkpointDistance) return;
  checkpointPassed = true;
  message.textContent = 'Checkpoint.';
  gameStatus.textContent = 'Checkpoint.';
}

function triggerPortals() {
  for (const portal of portals) {
    if (portal.triggered || Math.abs(portal.center - player.position.x) > .62) continue;
    portal.triggered = true;
    portal.mesh.visible = false;
    const effects = player.userData.effects;
    // One announcement per portal: the entry is shared by the label, the HUD and the live region.
    const copy = portalLabel(portal.type);
    message.textContent = copy.announcement;
    gameStatus.textContent = copy.announcement;
    portalAnnouncementTime = PORTAL_ANNOUNCEMENT_SECONDS;
    switch (portal.type) {
      case 'spring':
        player.userData.vy = Math.max(player.userData.vy, portalEffects.spring.jumpVelocity);
        player.userData.grounded = false;
        player.userData.coyoteTimer = 0;
        player.userData.jumpBufferTimer = 0;
        break;
      case 'dash':
        effects.dashTimer = portalEffects.dash.duration;
        break;
      case 'float':
        effects.gravityTimer = portalEffects.float.duration;
        break;
      case 'shield':
        effects.shieldCharges = portalEffects.shield.shieldCharges;
        break;
      case 'phase':
        effects.phaseTimer = portalEffects.phase.duration;
        break;
      default:
        console.warn(`Unknown portal type: ${portal.type}`);
    }
  }
}

function handleEnemyCollisions() {
  const effects = player.userData.effects;
  for (let index = enemies.length - 1; index >= 0; index--) {
    const enemy = enemies[index];
    if (Math.abs(enemy.center - player.position.x) >= .8) continue;
    const playerHeight = player.position.y - player.userData.supportY;
    if (enemy.type === 'crawler' && shouldStompEnemy(playerHeight, player.userData.vy)) {
      removeMeshFeature(enemy, index, enemies);
      message.textContent = 'ENEMY STOMPED';
      continue;
    }
    const enemyBottom = enemy.mesh.position.y - enemy.height / 2;
    const enemyTop = enemy.mesh.position.y + enemy.height / 2;
    const playerBottom = player.position.y;
    const playerTop = player.position.y + 1.35;
    const verticalOverlap = playerBottom < enemyTop && playerTop > enemyBottom;
    if (!verticalOverlap) continue;
    if (effects.shieldCharges > 0) {
      effects.shieldCharges--;
      removeMeshFeature(enemy, index, enemies);
      message.textContent = 'SHIELD SAVED YOU';
      continue;
    }
    crash('Enemy hit!');
    return true;
  }
  return false;
}

function handleCollectibleCollisions() {
  for (let index = collectibles.length - 1; index >= 0; index--) {
    const shard = collectibles[index];
    if (!isCollectibleContact(player.position.x, shard.center, player.position.y - laneY, shard.height)) continue;
    removeMeshFeature(shard, index, collectibles);
    collectedCount++;
    updateCollectibleHud();
    message.textContent = `SHARD ${collectedCount} / ${level.collectibles.length}`;
  }
}

function updateCollectibleHud() {
  const total = level.collectibles?.length ?? 0;
  collectibleHud.hidden = total === 0;
  collectibleCountDisplay.textContent = `${String(collectedCount).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
}

function updateProgress(percent) {
  const progressStep = Math.floor(percent / 5) * 5;
  progressFill.style.width = `${percent}%`;
  if (progressTrack.getAttribute('aria-valuenow') !== String(progressStep)) {
    progressTrack.setAttribute('aria-valuenow', String(progressStep));
  }
}

// The chip is decorative feedback for a sighted player: the live region already announces the
// finish, so it stays out of the accessibility tree and only touches the DOM when its text changes.
function updateFinishChip() {
  const remaining = level.length - distance;
  if (remaining > 30) {
    if (!finishChip.hidden) finishChip.hidden = true;
    finishChipLabel = '';
    return;
  }
  const label = remaining < 3 ? '⚑ FINISH!' : `⚑ FINISH ${Math.ceil(remaining)}`;
  if (finishChip.hidden) finishChip.hidden = false;
  if (label === finishChipLabel) return;
  finishChipLabel = label;
  finishChip.textContent = label;
}

// The pill list is rebuilt only when the set of active effects changes. Between rebuilds a bar
// moves at most every 100 ms, and only when its rounded percentage actually changes.
function updateEffectHud(dt) {
  if (!effectHud || !player) return;
  const active = activeEffects(player.userData.effects);
  const signature = active.map((effect) => effect.type).join(',');
  if (signature !== effectHudSignature) {
    effectHudSignature = signature;
    effectHudBarElapsedMs = 0;
    effectPills.clear();
    effectHud.replaceChildren();
    effectHud.hidden = active.length === 0;
    for (const effect of active) {
      const pill = document.createElement('li');
      pill.className = 'effect-pill';
      pill.dataset.effect = effect.type;
      pill.style.setProperty('--effect-color', `#${effect.color.toString(16).padStart(6, '0')}`);
      const name = document.createElement('span');
      name.className = 'effect-pill-name';
      name.textContent = effect.name;
      const track = document.createElement('span');
      track.className = 'effect-pill-track';
      const fill = document.createElement('i');
      fill.className = 'effect-pill-fill';
      const percent = Math.round(effect.ratio * 100);
      fill.style.width = `${percent}%`;
      track.append(fill);
      pill.append(name, track);
      effectHud.append(pill);
      effectPills.set(effect.type, { fill, percent });
    }
    return;
  }
  if (active.length === 0) return;
  effectHudBarElapsedMs += dt * 1000;
  if (effectHudBarElapsedMs < EFFECT_BAR_INTERVAL_MS) return;
  effectHudBarElapsedMs = 0;
  for (const effect of active) {
    const pill = effectPills.get(effect.type);
    if (!pill) continue;
    const percent = Math.round(effect.ratio * 100);
    if (percent === pill.percent) continue;
    pill.percent = percent;
    pill.fill.style.width = `${percent}%`;
  }
}

function disposeEffectAura() {
  if (!effectAura) return;
  scene?.remove(effectAura);
  effectAura.geometry.dispose();
  effectAura.material.dispose();
  effectAura = null;
  effectAuraColor = null;
}

function ensureEffectAura(color) {
  if (effectAura && effectAuraColor === color) return effectAura;
  disposeEffectAura();
  effectAura = new THREE.Mesh(
    new THREE.TorusGeometry(.55, .04, 8, 32),
    new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: .8,
      metalness: .1,
      roughness: .5,
      transparent: true,
      opacity: .5,
      depthWrite: false,
    }),
  );
  effectAura.rotation.x = -Math.PI / 2;
  effectAura.position.set(player.position.x, laneY + .03, 0);
  scene.add(effectAura);
  effectAuraColor = color;
  return effectAura;
}

// The ring sits on the lane, not on the jumping body, and fades with the strongest remaining
// effect. Reduced motion keeps the fade but drops the pulse.
function updateEffectVisuals() {
  const active = activeEffects(player?.userData.effects);
  if (effectHalo) effectHalo.visible = active.some((effect) => effect.type === 'shield');
  if (active.length === 0) {
    disposeEffectAura();
    return;
  }
  const ratio = active.reduce((strongest, effect) => Math.max(strongest, effect.ratio), 0);
  const aura = ensureEffectAura(active[0].color);
  const pulse = reducedMotion ? 0 : Math.sin(simulationTime * 5) * .08;
  aura.material.opacity = Math.min(.95, Math.max(.1, .18 + ratio * .52 + pulse));
  aura.position.x = player.position.x;
}

function updatePortalAnnouncement(dt) {
  if (portalAnnouncementTime <= 0) return;
  portalAnnouncementTime = Math.max(0, portalAnnouncementTime - dt);
  if (portalAnnouncementTime === 0) message.textContent = DEFAULT_RUN_MESSAGE;
}


function spawnObstacles() {
  const profile = getHazardProfile(level.hazardStyle);
  for (const [distanceAlongTrack, count] of level.obstacles) {
    for (let index = 0; index < count; index++) {
      let geometry;
      switch (profile.shape) {
        case 'cylinder':
        case 'stump':
        case 'pipe':
          geometry = new THREE.CylinderGeometry(profile.width * .38, profile.width * .48, profile.height, 7);
          break;
        case 'panel':
        case 'block':
        case 'beam':
        case 'banner':
          geometry = new THREE.BoxGeometry(profile.width, profile.height, profile.shape === 'beam' ? .14 : .72);
          break;
        case 'debris':
        case 'asteroid':
          geometry = new THREE.DodecahedronGeometry(profile.width * .47, 0);
          break;
        case 'gear':
        case 'corona':
          geometry = new THREE.TorusGeometry(profile.width * .35, profile.width * .12, 6, 12);
          break;
        case 'shard':
          geometry = new THREE.OctahedronGeometry(profile.width * .48, 0);
          break;
        case 'cane':
          geometry = new THREE.CylinderGeometry(profile.width * .2, profile.width * .35, profile.height, 7);
          break;
        default:
          geometry = new THREE.ConeGeometry(profile.width * .5, profile.height, profile.shape === 'coral' ? 5 : 4);
          geometry.rotateY(Math.PI / 4);
      }
      const color = GAMEPLAY_COLORS.hazard;
      const material = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: .9,
        metalness: .2,
        roughness: .34,
        flatShading: true,
      });
      const center = distanceAlongTrack - 3 + index * 1.28;
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(center, laneY + (profile.offsetY ?? profile.height / 2), 0);
      if (profile.shape === 'gear' || profile.shape === 'corona') mesh.rotation.x = Math.PI / 2;
      if (profile.shape === 'shard') mesh.scale.y = 1.45;
      scene.add(mesh);
      obstacles.push({ mesh, center, width: profile.width, clearanceHeight: profile.clearanceHeight });
    }
  }
}

function createPortalLabelSprite(type, color) {
  const copy = portalLabel(type);
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 236;
  const context = canvas.getContext('2d');
  const inset = 12;
  const radius = 34;
  const left = inset;
  const top = inset;
  const width = canvas.width - inset * 2;
  const height = canvas.height - inset * 2;
  // Soft, dark backing keeps the two text lines readable over any course scenery.
  context.save();
  context.shadowColor = 'rgba(0,0,0,.6)';
  context.shadowBlur = 20;
  context.fillStyle = 'rgba(7,11,22,.82)';
  context.beginPath();
  context.roundRect(left, top, width, height, radius);
  context.fill();
  context.restore();
  context.lineWidth = 3;
  context.strokeStyle = 'rgba(255,255,255,.16)';
  context.beginPath();
  context.roundRect(left, top, width, height, radius);
  context.stroke();
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
  context.font = '800 130px "Barlow Condensed", "Arial Narrow", sans-serif';
  context.fillText(copy.name, canvas.width / 2, 78);
  context.fillStyle = '#ffffff';
  context.font = '700 80px "DM Sans", "Helvetica Neue", Arial, sans-serif';
  context.fillText(copy.effect, canvas.width / 2, 182);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.anisotropy = Math.min(4, renderer?.capabilities?.getMaxAnisotropy?.() ?? 1);
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false, toneMapped: false });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(3.6, 1.1, 1);
  return sprite;
}

function spawnFinishGate() {
  const gateWidth = 4.2;
  const pillarWidth = .35;
  const pillarHeight = 2.6;
  const group = new THREE.Group();
  group.position.set(finishGateDistance(level) - 3, laneY, 0);
  const whiteMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: .2, roughness: .42 });
  const trimMaterial = new THREE.MeshStandardMaterial({
    color: 0xc8ff52,
    emissive: 0xc8ff52,
    emissiveIntensity: .85,
    metalness: .1,
    roughness: .35,
  });
  const darkMaterial = new THREE.MeshStandardMaterial({ color: 0x141a2a, metalness: .15, roughness: .6 });
  const stripMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const stripDarkMaterial = new THREE.MeshBasicMaterial({ color: 0x0a0f1c });
  for (const side of [-1, 1]) {
    const pillar = new THREE.Mesh(new THREE.BoxGeometry(pillarWidth, pillarHeight, .35), whiteMaterial);
    pillar.position.set(side * (gateWidth / 2 - pillarWidth / 2), pillarHeight / 2, 0);
    const trim = new THREE.Mesh(new THREE.BoxGeometry(.06, pillarHeight - .3, .38), trimMaterial);
    trim.position.set(side * (gateWidth / 2 - pillarWidth), pillarHeight / 2, 0);
    group.add(pillar, trim);
  }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(gateWidth, .22, .35), whiteMaterial);
  beam.position.y = pillarHeight - .11;
  const beamTrim = new THREE.Mesh(new THREE.BoxGeometry(gateWidth, .05, .38), trimMaterial);
  beamTrim.position.y = pillarHeight - .24;
  group.add(beam, beamTrim);
  const bannerSegments = 7;
  const segmentWidth = gateWidth / bannerSegments;
  for (let index = 0; index < bannerSegments; index++) {
    const segment = new THREE.Mesh(
      new THREE.BoxGeometry(segmentWidth - .01, .38, .08),
      index % 2 === 0 ? whiteMaterial : darkMaterial,
    );
    segment.position.set(-gateWidth / 2 + segmentWidth * (index + .5), 2.19, .06);
    group.add(segment);
  }
  const laneSegments = 4;
  const laneSegmentWidth = gateWidth / laneSegments;
  for (let index = 0; index < laneSegments; index++) {
    const segment = new THREE.Mesh(
      new THREE.BoxGeometry(laneSegmentWidth - .01, .035, 1.7),
      index % 2 === 0 ? stripMaterial : stripDarkMaterial,
    );
    segment.position.set(-gateWidth / 2 + laneSegmentWidth * (index + .5), .035, 0);
    group.add(segment);
  }
  scene.add(group);
  finishGates.push({ center: group.position.x, width: gateWidth, mesh: group });
}

function spawnCheckpointFlag(distanceAlongTrack) {
  const near = 0x52eaff;
  const group = new THREE.Group();
  group.position.set(distanceAlongTrack - 3, laneY, 0);
  const whiteMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: .2, roughness: .4 });
  const cyanMaterial = new THREE.MeshStandardMaterial({
    color: near,
    emissive: near,
    emissiveIntensity: .75,
    metalness: .1,
    roughness: .35,
    side: THREE.DoubleSide,
  });
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.045, .055, 2.2, 8), whiteMaterial);
  pole.position.y = 1.1;
  group.add(pole);
  // Two cyan triangles share the pole edge and the tip, forming a pennant.
  const triangle = (points) => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    geometry.computeVertexNormals();
    return new THREE.Mesh(geometry, cyanMaterial);
  };
  const upper = triangle([0, 2.2, .02, .95, 1.95, .02, 0, 1.72, .02]);
  const lower = triangle([0, 1.72, .02, .95, 1.95, .02, 0, 1.44, .02]);
  group.add(upper, lower);
  const strip = new THREE.Mesh(
    new THREE.BoxGeometry(2, .035, 1.5),
    new THREE.MeshBasicMaterial({ color: near }),
  );
  strip.position.y = .035;
  group.add(strip);
  scene.add(group);
  checkpointFlags.push({ center: group.position.x, width: 2, height: 2.2, mesh: group });
}

function spawnCourseFeatures() {
  for (const definition of level.gaps ?? []) {
    const center = definition.at - 3 + definition.width / 2;
    const hole = new THREE.Mesh(
      new THREE.BoxGeometry(definition.width, .06, 2.7),
      new THREE.MeshBasicMaterial({ color: 0x02040b }),
    );
    hole.position.set(center, laneY + .035, 0);
    scene.add(hole);
    const railMaterial = new THREE.MeshBasicMaterial({ color: level.color });
    const rails = [-1.32, 1.32].map((z) => {
      const rail = new THREE.Mesh(new THREE.BoxGeometry(definition.width, .055, .07), railMaterial.clone());
      rail.position.set(center, laneY + .06, z);
      scene.add(rail);
      return rail;
    });
    gaps.push({ center, width: definition.width, mesh: hole, decorations: rails });
  }

  for (const definition of level.platforms ?? []) {
    const center = definition.at - 3 + definition.width / 2;
    const height = definition.height ?? 0;
    const kind = definition.kind ?? 'kerb';
    const material = new THREE.MeshStandardMaterial({
      color: GAMEPLAY_COLORS.platform,
      emissive: GAMEPLAY_COLORS.platform,
      emissiveIntensity: .10,
      metalness: .35,
      roughness: .48,
    });
    let mesh;
    if (kind === 'island') {
      // Six-sided prism: reads as floating rock instead of a box bridge.
      mesh = new THREE.Mesh(new THREE.CylinderGeometry(definition.width / 2, definition.width / 2 * .84, .34, 6), material);
      mesh.position.set(center, laneY + height - .17, -.12);
    } else if (kind === 'hover') {
      mesh = new THREE.Group();
      const slab = new THREE.Mesh(new THREE.BoxGeometry(definition.width, .16, 1.9), material);
      slab.position.y = .06;
      mesh.add(slab);
      for (const side of [-1, 1]) {
        const keel = new THREE.Mesh(new THREE.ConeGeometry(.16, .24, 4), material);
        keel.position.set(side * definition.width * .26, -.20, 0);
        keel.rotation.x = Math.PI;
        mesh.add(keel);
      }
      mesh.position.set(center, laneY + height - .14, -.12);
    } else {
      mesh = new THREE.Mesh(new THREE.BoxGeometry(definition.width, .28, 1.95), material);
      mesh.position.set(center, laneY + height - .14, -.12);
      if (kind === 'shelf') {
        // A low lip marks the long structural run as a shelf rather than a short kerb.
        const lip = new THREE.Mesh(new THREE.BoxGeometry(definition.width - .2, .05, 2.08), material);
        lip.position.y = .155;
        mesh.add(lip);
      }
    }
    scene.add(mesh);
    platforms.push({
      center,
      width: definition.width,
      height,
      currentHeight: height,
      kind,
      bob: kind === 'hover' ? .1 : 0,
      phase: center * .17,
      mesh,
    });
  }

  for (const definition of level.portals ?? []) {
    const center = definition.at - 3;
    const color = GAMEPLAY_COLORS.portal[definition.type] ?? GAMEPLAY_COLORS.portal.dash;
    const group = new THREE.Group();
    group.position.set(center, laneY, 0);
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(.57, .12, 8, 24),
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: .8, metalness: .25, roughness: .26 }),
    );
    ring.position.y = 1.15;
    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(.42, 28),
      new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: .9, side: THREE.DoubleSide, toneMapped: false }),
    );
    disc.position.set(0, 1.15, .03);
    const strip = new THREE.Mesh(
      new THREE.BoxGeometry(.95, .045, 2.3),
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: .65, metalness: .15, roughness: .4 }),
    );
    strip.position.y = .06;
    const label = createPortalLabelSprite(definition.type, color);
    label.position.set(0, 2.4, .04);
    group.add(ring, disc, strip, label);
    scene.add(group);
    portals.push({ center, type: definition.type, triggered: false, mesh: group, spin: ring });
  }

  for (const definition of level.enemies ?? []) {
    const type = definition.type ?? 'crawler';
    const width = type === 'drone' ? .72 : .9;
    const height = type === 'drone' ? .68 : .58;
    const color = GAMEPLAY_COLORS.hazard;
    const geometry = type === 'drone' ? new THREE.OctahedronGeometry(.43, 0) : new THREE.DodecahedronGeometry(.42, 0);
    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: .6, metalness: .18, roughness: .35, flatShading: true }));
    const center = definition.at - 3;
    const perch = (level.platforms ?? []).find((platform) => (
      platform.kind === 'perch'
      && Math.abs(platform.at + platform.width / 2 - definition.at) < .01
    ));
    const altitude = type === 'drone'
      ? definition.height ?? 1.12
      : (perch?.height ?? 0) + .29;
    mesh.position.set(center, laneY + altitude, -.05);
    scene.add(mesh);
    enemies.push({ center, type, width, height, baseY: mesh.position.y, phase: center * .11, mesh });
  }

  for (const definition of level.collectibles ?? []) {
    const center = definition.at - 3;
    const height = definition.height ?? 1.7;
    const group = new THREE.Group();
    group.position.set(center, laneY + height, -.02);
    const crystal = new THREE.Mesh(
      new THREE.OctahedronGeometry(.38, 0),
      new THREE.MeshStandardMaterial({
        color: GAMEPLAY_COLORS.shard,
        emissive: GAMEPLAY_COLORS.shard,
        emissiveIntensity: .95,
        metalness: .4,
        roughness: .2,
      }),
    );
    crystal.scale.y = 1.35;
    group.add(crystal);
    scene.add(group);
    collectibles.push({ center, height, mesh: group });
  }
  spawnFinishGate();
  checkpointDistance = safeCheckpointDistance(level);
  if (checkpointDistance !== null) spawnCheckpointFlag(checkpointDistance);
  updateCollectibleHud();
}

// Rebuild the world for a retry that starts at the checkpoint: every feature is shifted back
// by the resumed distance, anything at or behind the player is removed, and the runner is put
// back on the lane with a clean effect state. The finish gate keeps triggering at level.length
// because distance starts at attemptStart and advances from there.
function resumeCourseFromCheckpoint() {
  const shift = attemptStart;
  if (!(shift > 0)) return;
  const drop = (feature, index, group) => {
    if (group === obstacles) removeObstacle(feature, index);
    else if (group === gaps) removeGap(feature, index);
    else removeMeshFeature(feature, index, group);
  };
  const shiftGroup = (group) => {
    for (let index = group.length - 1; index >= 0; index--) {
      const feature = group[index];
      feature.mesh.position.x -= shift;
      feature.center = feature.mesh.position.x;
      if (feature.decorations) {
        for (const decoration of feature.decorations) decoration.position.x = feature.center;
      }
      if (feature.center <= player.position.x + 1e-6) drop(feature, index, group);
    }
  };
  for (const group of [obstacles, gaps, platforms, portals, enemies, collectibles, finishGates, checkpointFlags]) {
    shiftGroup(group);
  }
  distance = shift;
  runBestDistance = shift;
  updateProgress(levelProgressPercent(distance, level.length));
  updateFinishChip();
  player.position.set(-3, laneY, 0);
  player.userData.vy = 0;
  player.userData.grounded = true;
  player.userData.coyoteTimer = 0;
  player.userData.jumpBufferTimer = 0;
  player.userData.supportY = laneY;
  player.userData.effects = { dashTimer: 0, gravityTimer: 0, shieldCharges: 0, phaseTimer: 0 };
  updateEffectHud(0);
  updateEffectVisuals();
}

function renderScenery() {
  if (!sceneryGroup) return;
  for (const part of [...sceneryGroup.children]) {
    sceneryGroup.remove(part);
    part.geometry?.dispose();
    if (Array.isArray(part.material)) part.material.forEach((material) => material.dispose());
    else part.material?.dispose();
  }
  const environment = level.environment ?? 'skyline';
  const accent = new THREE.MeshBasicMaterial({ color: level.color });
  const muted = new THREE.MeshBasicMaterial({ color: level.floor });
  const addPart = (geometry, material, x, y, z = -5.2) => {
    const mesh = new THREE.Mesh(geometry, material.clone());
    mesh.position.set(x, y, z);
    sceneryGroup.add(mesh);
    return mesh;
  };
  for (let index = 0; index < 13; index++) {
    const x = -15 + index * 3.2;
    const height = 1.8 + ((index * 37) % 6) * .48;
    const isFar = index % 2 === 0;
    const groundY = laneY;
    const groveEnvironments = ['gravity-garden', 'mosslight-hollow', 'clockwork-orchard', 'verdant-greenhouse'];
    const crystalEnvironments = ['crystal-cavern', 'shatterglass'];
    const foundryEnvironments = ['tidal-foundry', 'magnetar-forge'];
    if (groveEnvironments.includes(environment)) {
      addPart(new THREE.CylinderGeometry(.12, .25, height * .55, 5), muted, x, groundY + height * .275);
      addPart(new THREE.SphereGeometry(.68 + (index % 3) * .12, 7, 6), accent, x, groundY + height * .72);
      if (environment === 'clockwork-orchard' && index % 3 === 0) {
        const gear = addPart(new THREE.TorusGeometry(.3, .055, 5, 10), accent, x + .4, groundY + height * .5);
        gear.rotation.y = .55;
      }
    } else if (environment === 'solar-desert') {
      addPart(new THREE.ConeGeometry(.9 + (index % 3) * .2, height * .45, 5), muted, x, groundY + height * .22);
      const panel = addPart(new THREE.BoxGeometry(1.55, .12, .72), index % 2 ? accent : muted, x, groundY + height * .68);
      panel.rotation.z = index % 2 ? -.18 : .18;
      if (index % 4 === 0) addPart(new THREE.SphereGeometry(.42, 8, 6), accent, x + .7, groundY + height * .95);
    } else if (['storm-coast'].includes(environment)) {
      addPart(new THREE.ConeGeometry(.82 + (index % 3) * .2, height, 5), muted, x, groundY + height / 2);
      if (index % 2 === 0) addPart(new THREE.BoxGeometry(.08, height * .42, .08), accent, x + .2, groundY + height * .68, -4.85);
    } else if (crystalEnvironments.includes(environment)) {
      const crystal = addPart(new THREE.OctahedronGeometry(.55 + (index % 3) * .12, 0), index % 2 ? accent : muted, x, groundY + height * .48);
      crystal.scale.y = 1.5 + (index % 2) * .5;
      crystal.rotation.z = index % 2 ? .25 : -.18;
      if (environment === 'shatterglass' && index % 2 === 0) addPart(new THREE.OctahedronGeometry(.28, 0), accent, x + .55, groundY + height * .62);
    } else if (environment === 'aqua-reef') {
      addPart(new THREE.DodecahedronGeometry(.55 + (index % 3) * .13, 0), index % 2 ? accent : muted, x, groundY + height * .38);
      if (index % 2 === 0) addPart(new THREE.ConeGeometry(.32, .9, 5), accent, x + .45, groundY + height * .7);
      addPart(new THREE.SphereGeometry(.12, 6, 5), accent, x - .25, groundY + height * .98, -4.8);
    } else if (['orbital-shipyard', 'eclipse-observatory'].includes(environment)) {
      const orb = addPart(new THREE.SphereGeometry(.48 + (index % 3) * .18, 10, 8), muted, x, groundY + height * .62);
      orb.scale.y = .7;
      if (index % 3 === 0 || environment === 'eclipse-observatory') {
        const ring = addPart(new THREE.TorusGeometry(.78, .035, 4, 18), accent, x, orb.position.y, -5.05);
        ring.rotation.x = .8;
        ring.rotation.y = .3;
      }
    } else if (environment === 'candy-comet') {
      addPart(new THREE.CylinderGeometry(.1, .12, height * .7, 7), muted, x, groundY + height * .35);
      addPart(new THREE.SphereGeometry(.45 + (index % 2) * .16, 9, 7), accent, x, groundY + height * .77);
      if (index % 2 === 0) addPart(new THREE.TorusGeometry(.45, .06, 4, 12), muted, x, groundY + height * .77);
    } else if (environment === 'cloudbreaker') {
      const cloud = addPart(new THREE.SphereGeometry(.8 + (index % 2) * .2, 8, 6), index % 2 ? accent : muted, x, groundY + height * .7);
      cloud.scale.set(1.45, .7, .65);
    } else if (foundryEnvironments.includes(environment)) {
      addPart(new THREE.CylinderGeometry(.42, .62, height, 6), muted, x, groundY + height / 2);
      addPart(new THREE.TorusGeometry(.44, .08, 5, 12), accent, x, groundY + height * .78);
      if (environment === 'magnetar-forge') {
        const ring = addPart(new THREE.TorusGeometry(.72, .04, 4, 16), accent, x, groundY + height * .56);
        ring.rotation.y = .75;
      }
    } else if (environment === 'paper-moon') {
      const folded = addPart(new THREE.ConeGeometry(.72, height * .75, 4), index % 2 ? accent : muted, x, groundY + height * .38);
      folded.rotation.z = index % 2 ? .22 : -.22;
      addPart(new THREE.OctahedronGeometry(.22, 0), accent, x + .48, groundY + height * .78);
    } else if (environment === 'pixel-pier') {
      addPart(new THREE.BoxGeometry(1.2, height * .65, .65), muted, x, groundY + height * .325);
      addPart(new THREE.BoxGeometry(.7, .38, .68), accent, x, groundY + height * .72);
    } else if (environment === 'midnight-circuit') {
      const tower = addPart(new THREE.BoxGeometry(1.35, height, .5), muted, x, groundY + height / 2);
      tower.rotation.y = index % 2 ? .08 : -.08;
      for (let band = 0; band < 3; band++) addPart(new THREE.BoxGeometry(1.38, .035, .56), accent, x, groundY + .45 + band * .52, -4.92);
    } else {
      const tower = addPart(new THREE.BoxGeometry(1.35, height, .5), isFar ? muted : accent, x, groundY + height / 2);
      for (let windowIndex = 0; windowIndex < 3; windowIndex++) {
        addPart(new THREE.BoxGeometry(.07, .16, .04), index % 3 ? accent : muted, x - .32 + windowIndex * .32, groundY + height / 2 + .18, -4.93);
      }
      tower.rotation.y = (index % 2 ? .08 : -.08);
    }
  }
  accent.dispose();
  muted.dispose();
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
  renderScenery();
  renderScene();
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
  collectedCount = 0;
  updateCollectibleHud();
  updateProgress(0);
  updateTheme();
  showOverlay(`${level.name} is ready.`, 'Tap/click or press Space, ↑, or W to jump. Press P to pause.');
  document.querySelectorAll('.level-card').forEach((card, cardIndex) => {
    const selected = cardIndex === selectedLevelIndex;
    card.classList.toggle('selected', selected);
    card.setAttribute('aria-pressed', String(selected));
  });
}

async function start() {
  if (graphicsUnavailable) return false;
  if (running) return true;
  const resuming = isGamePaused({ started, running, dead, completed });
  if (dead || completed) reset({ keepAttempt: true });
  primeOneShot(lossCue);
  if (musicEnabled) musicEngine.start(level.music).catch((error) => console.warn('Music could not start.', error));
  const ready = await ensureScene();
  if (!ready || graphicsUnavailable) {
    void musicEngine.stop();
    return false;
  }
  if (running) return true;
  const initializeCourse = shouldSpawnCourseFeatures(started);
  started = true;
  running = true;
  gameWrap.classList.remove('is-paused');
  overlay.hidden = true;
  stage.focus({ preventScroll: true });
  gameStatus.textContent = resuming ? 'Game resumed.' : `${level.name} started.`;
  message.textContent = DEFAULT_RUN_MESSAGE;
  playButton.innerHTML = '<span class="play-icon" aria-hidden="true">↻</span> RESTART LEVEL';
  if (initializeCourse) {
    spawnObstacles();
    spawnCourseFeatures();
    if (attemptStart > 0) resumeCourseFromCheckpoint();
  }
  // A tap that starts a run must never be spent as a jump: with the composed courses an
  // unavoidable jump at distance 0 lands the player straight into the first gap.
  startRenderLoop();
  syncPauseButton();
  return true;
}

function syncPauseButton() {
  const canPause = started && !dead && !completed && !graphicsUnavailable;
  const resume = canPause && !running;
  pauseButton.disabled = !canPause;
  pauseButton.textContent = resume ? 'RESUME' : 'PAUSE';
  pauseButton.setAttribute('aria-label', resume ? 'Resume game' : 'Pause game');
}

function pauseGame() {
  if (!running) return false;
  running = false;
  gameWrap.classList.add('is-paused');
  if (player) player.userData.jumpBufferTimer = 0;
  stopRenderLoop();
  showOverlay('Paused.', 'Select Resume, tap the playfield, or press P/Space to continue. Your run is frozen.');
  message.textContent = 'GAME PAUSED · PRESS P, SPACE OR RESUME';
  gameStatus.textContent = 'Game paused.';
  void musicEngine.stop();
  syncPauseButton();
  return true;
}

function togglePause() {
  if (running) {
    pauseGame();
    return;
  }
  if (isGamePaused({ started, running, dead, completed })) void start();
}

function consumeBufferedJump() {
  const { grounded, coyoteTimer, jumpBufferTimer } = player.userData;
  if (!canConsumeJumpBuffer(grounded, coyoteTimer, jumpBufferTimer)) return false;
  player.userData.vy = jumpTuning.initialVelocity;
  player.userData.grounded = false;
  player.userData.coyoteTimer = 0;
  player.userData.jumpBufferTimer = 0;
  return true;
}

function jump() {
  if (graphicsUnavailable) return;
  if (dead || completed) reset({ keepAttempt: true });
  if (!sceneStarted || !running) {
    void start();
    return;
  }
  player.userData.jumpBufferTimer = jumpTuning.inputBufferSeconds;
  consumeBufferedJump();
}

function crash(reason = 'Tap or press Space to try this level again.') {
  running = false;
  dead = true;
  attempt++;
  attemptDisplay.textContent = String(attempt).padStart(2, '0');
  attemptStart = checkpointPassed && checkpointDistance !== null ? checkpointDistance : 0;
  recordRunEnd(false);
  const fromCheckpoint = attemptStart > 0;
  const overlayReason = fromCheckpoint ? 'One more try — from the checkpoint.' : reason;
  showOverlay('One more try.', overlayReason);
  message.textContent = fromCheckpoint ? 'RUN ENDED — RETRY FROM THE CHECKPOINT' : 'RUN ENDED — TRY AGAIN';
  gameStatus.textContent = fromCheckpoint ? `Run ended. ${overlayReason}` : `Run ended. ${reason}`;
  syncPauseButton();
  void playOneShot(lossCue);
  void musicEngine.stop();
}

function finish() {
  running = false;
  completed = true;
  distance = level.length;
  runBestDistance = level.length;
  updateProgress(100);
  recordRunEnd(true);
  const totalShards = level.collectibles.length;
  const shardSummary = totalShards ? ` You found ${collectedCount} of ${totalShards} shards.` : '';
  showOverlay(`${level.name} cleared!`, `Course ${selectedLevelIndex + 1} of ${levels.length} complete.${shardSummary}`, selectedLevelIndex < levels.length - 1);
  message.textContent = totalShards ? `LEVEL COMPLETE · SHARDS ${collectedCount}/${totalShards}` : 'LEVEL COMPLETE';
  gameStatus.textContent = `${level.name} complete.`;
  syncPauseButton();
  void musicEngine.stop();
}

// A retry after a crash keeps the pending attempt start (and the passed flag) so it can
// rebuild at the checkpoint; selecting a course, or pressing the Play button, clears both and
// always starts from zero.
function reset({ keepAttempt = false } = {}) {
  stopRenderLoop();
  stopOneShot(lossCue);
  gameWrap.classList.remove('is-paused');
  dead = false;
  completed = false;
  started = false;
  running = false;
  simulationTime = 0;
  distance = 0;
  runBestDistance = 0;
  runRecorded = false;
  attempt = 1;
  if (!keepAttempt) {
    attemptStart = 0;
    checkpointPassed = false;
  }
  checkpointDistance = null;
  if (player) {
    player.position.set(-3, laneY, 0);
    player.userData.vy = 0;
    player.userData.grounded = true;
    player.userData.coyoteTimer = 0;
    player.userData.jumpBufferTimer = 0;
    player.userData.supportY = laneY;
    player.userData.effects = { dashTimer: 0, gravityTimer: 0, shieldCharges: 0, phaseTimer: 0 };
  }
  updateEffectHud(0);
  updateEffectVisuals();
  while (obstacles.length) removeObstacle(obstacles[obstacles.length - 1]);
  while (gaps.length) removeGap(gaps[gaps.length - 1]);
  while (platforms.length) removeMeshFeature(platforms[platforms.length - 1], platforms.length - 1, platforms);
  while (portals.length) removeMeshFeature(portals[portals.length - 1], portals.length - 1, portals);
  while (enemies.length) removeMeshFeature(enemies[enemies.length - 1], enemies.length - 1, enemies);
  while (collectibles.length) removeMeshFeature(collectibles[collectibles.length - 1], collectibles.length - 1, collectibles);
  while (finishGates.length) removeMeshFeature(finishGates[finishGates.length - 1], finishGates.length - 1, finishGates);
  while (checkpointFlags.length) removeMeshFeature(checkpointFlags[checkpointFlags.length - 1], checkpointFlags.length - 1, checkpointFlags);
  collectedCount = 0;
  updateCollectibleHud();
  if (finishChip) finishChip.hidden = true;
  finishChipLabel = '';
  portalAnnouncementTime = 0;
  attemptDisplay.textContent = '01';
  updateProgress(0);
  message.textContent = 'TAP / CLICK / SPACE TO JUMP';
  playButton.innerHTML = '<span class="play-icon" aria-hidden="true">▶</span> PLAY LEVEL';
  playButton.disabled = graphicsUnavailable;
  showOverlay(`${level.name} is ready.`, 'Tap/click or press Space, ↑, or W to jump. Press P to pause.');
  syncPauseButton();
  renderScene();
  void musicEngine.stop();
}

// A run ends exactly once: crash() and finish() each funnel into here. Staying out of the render
// loop keeps storage writes to one per run end and leaves pause untouched.
function recordRunEnd(cleared) {
  if (runRecorded) return;
  runRecorded = true;
  const reached = level.length > 0 ? Math.min(1, runBestDistance / level.length) : 0;
  progress = mergeRunProgress(progress, level.id, {
    reached,
    shards: collectedCount,
    cleared,
    usedCheckpoint: attemptStart > 0,
  });
  const clearedIds = Object.entries(progress.courses)
    .filter(([id, entry]) => entry.cleared && levels.some((item) => item.id === id))
    .map(([id]) => id);
  try {
    localStorage.setItem(progressKey, JSON.stringify(progress));
    localStorage.setItem(completionKey, JSON.stringify(clearedIds));
  } catch { /* Progress remains available for this session. */ }
  renderLevelCards();
}

function renderLevelCards() {
  const list = document.querySelector('#level-list');
  list.replaceChildren();
  levels.forEach((item, index) => {
    const entry = progress.courses[item.id];
    const totalShards = item.collectibles?.length ?? 0;
    const best = Number.isFinite(entry?.best) ? entry.best : 0;
    const shards = Number.isFinite(entry?.shards) ? entry.shards : 0;
    const medal = courseMedal(entry, item);
    const percent = Math.round(best * 100);
    const button = document.createElement('button');
    button.className = `level-card${index === selectedLevelIndex ? ' selected' : ''}${entry?.cleared ? ' completed' : ''}`;
    button.type = 'button';
    button.setAttribute('aria-pressed', String(index === selectedLevelIndex));
    const details = [];
    if (percent > 0) details.push(`best ${percent} percent`);
    if (totalShards > 0) details.push(`${shards} of ${totalShards} shards`);
    if (medal) details.push(`${medal} medal`);
    button.setAttribute('aria-label', `Play level ${index + 1}: ${item.name}${details.length ? `, ${details.join(', ')}` : ''}`);
    const number = document.createElement('span');
    number.className = 'level-number';
    number.textContent = `LEVEL ${String(index + 1).padStart(2, '0')}`;
    const title = document.createElement('span');
    title.className = 'level-card-title';
    title.textContent = item.name;
    const zone = document.createElement('span');
    zone.className = 'level-card-zone';
    zone.textContent = item.zone;
    // Card footer: a thin <span class="level-card-progress" role="presentation"> bar with an
    // aria-hidden percent, then <span class="level-card-shards">◆ n/total</span> and the medal dot.
    const stats = document.createElement('span');
    stats.className = 'level-card-stats';
    const bar = document.createElement('span');
    bar.className = 'level-card-progress';
    bar.setAttribute('role', 'presentation');
    const fill = document.createElement('i');
    fill.style.width = `${best * 100}%`;
    bar.append(fill);
    const percentLabel = document.createElement('span');
    percentLabel.className = 'level-card-percent';
    percentLabel.textContent = `${percent}%`;
    percentLabel.setAttribute('aria-hidden', 'true');
    stats.append(bar);
    // An untouched course shows the shard pips and an empty bar; a "0%" label on all twenty cards
    // is noise, and the accessible name already omits a zero best.
    if (percent > 0) stats.append(percentLabel);
    if (totalShards > 0) {
      const pips = document.createElement('span');
      pips.className = 'level-card-shards';
      pips.textContent = `◆ ${shards}/${totalShards}`;
      stats.append(pips);
    }
    if (medal) {
      const dot = document.createElement('span');
      dot.className = `level-card-medal ${medal}`;
      dot.setAttribute('aria-hidden', 'true');
      stats.append(dot);
    }
    button.append(number, title, zone, stats);
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
  musicButton.setAttribute('aria-pressed', String(musicEnabled));
  if (musicEnabled && running) musicEngine.start(level.music).catch((error) => console.warn('Music could not start.', error));
  else if (!musicEnabled) void musicEngine.stop();
}

playButton.addEventListener('click', () => {
  if (started || running || dead || completed) reset();
  void start();
});
pauseButton.addEventListener('click', togglePause);
gameWrap.addEventListener('pointerdown', (event) => {
  if (event.target.closest('button, a, input, select, textarea')) return;
  event.preventDefault();
  jump();
});
document.addEventListener('keydown', (event) => {
  const interactiveTarget = event.target instanceof Element
    && event.target.closest('button, a, input, select, textarea, [contenteditable="true"]');
  const gameFocused = gameWrap.contains(document.activeElement);
  if (event.key === 'Escape' && pseudoFullscreen) {
    pseudoFullscreen = false;
    syncFullscreenUI();
    return;
  }
  if (event.code === 'KeyP') {
    if (interactiveTarget || (!running && !gameFocused)) return;
    event.preventDefault();
    if (!event.repeat) togglePause();
    return;
  }
  if (!shouldHandleGameplayKey({
    code: event.code,
    repeat: event.repeat,
    running,
    gameFocused,
    interactiveTarget,
  })) return;
  event.preventDefault();
  if (!shouldAcceptJumpInput(event.repeat)) return;
  if (isGamePaused({ started, running, dead, completed })) {
    void start();
    return;
  }
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
if (import.meta.env.DEV) {
  window.__enriqueDashDebug = () => ({
    levelId: level.id,
    distance,
    running,
    paused: isGamePaused({ started, running, dead, completed }),
    dead,
    started,
    simulationTime,
    renderLoopActive: raf != null,
    featureCounts: {
      obstacles: obstacles.length,
      gaps: gaps.length,
      platforms: platforms.length,
      portals: portals.length,
      enemies: enemies.length,
      collectibles: collectibles.length,
      finishGates: finishGates.length,
      checkpointFlags: checkpointFlags.length,
    },
    checkpoint: {
      distance: checkpointDistance,
      passed: checkpointPassed,
      attemptStart,
    },
    featureCenters: {
      obstacles: obstacles.map(({ center }) => center),
      gaps: gaps.map(({ center, width }) => ({ center, width })),
      platforms: platforms.map(({ center, width }) => ({ center, width })),
      portals: portals.map(({ center }) => center),
      enemies: enemies.map(({ center }) => center),
      collectibles: collectibles.map(({ center }) => center),
      finishGates: finishGates.map(({ center }) => center),
      checkpointFlags: checkpointFlags.map(({ center }) => center),
    },
    playerX: player?.position.x ?? null,
    playerY: player?.position.y ?? null,
    verticalVelocity: player?.userData.vy ?? null,
    jumpBufferTimer: player?.userData.jumpBufferTimer ?? null,
    coyoteTimer: player?.userData.coyoteTimer ?? null,
    grounded: player?.userData.grounded ?? false,
    supportY: player?.userData.supportY ?? null,
    lossCue: lossCue ? { src: lossCue.currentSrc || lossCue.src, paused: lossCue.paused, currentTime: lossCue.currentTime, readyState: lossCue.readyState } : null,
    music: {
      state: musicEngine.context?.state ?? null,
      desired: musicEngine.desired,
      timerActive: musicEngine.timer !== null,
      step: musicEngine.step,
    },
  });
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (running) pauseGame();
    else stopRenderLoop();
    stopOneShot(lossCue);
    return;
  }
  if ((dead || completed) && !graphicsUnavailable) startRenderLoop();
});
document.querySelector('#version-label').textContent = `v${packageInfo.version}`;
document.querySelector('#footer-version').textContent = `VERSION ${packageInfo.version}`;
document.querySelector('#game-version').textContent = `v${packageInfo.version}`;
musicButton.setAttribute('aria-pressed', String(musicEnabled));
syncPauseButton();
renderLevelCards();
if (levelValidationError) {
  showOverlay('Course data error', levelValidationError.message);
  playButton.disabled = true;
}
window.addEventListener('pagehide', (event) => {
  if (running) pauseGame();
  else stopRenderLoop();
  stopOneShot(lossCue);
  if (!event.persisted) {
    resizeObserver?.disconnect();
    renderer?.dispose();
    atlasTexture?.dispose();
  }
  void musicEngine.stop();
});
