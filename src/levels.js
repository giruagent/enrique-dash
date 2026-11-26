import { beatWindows } from '../tools/level-physics.mjs';

const pentatonicMajor = [0, 2, 4, 7, 9];
const pentatonicMinor = [0, 3, 5, 7, 10];
const dorian = [0, 2, 3, 5, 7, 9, 10];
const mixolydian = [0, 2, 4, 5, 7, 9, 10];
const phrygian = [0, 1, 3, 5, 7, 8, 10];
const motif = (...steps) => steps;
const emptyCourse = { gaps: [], platforms: [], portals: [], enemies: [], collectibles: [] };

export const levels = [
  {
    ...emptyCourse, id: 'neon-run', name: 'Neon Run', zone: 'THE FIRST STEP',
    color: 0xc8ff52, background: 0x10162a, floor: 0x141c32, speed: 8.2, length: 78,
    environment: 'neon-city', signature: 'Three open gaps on a clean straight, each one a single jump.', designHook: 'Three spike groups and three holes, spaced so you can land and look before the next.', hazardStyle: 'spike',
    obstacles: [[9.84, 1], [32.7, 2], [68.16, 1]],
    gaps: [{ at: 14.66, width: 2.5 }, { at: 48.15, width: 2.5 }, { at: 58.24, width: 2.5 }],
    platforms: [],
    portals: [],
    enemies: [],
    collectibles: [],
    music: { bpm: 118, root: 57, scale: pentatonicMinor, progression: [0, 3, 2, 4], motif: motif(0, null, 2, null, 4, 2, null, 3, 0, null, 2, null, 4, 3, 2, null) },
  },
  {
    ...emptyCourse, id: 'skyline-rush', name: 'Skyline Rush', zone: 'CITY AFTER DARK',
    color: 0x56d9ff, background: 0x0a182b, floor: 0x10243a, speed: 8.4, length: 88,
    environment: 'skyline-rooftops', signature: 'A float portal stretches the arc you need over the middle hole.', designHook: 'Three gaps, one float portal before the second, and a shard parked at the top of the arc.', hazardStyle: 'vent',
    obstacles: [[10.08, 1], [37.04, 1], [57.54, 1], [77.92, 1]],
    gaps: [{ at: 26.88, width: 2.5 }, { at: 47.38, width: 2.5 }, { at: 67.76, width: 2.5 }],
    platforms: [],
    portals: [{ at: 38.28, type: 'float' }],
    enemies: [],
    collectibles: [{ at: 7.67, height: 1.9 }],
    music: { bpm: 124, root: 60, scale: pentatonicMajor, progression: [0, 4, 3, 4], motif: motif(0, null, 2, 4, null, 2, 4, null, 3, null, 2, null, 4, 2, 0, null) },
  },
  {
    ...emptyCourse, id: 'solar-flare', name: 'Solar Flare', zone: 'HEAT OF THE MOMENT',
    color: 0xff9d52, background: 0x291528, floor: 0x301d2b, speed: 8.5, length: 92,
    environment: 'solar-desert', signature: 'A spring portal turns the last gap into a long, slow hop.', designHook: 'Three open gaps with a spring launcher ahead of the third and one shard above it.', hazardStyle: 'solar-panel',
    obstacles: [[10.2, 1], [37.35, 1], [61.17, 1], [81.8, 1]],
    gaps: [{ at: 27.07, width: 2.5 }, { at: 50.89, width: 2.5 }, { at: 71.52, width: 2.5 }],
    platforms: [],
    portals: [{ at: 38.98, type: 'spring' }],
    enemies: [],
    collectibles: [{ at: 7.55, height: 1.9 }],
    music: { bpm: 130, root: 52, scale: dorian, progression: [0, 3, 4, 2], motif: motif(0, 2, null, 3, 4, null, 5, 4, 3, null, 2, null, 4, 5, 3, null) },
  },
  {
    ...emptyCourse, id: 'gravity-garden', name: 'Gravity Garden', zone: 'A DIFFERENT RHYTHM',
    color: 0xc18aff, background: 0x17142a, floor: 0x1e1b35, speed: 8.5, length: 96,
    environment: 'gravity-garden', signature: 'Float first, so both gaps ask for a lazier jump than they look.', designHook: 'Three holes with a float portal early, and the shard hangs where the low gravity carries you.', hazardStyle: 'vine',
    obstacles: [[10.2, 1], [25.39, 1], [51.82, 1], [75.52, 1], [85.8, 1]],
    gaps: [{ at: 15.11, width: 2.5 }, { at: 41.54, width: 2.5 }, { at: 65.24, width: 2.5 }],
    platforms: [],
    portals: [{ at: 27.33, type: 'float' }],
    enemies: [],
    collectibles: [{ at: 8.12, height: 1.9 }],
    music: { bpm: 110, root: 55, scale: pentatonicMajor, progression: [0, 2, 4, 3], motif: motif(0, null, 4, 2, null, 3, 4, null, 2, null, 0, 2, null, 4, 3, null) },
  },
  {
    ...emptyCourse, id: 'pixel-pier', name: 'Pixel Pier', zone: 'ARCADE BY THE SEA',
    color: 0xffdf6e, background: 0x171b30, floor: 0x22233a, speed: 8.6, length: 100,
    environment: 'pixel-pier', signature: 'A crawler on the opening straight, then a kerb you jump onto for the shard.', designHook: 'Crawler at the first beat, three gaps, a spring portal and one raised kerb with a shard over it.', hazardStyle: 'pixel-block',
    obstacles: [[25.59, 1], [52.43, 1], [79.28, 1], [89.68, 1]],
    gaps: [{ at: 15.19, width: 2.5 }, { at: 42.03, width: 2.5 }, { at: 68.87, width: 2.5 }],
    platforms: [{ at: 57.5, width: 4, height: 0.45, kind: 'kerb' }],
    portals: [{ at: 27.56, type: 'spring' }],
    enemies: [{ at: 10.32, type: 'crawler' }],
    collectibles: [{ at: 8.01, height: 1.9 }],
    music: { bpm: 136, root: 62, scale: mixolydian, progression: [0, 4, 2, 3], motif: motif(0, 2, 4, null, 2, 4, 5, null, 4, 2, null, 3, 2, null, 0, null) },
  },
  {
    ...emptyCourse, id: 'midnight-circuit', name: 'Midnight Circuit', zone: 'AFTER-HOURS TURBO',
    color: 0x4f91ff, background: 0x0b1328, floor: 0x131d35, speed: 8.7, length: 104,
    environment: 'midnight-circuit', signature: 'Dash compresses the run-up, so the second gap arrives early.', designHook: 'Two gaps and a dash portal that shortens the approach, with a kerb to land the shard jump.', hazardStyle: 'circuit-beam',
    obstacles: [[20.96, 2], [48.8, 1], [59.33, 1], [83.04, 1], [93.56, 1]],
    gaps: [{ at: 35.75, width: 2.5 }, { at: 72.51, width: 2.5 }],
    platforms: [{ at: 41.5, width: 4, height: 0.45, kind: 'kerb' }],
    portals: [{ at: 22.74, type: 'dash' }],
    enemies: [{ at: 10.44, type: 'crawler' }],
    collectibles: [{ at: 8.68, height: 1.9 }],
    music: { bpm: 140, root: 50, scale: phrygian, progression: [0, 2, 3, 4], motif: motif(0, null, 1, 3, null, 5, 3, null, 2, null, 1, null, 4, 3, 2, null) },
  },
  {
    ...emptyCourse, id: 'candy-comet', name: 'Candy Comet', zone: 'SWEET BUT SPEEDY',
    color: 0xff79b8, background: 0x27152b, floor: 0x321d38, speed: 8.8, length: 108,
    environment: 'candy-comet', signature: 'Four holes, one launcher, and a crawler waiting after the last of them.', designHook: 'Spring portal mid-course, four open gaps and a crawler at the finish line of the rhythm.', hazardStyle: 'candy-cane',
    obstacles: [[10.56, 1], [26.38, 1], [56.53, 1], [81.11, 1]],
    gaps: [{ at: 15.74, width: 2.5 }, { at: 45.89, width: 2.5 }, { at: 61.61, width: 2.5 }, { at: 85.99, width: 2.5 }],
    platforms: [{ at: 33, width: 4, height: 0.45, kind: 'kerb' }],
    portals: [{ at: 28.72, type: 'spring' }],
    enemies: [{ at: 96.64, type: 'crawler' }],
    collectibles: [{ at: 8.28, height: 1.9 }],
    music: { bpm: 126, root: 57, scale: pentatonicMajor, progression: [0, 3, 4, 0], motif: motif(0, 2, 4, null, 4, 2, 3, null, 0, null, 2, 4, null, 3, 2, null) },
  },
  {
    ...emptyCourse, id: 'aqua-pulse', name: 'Aqua Pulse', zone: 'DEEP BLUE DRIVE',
    color: 0x48f0cf, background: 0x0b202a, floor: 0x102b36, speed: 8.9, length: 112,
    environment: 'aqua-reef', signature: 'Float across four holes, then a kerb for the shard.', designHook: 'Four gaps under a float portal and one raised kerb near the end; a crawler guards the run-in.', hazardStyle: 'coral',
    obstacles: [[10.68, 1], [21.45, 1], [37.55, 2], [64.05, 1], [84.82, 1]],
    gaps: [{ at: 26.78, width: 2.5 }, { at: 53.28, width: 2.5 }, { at: 69.08, width: 2.5 }, { at: 89.75, width: 2.5 }],
    platforms: [{ at: 76, width: 4, height: 0.45, kind: 'kerb' }],
    portals: [{ at: 44.16, type: 'float' }],
    enemies: [{ at: 100.52, type: 'crawler' }],
    collectibles: [{ at: 8.23, height: 1.9 }],
    music: { bpm: 132, root: 53, scale: dorian, progression: [0, 2, 4, 3], motif: motif(0, null, 2, 3, null, 5, 3, null, 2, null, 4, 5, null, 3, 2, null) },
  },
  {
    ...emptyCourse, id: 'crystal-cavern', name: 'Crystal Cavern', zone: 'ECHOES IN THE DARK',
    color: 0x9daaff, background: 0x14172b, floor: 0x1b2139, speed: 9, length: 116,
    environment: 'crystal-cavern', signature: 'Phase through the wall of hazards, then jump the holes that follow.', designHook: 'Phase portal before a cluster, four gaps, two kerbs and a drone that closes the course.', hazardStyle: 'crystal-beam',
    obstacles: [[26.68, 1], [37.57, 1], [65.74, 1], [88.22, 1]],
    gaps: [{ at: 15.79, width: 2.5 }, { at: 54.85, width: 2.5 }, { at: 70.93, width: 2.5 }, { at: 93.51, width: 2.5 }],
    platforms: [{ at: 79, width: 4, height: 0.45, kind: 'kerb' }, { at: 44, width: 4, height: 0.45, kind: 'kerb' }],
    portals: [{ at: 39.64, type: 'phase' }],
    enemies: [{ at: 104.4, type: 'drone', height: 1.05 }, { at: 10.8, type: 'crawler' }],
    collectibles: [{ at: 9.15, height: 1.9 }, { at: 81, height: 1.9 }],
    music: { bpm: 116, root: 60, scale: phrygian, progression: [0, 3, 2, 4], motif: motif(0, null, 3, null, 5, 4, null, 2, 0, null, 1, null, 3, 5, 2, null) },
  },
  {
    ...emptyCourse, id: 'stormbreaker', name: 'Stormbreaker', zone: 'RIDE THE THUNDER',
    color: 0xff6d73, background: 0x221522, floor: 0x2a1b2b, speed: 9.1, length: 120,
    environment: 'storm-coast', signature: 'Float opens the gaps up, dash closes the last one down again.', designHook: 'Float portal early, dash portal late, four holes, two kerbs and a drone-crawler pair.', hazardStyle: 'storm-debris',
    obstacles: [[49.43, 1], [50.43, 1], [78.06, 1], [91.71, 1]],
    gaps: [{ at: 10.92, width: 2.5 }, { at: 27.49, width: 2.5 }, { at: 55.89, width: 2.5 }, { at: 97.27, width: 2.5 }],
    platforms: [{ at: 66, width: 4, height: 0.45, kind: 'kerb' }, { at: 37.5, width: 4, height: 0.45, kind: 'kerb' }],
    portals: [{ at: 31.22, type: 'float' }, { at: 59.66, type: 'dash' }],
    enemies: [{ at: 108.28, type: 'drone', height: 1.05 }, { at: 21.93, type: 'crawler' }],
    collectibles: [{ at: 9.28, height: 1.9 }, { at: 68, height: 1.9 }],
    music: { bpm: 144, root: 55, scale: mixolydian, progression: [0, 3, 4, 2], motif: motif(0, 2, null, 4, 5, null, 4, 2, 3, null, 5, null, 4, 2, 0, null) },
  },
  {
    ...emptyCourse, id: 'final-orbit', name: 'Final Orbit', zone: 'THE LAST LAUNCH',
    color: 0xe9f1ff, background: 0x101326, floor: 0x191f38, speed: 9.2, length: 124,
    environment: 'orbital-shipyard', signature: 'Spring into a dash: one arc is long, the next is fast.', designHook: 'Spring then dash across four gaps, with two kerbs and a drone holding the final stretch.', hazardStyle: 'asteroid',
    obstacles: [[27.48, 1], [28.48, 2], [58.3, 1], [74.53, 1], [92.6, 1]],
    gaps: [{ at: 16.35, width: 2.5 }, { at: 47.17, width: 2.5 }, { at: 63.4, width: 2.5 }, { at: 98.36, width: 2.5 }],
    platforms: [{ at: 82, width: 4, height: 0.45, kind: 'kerb' }, { at: 36, width: 4, height: 0.45, kind: 'kerb' }],
    portals: [{ at: 31.66, type: 'spring' }, { at: 77.6, type: 'dash' }],
    enemies: [{ at: 112.16, type: 'drone', height: 1.05 }, { at: 11.04, type: 'crawler' }],
    collectibles: [{ at: 8.55, height: 1.9 }, { at: 84, height: 1.9 }],
    music: { bpm: 150, root: 48, scale: pentatonicMinor, progression: [0, 3, 4, 2], motif: motif(0, 3, null, 4, 5, 3, null, 2, 0, null, 4, 5, null, 3, 2, null) },
  },
  {
    ...emptyCourse, id: 'mosslight-hollow', name: 'Mosslight Hollow', zone: 'FIREFLIES BELOW',
    color: 0x96e88a, background: 0x101d1a, floor: 0x182b22, speed: 9.2, length: 128,
    environment: 'mosslight-hollow', signature: 'Five holes and two kerbs: the shards are all above the step-ups.', designHook: 'Float portal, five gaps, two raised kerbs and a drone over the last third of the hollow.', hazardStyle: 'moss-stump',
    obstacles: [[22.17, 1], [38.4, 1], [61.06, 1], [77.29, 2], [88.49, 1]],
    gaps: [{ at: 27.27, width: 2.5 }, { at: 49.93, width: 2.5 }, { at: 66.17, width: 2.5 }, { at: 93.9, width: 2.5 }, { at: 105.03, width: 2.5 }],
    platforms: [{ at: 15, width: 4, height: 0.45, kind: 'kerb' }, { at: 81.5, width: 4, height: 0.45, kind: 'kerb' }],
    portals: [{ at: 43.24, type: 'float' }],
    enemies: [{ at: 116.16, type: 'drone', height: 1.05 }, { at: 11.04, type: 'crawler' }],
    collectibles: [{ at: 8.24, height: 1.9 }, { at: 19.36, height: 1.9 }],
    music: { bpm: 112, root: 57, scale: pentatonicMajor, progression: [0, 2, 3, 4], motif: motif(0, null, 2, 4, null, 2, 3, null, 4, null, 2, 0, null, 3, 2, null) },
  },
  {
    ...emptyCourse, id: 'clockwork-orchard', name: 'Clockwork Orchard', zone: 'BRASS BLOSSOMS',
    color: 0xeab76d, background: 0x211b28, floor: 0x30252e, speed: 9.3, length: 132,
    environment: 'clockwork-orchard', signature: 'Dash into spring, with gears turning between the five holes.', designHook: 'Dash and spring portals split the course; five gaps, two kerbs and a drone at the far end.', hazardStyle: 'gear-fruit',
    obstacles: [[27.88, 1], [28.88, 2], [58.78, 1], [75.29, 1], [103.11, 1]],
    gaps: [{ at: 16.63, width: 2.5 }, { at: 44.83, width: 2.5 }, { at: 64.04, width: 2.5 }, { at: 91.86, width: 2.5 }, { at: 108.79, width: 2.5 }],
    platforms: [{ at: 51, width: 4, height: 0.45, kind: 'kerb' }, { at: 82.5, width: 4, height: 0.45, kind: 'kerb' }],
    portals: [{ at: 31.59, type: 'dash' }, { at: 78.11, type: 'spring' }],
    enemies: [{ at: 120.04, type: 'drone', height: 1.05 }, { at: 11.16, type: 'crawler' }],
    collectibles: [{ at: 8.64, height: 1.9 }, { at: 16.47, height: 1.87 }],
    music: { bpm: 120, root: 59, scale: mixolydian, progression: [0, 3, 4, 0], motif: motif(0, 2, 4, null, 3, 2, null, 4, 5, null, 2, 0, null, 3, 4, null) },
  },
  {
    ...emptyCourse, id: 'tidal-foundry', name: 'Tidal Foundry', zone: 'PRESSURE AND STEEL',
    color: 0x57e2da, background: 0x10252e, floor: 0x18313a, speed: 9.3, length: 136,
    environment: 'tidal-foundry', signature: 'One dash portal, five gaps, no second chances on the landing.', designHook: 'Dash portal before the middle gap, two kerbs for shards, crawler and drone on the closing run.', hazardStyle: 'foundry-pipe',
    obstacles: [[27.57, 1], [38.82, 1], [67.19, 1], [83.7, 2], [107.42, 1]],
    gaps: [{ at: 16.32, width: 2.5 }, { at: 53.24, width: 2.5 }, { at: 72.45, width: 2.5 }, { at: 96.17, width: 2.5 }, { at: 112.79, width: 2.5 }],
    platforms: [{ at: 59.5, width: 4, height: 0.45, kind: 'kerb' }, { at: 31, width: 4, height: 0.45, kind: 'kerb' }],
    portals: [{ at: 40.55, type: 'dash' }],
    enemies: [{ at: 124.04, type: 'drone', height: 1.05 }, { at: 11.16, type: 'crawler' }],
    collectibles: [{ at: 8.41, height: 1.9 }, { at: 16.18, height: 1.86 }],
    music: { bpm: 138, root: 52, scale: dorian, progression: [0, 3, 2, 4], motif: motif(0, 2, null, 3, 5, null, 4, 2, null, 3, 4, null, 2, 0, null, 3) },
  },
  {
    ...emptyCourse, id: 'paper-moon-parade', name: 'Paper Moon Parade', zone: 'FOLDED NIGHT SKY',
    color: 0xffd99a, background: 0x24213b, floor: 0x302c49, speed: 9.4, length: 140,
    environment: 'paper-moon', signature: 'Two springs, five gaps: the parade never quite touches the ground.', designHook: 'Spring portals at both ends of the course, five holes, two kerbs and a drone in between.', hazardStyle: 'paper-banner',
    obstacles: [[28.39, 1], [45.5, 1], [75.34, 1], [92.35, 2], [127.72, 1], [128.72, 1]],
    gaps: [{ at: 17.02, width: 2.5 }, { at: 34.13, width: 2.5 }, { at: 63.97, width: 2.5 }, { at: 80.98, width: 2.5 }, { at: 116.35, width: 2.5 }],
    platforms: [{ at: 100, width: 4, height: 0.45, kind: 'kerb' }, { at: 53, width: 4, height: 0.45, kind: 'kerb' }],
    portals: [{ at: 48.64, type: 'spring' }, { at: 95.49, type: 'spring' }],
    enemies: [{ at: 110.82, type: 'drone', height: 1.05 }, { at: 11.28, type: 'crawler' }],
    collectibles: [{ at: 9.37, height: 1.9 }, { at: 16.88, height: 1.8 }],
    music: { bpm: 126, root: 62, scale: pentatonicMajor, progression: [0, 4, 2, 3], motif: motif(0, 2, 4, null, 2, 3, 5, null, 4, 2, null, 3, 2, null, 0, null) },
  },
  {
    ...emptyCourse, id: 'verdant-relay', name: 'Verdant Relay', zone: 'SEEDLIGHT CIRCUIT',
    color: 0x8bf2a7, background: 0x101f20, floor: 0x19302b, speed: 9.4, length: 144,
    environment: 'verdant-greenhouse', signature: 'Float through five holes and three shards spaced a beat apart.', designHook: 'Float portal, five gaps, two kerbs and the campaign\'s densest run of shards.', hazardStyle: 'thorn',
    obstacles: [[27.97, 1], [50.82, 1], [51.82, 1], [74.68, 1], [91.68, 1], [120.07, 1], [131.44, 2]],
    gaps: [{ at: 16.6, width: 2.5 }, { at: 39.45, width: 2.5 }, { at: 63.31, width: 2.5 }, { at: 80.31, width: 2.5 }, { at: 108.7, width: 2.5 }],
    platforms: [{ at: 95, width: 4, height: 0.45, kind: 'kerb' }, { at: 123, width: 4, height: 0.45, kind: 'kerb' }],
    portals: [{ at: 53.78, type: 'float' }],
    enemies: [{ at: 103.17, type: 'drone', height: 1.05 }, { at: 11.28, type: 'crawler' }],
    collectibles: [{ at: 8.98, height: 1.9 }, { at: 16.44, height: 1.79 }, { at: 25.9, height: 1.9 }],
    music: { bpm: 120, root: 55, scale: pentatonicMajor, progression: [0, 2, 4, 3], motif: motif(0, null, 2, 4, null, 3, 2, null, 4, 5, null, 2, 0, null, 3, 2) },
  },
  {
    ...emptyCourse, id: 'shatterglass-express', name: 'Shatterglass Express', zone: 'PRISM TRAIN RUN',
    color: 0x9fdcff, background: 0x15142d, floor: 0x232248, speed: 9.5, length: 146,
    environment: 'shatterglass', signature: 'Phase then dash: skip a hazard wall, then outrun the glass.', designHook: 'Phase and dash portals, five gaps, two kerbs and a drone on the express straight.', hazardStyle: 'glass-shard',
    obstacles: [[28.37, 1], [47.49, 1], [48.49, 1], [72.01, 1], [92.21, 1], [121.83, 1], [133.32, 2]],
    gaps: [{ at: 16.88, width: 2.5 }, { at: 40.7, width: 2.5 }, { at: 63.59, width: 2.5 }, { at: 77.96, width: 2.5 }, { at: 110.34, width: 2.5 }],
    platforms: [{ at: 96, width: 4, height: 0.45, kind: 'kerb' }, { at: 84.5, width: 4, height: 0.45, kind: 'kerb' }],
    portals: [{ at: 34.17, type: 'phase' }, { at: 55.59, type: 'dash' }],
    enemies: [{ at: 104.53, type: 'drone', height: 1.05 }, { at: 11.4, type: 'crawler' }],
    collectibles: [{ at: 9, height: 1.9 }, { at: 16.75, height: 1.83 }],
    music: { bpm: 148, root: 60, scale: phrygian, progression: [0, 3, 2, 4], motif: motif(0, 1, 3, null, 5, 4, null, 2, 0, null, 1, 3, null, 5, 2, null) },
  },
  {
    ...emptyCourse, id: 'cloudbreaker-causeway', name: 'Cloudbreaker Causeway', zone: 'ABOVE THE WEATHER',
    color: 0xb2d8ff, background: 0x192b4a, floor: 0x263b5b, speed: 9.5, length: 148,
    environment: 'cloudbreaker', signature: 'Shield for the wall, then six gaps to spend it before.', designHook: 'Shield portal early, six open gaps, two kerbs and a drone near the causeway end.', hazardStyle: 'cloudstone',
    obstacles: [[23.89, 1], [47.84, 1], [65.13, 1], [89.08, 1], [106.06, 2], [135.6, 1], [136.6, 1]],
    gaps: [{ at: 17.1, width: 2.5 }, { at: 36.35, width: 2.5 }, { at: 53.64, width: 2.5 }, { at: 77.59, width: 2.5 }, { at: 94.57, width: 2.5 }, { at: 124.11, width: 2.5 }],
    platforms: [{ at: 110.5, width: 4, height: 0.45, kind: 'kerb' }, { at: 27, width: 4, height: 0.45, kind: 'kerb' }],
    portals: [{ at: 70.36, type: 'shield' }],
    enemies: [{ at: 118.52, type: 'drone', height: 1.05 }, { at: 11.4, type: 'crawler' }],
    collectibles: [{ at: 8.68, height: 1.9 }, { at: 16.93, height: 1.89 }],
    music: { bpm: 128, root: 57, scale: pentatonicMajor, progression: [0, 4, 3, 2], motif: motif(0, 2, 4, null, 5, 4, null, 2, 3, null, 4, 2, null, 3, 0, null) },
  },
  {
    ...emptyCourse, id: 'magnetar-foundry', name: 'Magnetar Foundry', zone: 'IRON IN ORBIT',
    color: 0x5bc8ff, background: 0x0d1a2c, floor: 0x152a3f, speed: 9.6, length: 149,
    environment: 'magnetar-forge', signature: 'Two dash portals, five holes, and a drone waiting after the second.', designHook: 'Dash at the top and bottom of the course, five gaps, two kerbs and the hardest spacing in the campaign.', hazardStyle: 'magnetic-core',
    obstacles: [[28.67, 1], [45.61, 1], [75.02, 1], [87.74, 1], [88.74, 1], [104.75, 1], [119.15, 1], [136.2, 2]],
    gaps: [{ at: 17.06, width: 2.5 }, { at: 34, width: 2.5 }, { at: 60.62, width: 2.5 }, { at: 80.88, width: 2.5 }, { at: 124.59, width: 2.5 }],
    platforms: [{ at: 110, width: 4, height: 0.45, kind: 'kerb' }, { at: 67, width: 4, height: 0.45, kind: 'kerb' }],
    portals: [{ at: 49.66, type: 'dash' }, { at: 92.8, type: 'dash' }],
    enemies: [{ at: 103.75, type: 'drone', height: 1.05 }, { at: 11.52, type: 'crawler' }],
    collectibles: [{ at: 9.02, height: 1.9 }, { at: 16.91, height: 1.84 }],
    music: { bpm: 152, root: 48, scale: phrygian, progression: [0, 2, 3, 4], motif: motif(0, 2, null, 4, 5, null, 4, 2, 3, null, 5, 4, null, 2, 0, null) },
  },
  {
    ...emptyCourse, id: 'eclipse-crown', name: 'Eclipse Crown', zone: 'THE LAST LIGHT',
    color: 0xffd86d, background: 0x14152d, floor: 0x242747, speed: 9.6, length: 150,
    environment: 'eclipse-observatory', signature: 'Shield and float, five holes, three shards: the finale asks for both.', designHook: 'Shield then float, five gaps, two kerbs and every mechanic the campaign has taught.', hazardStyle: 'corona',
    obstacles: [[28.78, 1], [46.26, 1], [57.87, 2], [87.76, 1], [104.8, 1], [105.8, 1], [125.08, 1], [126.08, 1], [138.48, 1]],
    gaps: [{ at: 17.17, width: 2.5 }, { at: 34.64, width: 2.5 }, { at: 76.14, width: 2.5 }, { at: 93.19, width: 2.5 }, { at: 131.62, width: 2.5 }],
    platforms: [{ at: 49.5, width: 4, height: 0.45, kind: 'kerb' }, { at: 39.5, width: 4, height: 0.45, kind: 'kerb' }],
    portals: [{ at: 65.54, type: 'shield' }, { at: 113.48, type: 'float' }],
    enemies: [{ at: 124.08, type: 'drone', height: 1.05 }, { at: 11.52, type: 'crawler' }],
    collectibles: [{ at: 9.1, height: 1.9 }, { at: 17.04, height: 1.85 }, { at: 26.38, height: 1.9 }],
    music: { bpm: 154, root: 50, scale: pentatonicMinor, progression: [0, 3, 4, 2], motif: motif(0, 3, null, 4, 5, 3, null, 2, 0, null, 4, 5, null, 3, 2, null) },
  },
];

const portalTypes = new Set(['spring', 'dash', 'float', 'shield', 'phase']);
const enemyTypes = new Set(['crawler', 'drone']);

export function validateLevels(catalog) {
  if (!Array.isArray(catalog) || catalog.length !== 20) throw new Error('The campaign must contain exactly twenty playable levels.');
  const ids = new Set();
  const names = new Set();
  const signatures = new Set();
  const environments = new Set();
  for (const level of catalog) {
    if (!level.id || ids.has(level.id)) throw new Error(`Missing or duplicate level id: ${level.id}`);
    if (!level.name || names.has(level.name)) throw new Error(`Missing or duplicate level name: ${level.name}`);
    if (!level.signature || signatures.has(level.signature)) throw new Error(`${level.name} needs a unique signature mechanic.`);
    if (!level.environment || environments.has(level.environment)) throw new Error(`${level.name} needs a unique visual environment.`);
    ids.add(level.id);
    names.add(level.name);
    signatures.add(level.signature);
    environments.add(level.environment);
    if (level.speed < 6 || level.speed > 11 || level.length < 40 || level.length > 150) throw new Error(`${level.name} has invalid speed or course length.`);
    if (!Number.isInteger(level.music?.bpm) || level.music.bpm < 80 || level.music.bpm > 160) throw new Error(`${level.name} has invalid music tempo.`);
    if (!Array.isArray(level.music.scale) || level.music.scale.length < 5 || level.music.motif?.length !== 16) throw new Error(`${level.name} has incomplete music data.`);
    if (!Array.isArray(level.obstacles) || level.obstacles.length < 3) throw new Error(`${level.name} needs at least three hazard groups.`);
    let previousEnd = 0;
    for (const [distance, count] of level.obstacles) {
      if (!Number.isFinite(distance) || !Number.isInteger(count) || count < 1 || count > 2) throw new Error(`${level.name} contains an invalid obstacle group.`);
      if (distance <= previousEnd || distance + (count - 1) * 1.28 >= level.length - 3) throw new Error(`${level.name} has unsorted hazards or a hazard too near the finish.`);
      previousEnd = distance + (count - 1) * 1.28;
    }
    for (const key of ['gaps', 'platforms', 'portals', 'enemies', 'collectibles']) {
      if (!Array.isArray(level[key])) throw new Error(`${level.name} is missing its ${key} list.`);
    }
    for (const gap of level.gaps) {
      if (!Number.isFinite(gap.at) || gap.at < 3 || !Number.isFinite(gap.width) || gap.width < 2.5 || gap.width > 5 || gap.at + gap.width > level.length - 2) throw new Error(`${level.name} has an invalid gap.`);
    }
    for (const platform of level.platforms) {
      if (!Number.isFinite(platform.at) || platform.at < 3 || !Number.isFinite(platform.width) || platform.width < 2.5 || !Number.isFinite(platform.height) || platform.height < 0 || platform.height > .7 || platform.at + platform.width > level.length - 2) throw new Error(`${level.name} has an invalid platform.`);
    }
    for (const portal of level.portals) {
      if (!Number.isFinite(portal.at) || portal.at < 3 || portal.at > level.length - 3 || !portalTypes.has(portal.type)) throw new Error(`${level.name} has an invalid portal.`);
    }
    for (const enemy of level.enemies) {
      if (!Number.isFinite(enemy.at) || enemy.at < 3 || enemy.at > level.length - 3 || !enemyTypes.has(enemy.type)) throw new Error(`${level.name} has an invalid enemy.`);
    }
    for (const collectible of level.collectibles) {
      if (!Number.isFinite(collectible.at) || collectible.at < 3 || collectible.at > level.length - 3 || !Number.isFinite(collectible.height ?? 1.7)) throw new Error(`${level.name} has an invalid collectible.`);
    }
    // Every jump-triggering beat must sit in the combo band or beyond the
    // reaction gap. The 0.80–1.35 reach dead band is never allowed.
    const inputBeats = beatWindows(level).filter(({ kind }) => kind === 'hazard' || kind === 'gap' || kind === 'enemy');
    for (let index = 1; index < inputBeats.length; index++) {
      const previous = inputBeats[index - 1];
      const beat = inputBeats[index];
      const distance = beat.at - previous.at;
      if (distance <= 0) throw new Error(`${level.name} has overlapping beats at ${beat.at}.`);
      if (distance > .8 * beat.reach && distance < 1.35 * beat.reach) throw new Error(`${level.name} puts ${beat.id} inside the unfair reaction band (${distance.toFixed(2)} units after ${previous.id}).`);
      if (beat.at - previous.courseEnd < .75) throw new Error(`${level.name} starts ${beat.id} only ${(beat.at - previous.courseEnd).toFixed(2)} units after ${previous.id}'s end.`);
      if (previous.kind === 'gap' && beat.at - previous.courseEnd < .5 * beat.reach) throw new Error(`${level.name} leaves too little landing clearance after ${previous.id}.`);
    }
  }
  return true;
}

export function getLevel(id) {
  return levels.find((level) => level.id === id);
}

export let levelValidationError = null;
try { validateLevels(levels); } catch (error) { levelValidationError = error; console.error('Course data failed validation.', error); }
