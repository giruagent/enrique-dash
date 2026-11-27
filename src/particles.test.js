import test from 'node:test';
import assert from 'node:assert/strict';
import { createParticlePool } from './particles.js';

function createScene() {
  return {
    objects: [],
    add(mesh) { this.objects.push(mesh); },
    remove(mesh) {
      const index = this.objects.indexOf(mesh);
      if (index >= 0) this.objects.splice(index, 1);
    },
  };
}

const at = (x = 0, y = 0, z = 0) => ({ x, y, z });

test('a burst clamps to the free slots and a full pool drops extra bursts', () => {
  const pool = createParticlePool(createScene(), { capacity: 4 });
  assert.equal(pool.capacity, 4);
  assert.equal(pool.burst({ position: at(), count: 10, colour: 0xffe066 }), 4);
  assert.equal(pool.activeCount(), 4);
  assert.equal(pool.burst({ position: at(), count: 8 }), 0, 'a full pool drops the request');
  assert.equal(pool.activeCount(), 4);
});

test('update returns every particle to the pool when life expires', () => {
  const pool = createParticlePool(createScene(), { capacity: 8 });
  assert.equal(pool.burst({ position: at(), count: 8, life: .2 }), 8);
  pool.update(.05);
  assert.equal(pool.activeCount(), 8, 'particles remain mid-flight');
  pool.update(.5);
  assert.equal(pool.activeCount(), 0, 'particles return to the pool');
  assert.equal(pool.burst({ position: at(), count: 8 }), 8, 'the returned slots are reusable');
});

test('the particle capacity is never exceeded across many bursts', () => {
  const pool = createParticlePool(createScene(), { capacity: 12 });
  for (let index = 0; index < 100; index++) {
    pool.burst({ position: at(index, 1, 0), count: 7 });
    assert.ok(pool.activeCount() <= pool.capacity, `active ${pool.activeCount()} > ${pool.capacity}`);
  }
  assert.equal(pool.activeCount(), 12);
});

test('the ring pool caps at six and recycles after its life', () => {
  const pool = createParticlePool(createScene(), { capacity: 4 });
  for (let index = 0; index < 12; index++) {
    pool.ring({ position: at(index, 0, 0), colour: 0x52eaff, life: .3 });
  }
  assert.equal(pool.ringCapacity, 6);
  assert.equal(pool.ringCount(), 6, 'a full ring pool drops the extra pulse');
  pool.update(.4);
  assert.equal(pool.ringCount(), 0);
  assert.equal(pool.ring({ position: at(), colour: 0xffffff }), true);
});

test('the default budget is forty particles and six rings', () => {
  const pool = createParticlePool(createScene());
  assert.equal(pool.capacity, 40);
  assert.equal(pool.ringCapacity, 6);
  pool.dispose();
});
