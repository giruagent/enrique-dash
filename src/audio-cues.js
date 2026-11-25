const primedOneShots = new WeakSet();

export function createLossCue(baseUrl, AudioConstructor) {
  const audio = new AudioConstructor();
  const base = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const supportsOpus = Boolean(audio.canPlayType?.('audio/ogg; codecs="opus"'));
  const extension = supportsOpus ? 'ogg' : 'mp3';

  audio.preload = 'none';
  audio.src = `${base}audio/enrique-lose-scream.${extension}`;
  return audio;
}

export function primeOneShot(audio) {
  if (!audio || primedOneShots.has(audio) || audio.preload !== 'none') return false;
  primedOneShots.add(audio);
  try {
    audio.preload = 'auto';
    audio.load?.();
    return true;
  } catch {
    try {
      audio.preload = 'none';
    } catch {
      // Failure to prefetch must not prevent the game from starting.
    }
    return false;
  }
}

export function stopOneShot(audio) {
  if (!audio) return false;
  try {
    audio.pause();
  } catch {
    // Some media elements can reject pause requests while their source changes.
  }
  try {
    audio.currentTime = 0;
  } catch {
    // Media may not be seekable until its metadata has loaded.
  }
  return true;
}

export async function playOneShot(audio, volume = .9) {
  if (!audio) return false;

  try {
    stopOneShot(audio);
    audio.volume = Number.isFinite(volume) ? Math.max(0, Math.min(1, volume)) : .9;
    const playback = audio.play();
    if (playback && typeof playback.then === 'function') await playback;
    return true;
  } catch {
    return false;
  }
}
