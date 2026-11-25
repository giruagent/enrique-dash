import test from 'node:test';
import assert from 'node:assert/strict';
import { createLossCue, playOneShot, primeOneShot, stopOneShot } from './audio-cues.js';

function makeAudioConstructor({ oggSupport = 'probably', play = () => Promise.resolve() } = {}) {
  return class FakeAudio {
    constructor() {
      this.preload = 'auto';
      this.currentTime = 0;
      this.volume = 1;
      this.actions = [];
      this.playResult = play;
    }

    canPlayType(type) {
      assert.equal(type, 'audio/ogg; codecs="opus"');
      return oggSupport;
    }

    pause() {
      this.actions.push('pause');
    }

    play() {
      this.actions.push('play');
      return this.playResult();
    }
  };
}

test('loss cue prefers Ogg Opus and defers its download until gameplay starts', () => {
  const AudioConstructor = makeAudioConstructor();
  const cue = createLossCue('/enrique-dash/', AudioConstructor);

  assert.equal(cue.preload, 'none');
  assert.equal(cue.src, '/enrique-dash/audio/enrique-lose-scream.ogg');
});

test('loss cue is primed once after a gameplay interaction', () => {
  const cue = new (makeAudioConstructor())();
  let loadCount = 0;
  cue.load = () => { loadCount++; };

  assert.equal(cue.preload, 'auto');
  assert.equal(primeOneShot(cue), false);
  assert.equal(loadCount, 0);

  cue.preload = 'none';
  assert.equal(primeOneShot(cue), true);
  assert.equal(cue.preload, 'auto');
  assert.equal(primeOneShot(cue), false);
  assert.equal(loadCount, 1);
});

test('a preload failure does not block gameplay or retry on resume', () => {
  const cue = new (makeAudioConstructor())();
  cue.preload = 'none';
  let attempts = 0;
  cue.load = () => { attempts++; throw new Error('media loading is unavailable'); };

  assert.equal(primeOneShot(cue), false);
  assert.equal(cue.preload, 'none');
  assert.equal(primeOneShot(cue), false);
  assert.equal(attempts, 1);
});

test('loss cue falls back to MP3 when Ogg Opus is unsupported', () => {
  const AudioConstructor = makeAudioConstructor({ oggSupport: '' });
  const cue = createLossCue('/', AudioConstructor);

  assert.equal(cue.src, '/audio/enrique-lose-scream.mp3');
});

test('stopping a one-shot cue pauses and rewinds it', () => {
  const AudioConstructor = makeAudioConstructor();
  const cue = new AudioConstructor();
  cue.currentTime = 1.1;

  assert.equal(stopOneShot(cue), true);
  assert.equal(cue.currentTime, 0);
  assert.deepEqual(cue.actions, ['pause']);
});

test('one-shot playback restarts the cue and clamps volume', async () => {
  const AudioConstructor = makeAudioConstructor();
  const cue = new AudioConstructor();
  cue.currentTime = 0.9;

  assert.equal(await playOneShot(cue, 1.2), true);
  assert.equal(cue.currentTime, 0);
  assert.equal(cue.volume, 1);
  assert.deepEqual(cue.actions, ['pause', 'play']);
});

test('one-shot playback handles a rejected media play promise', async () => {
  const AudioConstructor = makeAudioConstructor({ play: () => Promise.reject(new Error('blocked')) });
  const cue = new AudioConstructor();

  assert.equal(await playOneShot(cue), false);
});
