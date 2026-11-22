import * as THREE from 'three';
import packageInfo from '../package.json';
import './style.css';

const levels = [
  { name: 'Neon Run', zone: 'THE FIRST STEP', color: 0xc8ff52, speed: 8.2, length: 78, obstacles: [[13, 1], [23, 2], [35, 1], [46, 2], [58, 1], [69, 2]] },
  { name: 'Skyline Rush', zone: 'CITY AFTER DARK', color: 0x56d9ff },
  { name: 'Solar Flare', zone: 'HEAT OF THE MOMENT', color: 0xff9d52 },
  { name: 'Gravity Garden', zone: 'A DIFFERENT RHYTHM', color: 0xc18aff },
];
const stage = document.querySelector('#game-canvas');
const overlay = document.querySelector('#game-overlay');
const playButton = document.querySelector('#play-button');
const progressFill = document.querySelector('#progress-fill');
const attemptDisplay = document.querySelector('#attempt');
const message = document.querySelector('#game-message');
const laneY = -1.7;
const level = levels[0];
let renderer, scene, camera, player, playerSprite, spriteMaterial, atlasTexture, spriteMap, clock, raf, resizeObserver;
let running = false, started = false, dead = false, completed = false, distance = 0, attempt = 1, soundOn = false;
let audioContext, activeAnimation = '', animationTime = 0;
const obstacles = [];

function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x10162a);
  scene.fog = new THREE.Fog(0x10162a, 15, 47);
  camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100);
  camera.position.set(0, 5.6, 15);
  camera.lookAt(0, 0, 0);
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  } catch {
    stage.innerHTML = '<div class="webgl-fallback">WebGL could not start. Try a recent Safari or Chrome browser.</div>';
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setSize(stage.clientWidth, stage.clientHeight);
  stage.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0x99c5ff, 0x251c4a, 2));
  const light = new THREE.DirectionalLight(0xffffff, 2.2);
  light.position.set(-3, 8, 7);
  scene.add(light);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(130, 18), new THREE.MeshStandardMaterial({ color: 0x141c32, roughness: .86 }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.set(22, laneY, 0);
  scene.add(floor);
  const grid = new THREE.GridHelper(120, 64, 0x456276, 0x28374f);
  grid.position.set(22, laneY + .02, 0);
  grid.material.transparent = true;
  grid.material.opacity = .35;
  scene.add(grid);
  for (let i = 0; i < 14; i++) {
    const height = 1.5 + ((i * 37) % 7) * .5;
    const building = new THREE.Mesh(new THREE.BoxGeometry(1.5, height, .45), new THREE.MeshBasicMaterial({ color: i % 2 ? 0x263451 : 0x202d49 }));
    building.position.set(-12 + i * 2.7, laneY + height / 2, -5.2);
    scene.add(building);
    for (let j = 0; j < 3; j++) {
      const windowLight = new THREE.Mesh(new THREE.BoxGeometry(.06, .17, .04), new THREE.MeshBasicMaterial({ color: i % 3 ? 0x526289 : 0xb7ef73 }));
      windowLight.position.set(building.position.x - .35 + j * .35, laneY + height / 2 + .2, -4.94);
      scene.add(windowLight);
    }
  }
  const edge = new THREE.Mesh(new THREE.BoxGeometry(120, .06, .12), new THREE.MeshBasicMaterial({ color: level.color }));
  edge.position.set(22, laneY + .04, .15);
  scene.add(edge);
  player = new THREE.Group();
  player.position.set(-3, laneY, 0);
  player.userData.vy = 0;
  player.userData.grounded = true;
  const fallback = new THREE.Mesh(new THREE.BoxGeometry(.78, .78, .78), new THREE.MeshStandardMaterial({ color: level.color, emissive: level.color, emissiveIntensity: .55 }));
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
    showOverlay('Graphics paused.', 'Reload the page to restart this demo.');
  });
  loadCharacter();
  draw();
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
    // Keep the supplied sprite-map foot anchor aligned with the track surface.
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
  const vy = player.userData.vy;
  const name = dead ? 'hurt' : completed ? 'victory' : !started ? 'idle' : player.userData.grounded ? 'run' : vy > 2 ? 'jump_rise' : vy > -1.5 ? 'jump_apex' : 'fall';
  playAnimation(name);
  const animation = spriteMap.animations[name];
  animationTime += dt;
  if (animationTime >= 1 / animation.fps) {
    animationTime = 0;
    const frameIndex = animation.loop ? Math.floor(clock.elapsedTime * animation.fps) % animation.frames.length : Math.min(animation.frames.length - 1, Math.floor(clock.elapsedTime * animation.fps) % animation.frames.length);
    setSpriteFrame(animation.frames[frameIndex]);
  }
}

function resize() {
  if (!renderer) return;
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
  for (const obstacle of obstacles) {
    obstacle.position.x -= level.speed * dt;
    if (obstacle.position.x < -5 && !obstacle.userData.passed) {
      obstacle.userData.passed = true;
      progressFill.style.width = `${Math.min(100, distance / level.length * 100)}%`;
    }
    if (obstacle.position.x < -8) {
      scene.remove(obstacle);
      obstacles.splice(obstacles.indexOf(obstacle), 1);
      break;
    }
    const isInCollisionRange = Math.abs(obstacle.position.x - player.position.x) < .72;
    const jumpHeight = player.position.y - laneY;
    if (isInCollisionRange && jumpHeight < .95) {
      crash();
      break;
    }
  }
  if (distance >= level.length) finish();
}

function spawnObstacles() {
  for (const [distanceAlongTrack, count] of level.obstacles) {
    for (let index = 0; index < count; index++) {
      const geometry = new THREE.ConeGeometry(.57, .95, 4);
      geometry.rotateY(Math.PI / 4);
      const obstacle = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0xff557d, emissive: 0x761c45, emissiveIntensity: .55, metalness: .15 }));
      obstacle.position.set(distanceAlongTrack - 3 + index * 1.28, laneY + .475, 0);
      obstacle.userData.passed = false;
      scene.add(obstacle);
      obstacles.push(obstacle);
    }
  }
}

function showOverlay(title, instructions) {
  overlay.hidden = false;
  overlay.querySelector('h2').textContent = title;
  overlay.querySelector('p').textContent = instructions;
}

function start() {
  if (dead || completed) reset();
  if (running) return;
  started = true;
  running = true;
  overlay.hidden = true;
  message.textContent = 'TAP / CLICK / SPACE TO JUMP';
  playButton.innerHTML = '<span class="play-icon">↻</span> RESTART RUN';
  spawnObstacles();
}

function jump() {
  if (!started) {
    start();
    return;
  }
  if (!running) {
    if (dead || completed) reset();
    start();
    return;
  }
  if (player.userData.grounded) {
    player.userData.vy = 8.3;
    player.userData.grounded = false;
    tone(520, .07);
  }
}

function crash() {
  running = false;
  dead = true;
  attempt++;
  attemptDisplay.textContent = String(attempt).padStart(2, '0');
  showOverlay('One more try.', 'Tap or press space to jump back in.');
  message.textContent = 'RUN ENDED — TRY AGAIN';
  tone(150, .16);
}

function finish() {
  running = false;
  completed = true;
  distance = level.length;
  progressFill.style.width = '100%';
  showOverlay('Level complete!', 'Neon Run cleared. The next world is coming soon.');
  message.textContent = 'LEVEL COMPLETE';
}

function reset() {
  dead = false;
  completed = false;
  started = false;
  running = false;
  distance = 0;
  player.position.set(-3, laneY, 0);
  player.userData.vy = 0;
  player.userData.grounded = true;
  obstacles.splice(0).forEach((obstacle) => scene.remove(obstacle));
  progressFill.style.width = '0%';
  showOverlay('Ready when you are.', 'Tap anywhere or press space to jump.');
}

function tone(frequency, duration) {
  if (!soundOn) return;
  try {
    audioContext ??= new AudioContext();
    if (audioContext.state === 'suspended') audioContext.resume();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(.04, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + duration);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration);
  } catch {
    // Sound is optional; gameplay remains available.
  }
}

playButton.addEventListener('click', () => {
  if (dead || completed || started) reset();
  else start();
});
stage.addEventListener('pointerdown', (event) => { event.preventDefault(); jump(); });
overlay.addEventListener('pointerdown', (event) => { event.preventDefault(); jump(); });
document.addEventListener('keydown', (event) => {
  if (['Space', 'ArrowUp', 'KeyW'].includes(event.code)) {
    event.preventDefault();
    jump();
  }
});
document.querySelector('#sound-toggle').addEventListener('click', (event) => {
  soundOn = !soundOn;
  event.currentTarget.textContent = soundOn ? 'SOUND ON' : 'SOUND OFF';
  event.currentTarget.setAttribute('aria-label', soundOn ? 'Mute sound' : 'Enable sound');
  if (soundOn) tone(660, .08);
});
const list = document.querySelector('#level-list');
levels.forEach((item, index) => {
  const card = document.createElement('article');
  card.className = `level-card${index === 0 ? ' active' : ' coming'}`;
  card.innerHTML = `<span class="level-number">LEVEL ${String(index + 1).padStart(2, '0')}</span><h3>${item.name}</h3><p>${item.zone}</p>`;
  list.appendChild(card);
});
document.querySelector('#version-label').textContent = `v${packageInfo.version}`;
document.querySelector('#footer-version').textContent = `VERSION ${packageInfo.version}`;
initScene();
window.addEventListener('pagehide', () => {
  cancelAnimationFrame(raf);
  resizeObserver?.disconnect();
  renderer?.dispose();
  atlasTexture?.dispose();
});
