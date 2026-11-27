// A fixed-size particle pool for presentation feedback. It knows nothing about gameplay: callers
// hand it a world position, a colour and a count, and it recycles pre-built meshes. Nothing is
// allocated inside update(); dead particles and rings simply return to the pool.
import * as THREE from 'three';

const PARTICLE_BUDGET = 40;
const RING_BUDGET = 6;
const PARTICLE_RADIUS = .085;

export function emitBurst(pool, options, { reducedMotion = false } = {}) {
  if (!pool || reducedMotion) return 0;
  return pool.burst(options);
}

export function emitRing(pool, options, { reducedMotion = false } = {}) {
  if (!pool || reducedMotion) return false;
  return pool.ring(options);
}

export function createParticlePool(scene, { capacity = PARTICLE_BUDGET } = {}) {
  const particleCapacity = Math.max(1, Math.min(PARTICLE_BUDGET, Math.floor(capacity) || PARTICLE_BUDGET));
  const particleGeometry = new THREE.OctahedronGeometry(PARTICLE_RADIUS, 0);
  const ringGeometry = new THREE.TorusGeometry(.55, .035, 6, 20);
  const particles = [];
  const rings = [];

  for (let index = 0; index < particleCapacity; index++) {
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 1,
      depthWrite: false,
      toneMapped: false,
    });
    const mesh = new THREE.Mesh(particleGeometry, material);
    mesh.visible = false;
    mesh.renderOrder = 2;
    scene?.add(mesh);
    particles.push({
      mesh,
      material,
      alive: false,
      life: 0,
      maxLife: 1,
      size: 1,
      velocityX: 0,
      velocityY: 0,
      velocityZ: 0,
      gravity: 0,
      spinX: 0,
      spinY: 0,
      spinZ: 0,
    });
  }

  for (let index = 0; index < RING_BUDGET; index++) {
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    const mesh = new THREE.Mesh(ringGeometry, material);
    mesh.visible = false;
    mesh.renderOrder = 2;
    scene?.add(mesh);
    rings.push({ mesh, material, alive: false, life: 0, maxLife: 1 });
  }

  function setPosition(mesh, position) {
    mesh.position.set(
      Number.isFinite(position?.x) ? position.x : 0,
      Number.isFinite(position?.y) ? position.y : 0,
      Number.isFinite(position?.z) ? position.z : 0,
    );
  }

  function burst(options = {}) {
    const requested = Number.isFinite(options.count) ? Math.floor(options.count) : 0;
    let spawnBudget = Math.max(0, requested);
    if (spawnBudget === 0) return 0;
    let spawned = 0;
    const speed = Number.isFinite(options.speed) ? Math.max(0, options.speed) : 2.2;
    const baseLife = Number.isFinite(options.life) ? Math.max(.05, options.life) : .55;
    const gravity = Number.isFinite(options.gravity) ? options.gravity : -5;
    for (const particle of particles) {
      if (spawnBudget <= 0) break;
      if (particle.alive) continue;
      const angle = Math.random() * Math.PI * 2;
      const horizontal = speed * (.45 + Math.random() * .55);
      particle.alive = true;
      particle.life = baseLife * (.72 + Math.random() * .5);
      particle.maxLife = particle.life;
      particle.size = .75 + Math.random() * .55;
      particle.velocityX = Math.cos(angle) * horizontal;
      particle.velocityY = speed * (.35 + Math.random() * .75);
      particle.velocityZ = Math.sin(angle) * horizontal * .55;
      particle.gravity = gravity;
      particle.spinX = (Math.random() - .5) * 12;
      particle.spinY = (Math.random() - .5) * 12;
      particle.spinZ = (Math.random() - .5) * 12;
      setPosition(particle.mesh, options.position);
      particle.mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      particle.mesh.scale.setScalar(particle.size);
      particle.material.color.set(options.colour ?? 0xffffff);
      particle.material.opacity = 1;
      particle.mesh.visible = true;
      spawnBudget--;
      spawned++;
    }
    // Any request beyond the free slots is dropped, never queued.
    return spawned;
  }

  function ring(options = {}) {
    const ringSlot = rings.find((entry) => !entry.alive);
    if (!ringSlot) return false;
    ringSlot.alive = true;
    ringSlot.life = Number.isFinite(options.life) ? Math.max(.05, options.life) : .45;
    ringSlot.maxLife = ringSlot.life;
    setPosition(ringSlot.mesh, options.position);
    ringSlot.mesh.rotation.set(0, 0, 0);
    ringSlot.mesh.scale.setScalar(.55);
    ringSlot.material.color.set(options.colour ?? 0xffffff);
    ringSlot.material.opacity = .9;
    ringSlot.mesh.visible = true;
    return true;
  }

  function update(dt) {
    if (!Number.isFinite(dt) || dt <= 0) return;
    for (const particle of particles) {
      if (!particle.alive) continue;
      particle.life -= dt;
      if (particle.life <= 0) {
        particle.alive = false;
        particle.mesh.visible = false;
        particle.material.opacity = 0;
        continue;
      }
      particle.velocityY += particle.gravity * dt;
      particle.mesh.position.x += particle.velocityX * dt;
      particle.mesh.position.y += particle.velocityY * dt;
      particle.mesh.position.z += particle.velocityZ * dt;
      particle.mesh.rotation.x += particle.spinX * dt;
      particle.mesh.rotation.y += particle.spinY * dt;
      particle.mesh.rotation.z += particle.spinZ * dt;
      const ratio = Math.max(0, particle.life / particle.maxLife);
      particle.material.opacity = ratio;
      particle.mesh.scale.setScalar(particle.size * (.35 + ratio * .65));
    }
    for (const ringSlot of rings) {
      if (!ringSlot.alive) continue;
      ringSlot.life -= dt;
      if (ringSlot.life <= 0) {
        ringSlot.alive = false;
        ringSlot.mesh.visible = false;
        ringSlot.material.opacity = 0;
        continue;
      }
      const ratio = Math.max(0, ringSlot.life / ringSlot.maxLife);
      ringSlot.material.opacity = ratio * .9;
      ringSlot.mesh.scale.setScalar(.55 + (1 - ratio) * 2.1);
    }
  }

  function dispose() {
    for (const particle of particles) {
      scene?.remove(particle.mesh);
      particle.material.dispose();
    }
    for (const ringSlot of rings) {
      scene?.remove(ringSlot.mesh);
      ringSlot.material.dispose();
    }
    particleGeometry.dispose();
    ringGeometry.dispose();
    particles.length = 0;
    rings.length = 0;
  }

  return {
    capacity: particleCapacity,
    ringCapacity: RING_BUDGET,
    burst,
    ring,
    update,
    dispose,
    activeCount() {
      let count = 0;
      for (const particle of particles) if (particle.alive) count++;
      return count;
    },
    ringCount() {
      let count = 0;
      for (const ringSlot of rings) if (ringSlot.alive) count++;
      return count;
    },
    particles,
    rings,
  };
}
