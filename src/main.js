let THREE;
import packageInfo from '../package.json';
import { getLevel, levelValidationError, levels } from './levels.js';
import { createLossCue, playOneShot, primeOneShot, stopOneShot } from './audio-cues.js';
import { canConsumeJumpBuffer, getHazardProfile, isCollectibleContact, isGamePaused, isObstacleCollision, jumpTuning, levelProgressPercent, mergeJumpRequest, portalEffects, shouldAcceptJumpInput, shouldApplyBufferedStartJump, shouldHandleGameplayKey, shouldSpawnCourseFeatures, shouldStompEnemy, stepPlayerMotion } from './game-logic.js';
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
const message = document.querySelector('#game-message');
const gameStatus = document.querySelector('#game-status');
const levelName = document.querySelector('#level-name');
const fullscreenButton = document.querySelector('#fullscreen-toggle');
const musicButton = document.querySelector('#music-toggle');
const laneY = -1.7;
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const musicEngine = new MusicEngine();
const lossCue = typeof Audio === 'function' ? createLossCue(import.meta.env.BASE_URL, Audio) : null;
let selectedLevelIndex = 0;
let level = levels[selectedLevelIndex];
let renderer, scene, camera, player, playerSprite, spriteMaterial, atlasTexture, spriteMap, clock, raf, resizeObserver;
let sceneStarted = false;
let scenePromise = null;
let floor, floorMaterial, trackEdgeMaterial, sceneryGroup;
let running = false, started = false, dead = false, completed = false, distance = 0, attempt = 1;
let simulationTime = 0, graphicsUnavailable = false, pendingStartJump = false;
let musicEnabled = true, pseudoFullscreen = false, activeAnimation = '', animationTime = 0;
const obstacles = [];
const gaps = [];
const platforms = [];
const portals = [];
const enemies = [];
const collectibles = [];
let collectedCount = 0;
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

  moveFeatureGroup(obstacles, dt, speed, removeObstacle);
  moveFeatureGroup(gaps, dt, speed, removeGap);
  moveFeatureGroup(platforms, dt, speed, removeMeshFeature);
  moveFeatureGroup(portals, dt, speed, removeMeshFeature);
  moveFeatureGroup(enemies, dt, speed, removeMeshFeature);
  moveFeatureGroup(collectibles, dt, speed, removeMeshFeature);
  triggerPortals();
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
    if (!reducedMotion && group === portals) feature.mesh.rotation.z += dt * 1.2;
    if (!reducedMotion && group === collectibles) {
      feature.mesh.rotation.x += dt * 1.8;
      feature.mesh.rotation.y += dt * 2.2;
    }
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
  mesh.geometry?.dispose();
  if (Array.isArray(mesh.material)) mesh.material.forEach((material) => material.dispose());
  else mesh.material?.dispose();
}

function triggerPortals() {
  for (const portal of portals) {
    if (portal.triggered || Math.abs(portal.center - player.position.x) > .62) continue;
    portal.triggered = true;
    portal.mesh.visible = false;
    const effects = player.userData.effects;
    switch (portal.type) {
      case 'spring':
        player.userData.vy = Math.max(player.userData.vy, portalEffects.spring.jumpVelocity);
        player.userData.grounded = false;
        player.userData.coyoteTimer = 0;
        player.userData.jumpBufferTimer = 0;
        message.textContent = 'SPRING PORTAL';
        break;
      case 'dash':
        effects.dashTimer = portalEffects.dash.duration;
        message.textContent = 'DASH BOOST';
        break;
      case 'float':
        effects.gravityTimer = portalEffects.float.duration;
        message.textContent = 'LOW GRAVITY';
        break;
      case 'shield':
        effects.shieldCharges = portalEffects.shield.shieldCharges;
        message.textContent = 'SHIELD READY';
        break;
      case 'phase':
        effects.phaseTimer = portalEffects.phase.duration;
        message.textContent = 'PHASE ON';
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


// Hazards must read as danger, not as scenery. The course palette is used for platforms, shards
// and portals, so a hazard painted in the same hue disappears into the level. Warm courses get an
// amber warning colour, everything else a crimson one; both are far from the level accent.
const hazardDangerColors = Object.freeze({ warm: 0xffc23b, cool: 0xff3b57 });

function hazardColor(levelColor) {
  const color = new THREE.Color(levelColor);
  const hsl = { h: 0, s: 0, l: 0 };
  color.getHSL(hsl);
  const warm = hsl.h < .09 || hsl.h > .92;
  return hazardDangerColors[warm ? 'warm' : 'cool'];
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
      const color = level.hazardColor ?? hazardColor(level.color);
      const material = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: .35, metalness: .16, roughness: .4 });
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
    const material = new THREE.MeshStandardMaterial({ color: definition.color ?? level.color, emissive: definition.color ?? level.color, emissiveIntensity: .25, metalness: .22, roughness: .42 });
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(definition.width, .28, 1.95), material);
    mesh.position.set(center, laneY + height - .14, -.12);
    scene.add(mesh);
    platforms.push({ center, width: definition.width, height, currentHeight: height, kind: definition.kind ?? 'bridge', bob: definition.kind === 'hover' ? .1 : 0, phase: center * .17, mesh });
  }

  const portalColors = { spring: 0xffb54f, dash: 0x52eaff, float: 0xb884ff, shield: 0x6c9dff, phase: 0xff6fe0 };
  for (const definition of level.portals ?? []) {
    const center = definition.at - 3;
    const color = portalColors[definition.type] ?? level.color;
    const mesh = new THREE.Mesh(
      new THREE.TorusGeometry(.57, .12, 8, 24),
      new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: .7, metalness: .2, roughness: .28 }),
    );
    mesh.position.set(center, laneY + 1.15, .08);
    scene.add(mesh);
    portals.push({ center, type: definition.type, triggered: false, mesh });
  }

  for (const definition of level.enemies ?? []) {
    const type = definition.type ?? 'crawler';
    const width = type === 'drone' ? .72 : .9;
    const height = type === 'drone' ? .68 : .58;
    const color = type === 'drone' ? 0xff6ce5 : 0xff5274;
    const geometry = type === 'drone' ? new THREE.OctahedronGeometry(.43, 0) : new THREE.DodecahedronGeometry(.42, 0);
    const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: .46, metalness: .18, roughness: .35 }));
    const center = definition.at - 3;
    const altitude = type === 'drone' ? definition.height ?? 1.12 : .29;
    mesh.position.set(center, laneY + altitude, -.05);
    scene.add(mesh);
    enemies.push({ center, type, width, height, baseY: mesh.position.y, phase: center * .11, mesh });
  }

  for (const definition of level.collectibles ?? []) {
    const center = definition.at - 3;
    const height = definition.height ?? 1.7;
    const mesh = new THREE.Mesh(
      new THREE.OctahedronGeometry(.3, 0),
      new THREE.MeshStandardMaterial({ color: level.color, emissive: level.color, emissiveIntensity: .8, metalness: .35, roughness: .2 }),
    );
    mesh.position.set(center, laneY + height, -.02);
    scene.add(mesh);
    collectibles.push({ center, height, mesh });
  }
  updateCollectibleHud();
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

async function start({ jumpAfterLoad = false } = {}) {
  if (graphicsUnavailable) return false;
  if (running) return true;
  const resuming = isGamePaused({ started, running, dead, completed });
  if (dead || completed) reset();
  pendingStartJump = mergeJumpRequest(pendingStartJump, jumpAfterLoad);
  primeOneShot(lossCue);
  if (musicEnabled) musicEngine.start(level.music).catch((error) => console.warn('Music could not start.', error));
  const ready = await ensureScene();
  if (!ready || graphicsUnavailable) {
    pendingStartJump = false;
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
  message.textContent = 'TAP / CLICK / SPACE TO JUMP · P TO PAUSE';
  playButton.innerHTML = '<span class="play-icon" aria-hidden="true">↻</span> RESTART LEVEL';
  if (initializeCourse) {
    spawnObstacles();
    spawnCourseFeatures();
  }
  if (shouldApplyBufferedStartJump(pendingStartJump, player.userData.grounded)) {
    player.userData.vy = jumpTuning.initialVelocity;
    player.userData.grounded = false;
    player.userData.coyoteTimer = 0;
    player.userData.jumpBufferTimer = 0;
  }
  pendingStartJump = false;
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
  if (dead || completed) reset();
  if (!sceneStarted || !running) {
    void start({ jumpAfterLoad: !started });
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
  showOverlay('One more try.', reason);
  message.textContent = 'RUN ENDED — TRY AGAIN';
  gameStatus.textContent = `Run ended. ${reason}`;
  syncPauseButton();
  void playOneShot(lossCue);
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
  const totalShards = level.collectibles.length;
  const shardSummary = totalShards ? ` You found ${collectedCount} of ${totalShards} shards.` : '';
  showOverlay(`${level.name} cleared!`, `Course ${selectedLevelIndex + 1} of ${levels.length} complete.${shardSummary}`, selectedLevelIndex < levels.length - 1);
  message.textContent = totalShards ? `LEVEL COMPLETE · SHARDS ${collectedCount}/${totalShards}` : 'LEVEL COMPLETE';
  gameStatus.textContent = `${level.name} complete.`;
  syncPauseButton();
  void musicEngine.stop();
}

function reset() {
  stopRenderLoop();
  stopOneShot(lossCue);
  gameWrap.classList.remove('is-paused');
  dead = false;
  completed = false;
  started = false;
  running = false;
  pendingStartJump = false;
  simulationTime = 0;
  distance = 0;
  attempt = 1;
  if (player) {
    player.position.set(-3, laneY, 0);
    player.userData.vy = 0;
    player.userData.grounded = true;
    player.userData.coyoteTimer = 0;
    player.userData.jumpBufferTimer = 0;
    player.userData.supportY = laneY;
    player.userData.effects = { dashTimer: 0, gravityTimer: 0, shieldCharges: 0, phaseTimer: 0 };
  }
  while (obstacles.length) removeObstacle(obstacles[obstacles.length - 1]);
  while (gaps.length) removeGap(gaps[gaps.length - 1]);
  while (platforms.length) removeMeshFeature(platforms[platforms.length - 1], platforms.length - 1, platforms);
  while (portals.length) removeMeshFeature(portals[portals.length - 1], portals.length - 1, portals);
  while (enemies.length) removeMeshFeature(enemies[enemies.length - 1], enemies.length - 1, enemies);
  while (collectibles.length) removeMeshFeature(collectibles[collectibles.length - 1], collectibles.length - 1, collectibles);
  collectedCount = 0;
  updateCollectibleHud();
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
    },
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
