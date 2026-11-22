const pentatonicMajor = [0, 2, 4, 7, 9];
const pentatonicMinor = [0, 3, 5, 7, 10];
const dorian = [0, 2, 3, 5, 7, 9, 10];
const mixolydian = [0, 2, 4, 5, 7, 9, 10];
const phrygian = [0, 1, 3, 5, 7, 8, 10];
const motif = (...steps) => steps;

export const levels = [
  { id: 'neon-run', name: 'Neon Run', zone: 'THE FIRST STEP', color: 0xc8ff52, background: 0x10162a, floor: 0x141c32, speed: 8.2, length: 78, obstacles: [[13, 1], [23, 2], [35, 1], [46, 2], [58, 1], [69, 2]], music: { bpm: 118, root: 57, scale: pentatonicMinor, progression: [0, 3, 2, 4], motif: motif(0, null, 2, null, 4, 2, null, 3, 0, null, 2, null, 4, 3, 2, null) } },
  { id: 'skyline-rush', name: 'Skyline Rush', zone: 'CITY AFTER DARK', color: 0x56d9ff, background: 0x0a182b, floor: 0x10243a, speed: 8.4, length: 88, obstacles: [[12, 1], [23, 2], [35, 1], [47, 2], [60, 1], [72, 2], [81, 1]], music: { bpm: 124, root: 60, scale: pentatonicMajor, progression: [0, 4, 3, 4], motif: motif(0, null, 2, 4, null, 2, 4, null, 3, null, 2, null, 4, 2, 0, null) } },
  { id: 'solar-flare', name: 'Solar Flare', zone: 'HEAT OF THE MOMENT', color: 0xff9d52, background: 0x291528, floor: 0x301d2b, speed: 8.6, length: 91, obstacles: [[13, 2], [25, 1], [37, 2], [49, 1], [62, 2], [74, 1], [83, 2]], music: { bpm: 130, root: 52, scale: dorian, progression: [0, 3, 4, 2], motif: motif(0, 2, null, 3, 4, null, 5, 4, 3, null, 2, null, 4, 5, 3, null) } },
  { id: 'gravity-garden', name: 'Gravity Garden', zone: 'A DIFFERENT RHYTHM', color: 0xc18aff, background: 0x17142a, floor: 0x1e1b35, speed: 8.3, length: 93, obstacles: [[13, 1], [25, 2], [38, 1], [50, 2], [63, 1], [75, 2], [85, 1]], music: { bpm: 110, root: 55, scale: pentatonicMajor, progression: [0, 2, 4, 3], motif: motif(0, null, 4, 2, null, 3, 4, null, 2, null, 0, 2, null, 4, 3, null) } },
  { id: 'pixel-pier', name: 'Pixel Pier', zone: 'ARCADE BY THE SEA', color: 0xffdf6e, background: 0x171b30, floor: 0x22233a, speed: 8.7, length: 95, obstacles: [[13, 2], [25, 1], [37, 2], [49, 1], [62, 2], [75, 1], [86, 2]], music: { bpm: 136, root: 62, scale: mixolydian, progression: [0, 4, 2, 3], motif: motif(0, 2, 4, null, 2, 4, 5, null, 4, 2, null, 3, 2, null, 0, null) } },
  { id: 'midnight-circuit', name: 'Midnight Circuit', zone: 'AFTER-HOURS TURBO', color: 0x4f91ff, background: 0x0b1328, floor: 0x131d35, speed: 8.9, length: 97, obstacles: [[13, 1], [25, 2], [38, 1], [50, 2], [63, 1], [76, 2], [88, 1]], music: { bpm: 140, root: 50, scale: phrygian, progression: [0, 2, 3, 4], motif: motif(0, null, 1, 3, null, 5, 3, null, 2, null, 1, null, 4, 3, 2, null) } },
  { id: 'candy-comet', name: 'Candy Comet', zone: 'SWEET BUT SPEEDY', color: 0xff79b8, background: 0x27152b, floor: 0x321d38, speed: 8.6, length: 99, obstacles: [[13, 2], [25, 1], [38, 2], [51, 1], [64, 2], [77, 1], [89, 2]], music: { bpm: 126, root: 57, scale: pentatonicMajor, progression: [0, 3, 4, 0], motif: motif(0, 2, 4, null, 4, 2, 3, null, 0, null, 2, 4, null, 3, 2, null) } },
  { id: 'aqua-pulse', name: 'Aqua Pulse', zone: 'DEEP BLUE DRIVE', color: 0x48f0cf, background: 0x0b202a, floor: 0x102b36, speed: 9.0, length: 101, obstacles: [[13, 1], [25, 2], [38, 1], [51, 2], [64, 1], [77, 2], [91, 1]], music: { bpm: 132, root: 53, scale: dorian, progression: [0, 2, 4, 3], motif: motif(0, null, 2, 3, null, 5, 3, null, 2, null, 4, 5, null, 3, 2, null) } },
  { id: 'crystal-cavern', name: 'Crystal Cavern', zone: 'ECHOES IN THE DARK', color: 0x9daaff, background: 0x14172b, floor: 0x1b2139, speed: 9.1, length: 103, obstacles: [[13, 2], [25, 1], [38, 2], [51, 1], [64, 2], [78, 1], [92, 2]], music: { bpm: 116, root: 60, scale: phrygian, progression: [0, 3, 2, 4], motif: motif(0, null, 3, null, 5, 4, null, 2, 0, null, 1, null, 3, 5, 2, null) } },
  { id: 'stormbreaker', name: 'Stormbreaker', zone: 'RIDE THE THUNDER', color: 0xff6d73, background: 0x221522, floor: 0x2a1b2b, speed: 9.2, length: 105, obstacles: [[13, 1], [25, 2], [38, 1], [51, 2], [65, 1], [79, 2], [94, 1]], music: { bpm: 144, root: 55, scale: mixolydian, progression: [0, 3, 4, 2], motif: motif(0, 2, null, 4, 5, null, 4, 2, 3, null, 5, null, 4, 2, 0, null) } },
  { id: 'final-orbit', name: 'Final Orbit', zone: 'THE LAST LAUNCH', color: 0xe9f1ff, background: 0x101326, floor: 0x191f38, speed: 9.3, length: 108, obstacles: [[13, 2], [25, 1], [38, 2], [51, 1], [65, 2], [80, 1], [96, 2]], music: { bpm: 150, root: 48, scale: pentatonicMinor, progression: [0, 3, 4, 2], motif: motif(0, 3, null, 4, 5, 3, null, 2, 0, null, 4, 5, null, 3, 2, null) } },
];

export function validateLevels(catalog) {
  if (!Array.isArray(catalog) || catalog.length < 11) throw new Error('The game needs at least eleven playable levels.');
  const ids = new Set();
  const names = new Set();
  for (const level of catalog) {
    if (!level.id || ids.has(level.id)) throw new Error(`Missing or duplicate level id: ${level.id}`);
    if (!level.name || names.has(level.name)) throw new Error(`Missing or duplicate level name: ${level.name}`);
    ids.add(level.id);
    names.add(level.name);
    if (level.speed < 6 || level.speed > 11 || level.length < 40) throw new Error(`${level.name} has invalid speed or course length.`);
    if (!Number.isInteger(level.music?.bpm) || level.music.bpm < 80 || level.music.bpm > 160) throw new Error(`${level.name} has invalid music tempo.`);
    if (!Array.isArray(level.music.scale) || level.music.scale.length < 5 || level.music.motif?.length !== 16) throw new Error(`${level.name} has incomplete music data.`);
    if (!Array.isArray(level.obstacles) || level.obstacles.length < 6) throw new Error(`${level.name} needs at least six obstacle groups.`);
    let previousEnd = 0;
    for (const [distance, count] of level.obstacles) {
      if (!Number.isFinite(distance) || !Number.isInteger(count) || count < 1 || count > 2) throw new Error(`${level.name} contains an invalid obstacle group.`);
      if (distance <= previousEnd || distance + (count - 1) * 1.28 >= level.length - 3) throw new Error(`${level.name} has unsorted hazards or a hazard too near the finish.`);
      if (previousEnd > 0 && distance - previousEnd < level.speed * .9) throw new Error(`${level.name} has groups too close for a fair landing window.`);
      previousEnd = distance + (count - 1) * 1.28;
    }
  }
  return true;
}

export function getLevel(id) {
  return levels.find((level) => level.id === id);
}

validateLevels(levels);
