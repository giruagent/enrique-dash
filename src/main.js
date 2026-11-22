import * as THREE from 'three';
import './style.css';

const levels = [
  { name: 'Neon Run', zone: 'THE FIRST STEP', color: 0xc8ff52, speed: 8.2, length: 78, obstacles: [[13, 1], [23, 1], [34, 2], [47, 1], [57, 2], [68, 1]] },
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
const levelName = document.querySelector('#level-name');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let renderer, scene, camera, player, playerMat, clock, raf, resizeObserver;
let running = false, started = false, dead = false, distance = 0, attempt = 1, soundOn = false;
let audioContext;
const obstacles = [], particles = [];
const laneY = -1.1;

function initScene() {
  scene = new THREE.Scene(); scene.background = new THREE.Color(0x10162a); scene.fog = new THREE.Fog(0x10162a, 15, 47);
  camera = new THREE.PerspectiveCamera(48, 1, 0.1, 100); camera.position.set(0, 5.6, 15); camera.lookAt(0, 0, 0);
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false }); }
  catch { stage.innerHTML = '<div style="display:grid;place-items:center;height:100%;color:#e7edfb;font:14px sans-serif;padding:24px;text-align:center">Your browser could not start WebGL. Try a recent Safari or Chrome browser.</div>'; return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7)); renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setSize(stage.clientWidth, stage.clientHeight); stage.appendChild(renderer.domElement);
  scene.add(new THREE.HemisphereLight(0x99c5ff, 0x251c4a, 2.0));
  const light = new THREE.DirectionalLight(0xffffff, 2.2); light.position.set(-3, 8, 7); scene.add(light);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(130, 18), new THREE.MeshStandardMaterial({ color: 0x141c32, roughness: .86 })); floor.rotation.x = -Math.PI / 2; floor.position.set(22, -1.7, 0); scene.add(floor);
  const grid = new THREE.GridHelper(120, 64, 0x456276, 0x28374f); grid.position.set(22, -1.68, 0); grid.material.transparent = true; grid.material.opacity = .35; scene.add(grid);
  for (let i = 0; i < 14; i++) {
    const h = 1.5 + ((i * 37) % 7) * .5;
    const block = new THREE.Mesh(new THREE.BoxGeometry(1.5, h, .45), new THREE.MeshBasicMaterial({ color: i % 2 ? 0x263451 : 0x202d49 }));
    block.position.set(-12 + i * 2.7, -1.7 + h / 2, -5.2); scene.add(block);
    const win = new THREE.Mesh(new THREE.BoxGeometry(.06, .17, .04), new THREE.MeshBasicMaterial({ color: i % 3 ? 0x526289 : 0xb7ef73 }));
    for (let j = 0; j < 3; j++) { const w = win.clone(); w.position.set(block.position.x - .35 + j * .35, -1.5 + h / 2, -4.94); scene.add(w); }
  }
  const mat = new THREE.MeshStandardMaterial({ color: levels[0].color, emissive: levels[0].color, emissiveIntensity: .55, roughness: .32, metalness: .18 });
  playerMat = mat; player = new THREE.Mesh(new THREE.BoxGeometry(.78, .78, .78), mat); player.position.set(-3, laneY, 0); scene.add(player);
  const edge = new THREE.Mesh(new THREE.BoxGeometry(120, .06, .12), new THREE.MeshBasicMaterial({ color: 0xc8ff52 })); edge.position.set(22, -1.65, .15); scene.add(edge);
  resizeObserver = new ResizeObserver(resize); resizeObserver.observe(stage); clock = new THREE.Clock();
  renderer.domElement.addEventListener('webglcontextlost', (e) => { e.preventDefault(); running = false; overlay.hidden = false; overlay.querySelector('h2').textContent = 'Graphics paused.'; overlay.querySelector('p').textContent = 'Reload the page to restart this demo.'; });
  draw();
}
function resize() { if (!renderer) return; const w = stage.clientWidth, h = stage.clientHeight; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); }
function draw() { raf = requestAnimationFrame(draw); if (!renderer) return; const dt = Math.min(clock.getDelta(), .04); if (running) update(dt); renderer.render(scene, camera); }
function update(dt) {
  distance += dt * levels[0].speed; player.position.y += player.userData.vy * dt; player.userData.vy -= 19 * dt;
  if (player.position.y <= laneY) { player.position.y = laneY; player.userData.vy = 0; player.userData.grounded = true; }
  player.rotation.z = player.userData.grounded ? Math.round(player.rotation.z / (Math.PI / 2)) * (Math.PI / 2) : player.rotation.z - dt * 5.4;
  for (const obstacle of obstacles) {
    obstacle.position.x -= levels[0].speed * dt;
    if (obstacle.position.x < -5 && !obstacle.userData.passed) { obstacle.userData.passed = true; progressFill.style.width = `${Math.min(100, distance / levels[0].length * 100)}%`; }
    if (obstacle.position.x < -8) { scene.remove(obstacle); obstacles.splice(obstacles.indexOf(obstacle), 1); break; }
    if (Math.abs(obstacle.position.x - player.position.x) < .75 && player.position.y < laneY + .9) { crash(); break; }
  }
  if (distance >= levels[0].length) finish();
  player.position.x = -3; camera.position.x = 0;
}
function spawnObstacles() {
  for (const [x, count] of levels[0].obstacles) for (let i = 0; i < count; i++) {
    const geo = new THREE.ConeGeometry(.57, .95, 4); geo.rotateY(Math.PI / 4);
    const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xff557d, emissive: 0x761c45, emissiveIntensity: .55, metalness: .15 }));
    mesh.position.set(x - 3, laneY - .25, 0); mesh.userData.passed = false; scene.add(mesh); obstacles.push(mesh);
  }
}
function start() { if (dead) reset(); if (running) return; started = true; running = true; overlay.hidden = true; message.textContent = 'TAP / CLICK / SPACE TO JUMP'; playButton.innerHTML = '<span class="play-icon">↻</span> RESTART RUN'; spawnObstacles(); }
function jump() {
  if (!started) { start(); return; }
  if (!running) { if (dead) reset(); start(); return; }
  if (player.userData.grounded) { player.userData.vy = 8.3; player.userData.grounded = false; tone(520, .07); }
}
function crash() { running = false; dead = true; attempt++; attemptDisplay.textContent = String(attempt).padStart(2, '0'); overlay.hidden = false; overlay.querySelector('h2').textContent = 'One more try.'; overlay.querySelector('p').textContent = 'Tap or press space to jump back in.'; message.textContent = 'RUN ENDED — TRY AGAIN'; tone(150, .16); }
function finish() { running = false; distance = 0; progressFill.style.width = '100%'; overlay.hidden = false; overlay.querySelector('h2').textContent = 'Level complete!'; overlay.querySelector('p').textContent = 'Nice run. This is just the beginning.'; message.textContent = 'LEVEL COMPLETE'; }
function reset() { dead = false; started = false; distance = 0; player.position.set(-3, laneY, 0); player.rotation.set(0, 0, 0); player.userData.vy = 0; player.userData.grounded = true; obstacles.splice(0).forEach(o => scene.remove(o)); progressFill.style.width = '0%'; overlay.hidden = false; overlay.querySelector('h2').textContent = 'Ready when you are.'; overlay.querySelector('p').textContent = 'Tap anywhere or press space to jump.'; }
function tone(freq, length) { if (!soundOn) return; try { audioContext ??= new AudioContext(); if (audioContext.state === 'suspended') audioContext.resume(); const osc = audioContext.createOscillator(), gain = audioContext.createGain(); osc.frequency.value = freq; gain.gain.setValueAtTime(.04, audioContext.currentTime); gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + length); osc.connect(gain).connect(audioContext.destination); osc.start(); osc.stop(audioContext.currentTime + length); } catch { /* Sound is optional; gameplay remains available. */ } }
playButton.addEventListener('click', () => { if (dead || !started) start(); else reset(); });
stage.addEventListener('pointerdown', (e) => { e.preventDefault(); jump(); });
overlay.addEventListener('pointerdown', (e) => { e.preventDefault(); jump(); });
document.addEventListener('keydown', (e) => { if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) { e.preventDefault(); jump(); } });
document.querySelector('#sound-toggle').addEventListener('click', (e) => { soundOn = !soundOn; e.currentTarget.textContent = soundOn ? 'SOUND ON' : 'SOUND OFF'; e.currentTarget.setAttribute('aria-label', soundOn ? 'Mute sound' : 'Enable sound'); if (soundOn) tone(660, .08); });
const list = document.querySelector('#level-list');
levels.forEach((level, i) => { const card = document.createElement('article'); card.className = `level-card${i === 0 ? ' active' : ' coming'}`; card.innerHTML = `<span class="level-number">LEVEL ${String(i + 1).padStart(2, '0')}</span><h3>${level.name}</h3><p>${level.zone}</p>`; list.appendChild(card); });
initScene();
window.addEventListener('pagehide', () => { cancelAnimationFrame(raf); resizeObserver?.disconnect(); renderer?.dispose(); });
