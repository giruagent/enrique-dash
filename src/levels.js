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
    environment: 'neon-city', signature: 'Three open gaps on a clean straight, each one a single jump.', designHook: 'Neon Run lays out 3 spike groups and 3 gaps.', hazardStyle: 'spike',
    obstacles: [[9.84, 1], [31.54, 2], [68.16, 1]],
    gaps: [{ at: 13.5, width: 2.5 }, { at: 49.58, width: 2.5 }, { at: 60.58, width: 2.5 }],
    platforms: [],
    portals: [],
    enemies: [],
    collectibles: [],
    music: { bpm: 118, root: 57, scale: pentatonicMinor, progression: [0, 3, 2, 4], motif: motif(0, null, 2, null, 4, 2, null, 3, 0, null, 2, null, 4, 3, 2, null) },
  },
  {
    ...emptyCourse, id: 'skyline-rush', name: 'Skyline Rush', zone: 'CITY AFTER DARK',
    color: 0x56d9ff, background: 0x0a182b, floor: 0x10243a, speed: 8.4, length: 88,
    environment: 'skyline-rooftops', signature: 'A float portal stretches the arc you need over the middle hole.', designHook: 'Skyline Rush lays out 4 vent groups, 3 gaps, 1 portal (float) and 1 shard.', hazardStyle: 'vent',
    obstacles: [[10.08, 1], [34.59, 1], [59.1, 1], [77.92, 1]],
    gaps: [{ at: 26.88, width: 2.5 }, { at: 51.39, width: 2.5 }, { at: 70.21, width: 2.5 }],
    platforms: [],
    portals: [{ at: 36.6, type: 'float' }],
    enemies: [],
    collectibles: [{ at: 8.56, height: 1.85 }],
    music: { bpm: 124, root: 60, scale: pentatonicMajor, progression: [0, 4, 3, 4], motif: motif(0, null, 2, 4, null, 2, 4, null, 3, null, 2, null, 4, 2, 0, null) },
  },
  {
    ...emptyCourse, id: 'solar-flare', name: 'Solar Flare', zone: 'HEAT OF THE MOMENT',
    color: 0xff9d52, background: 0x291528, floor: 0x301d2b, speed: 8.5, length: 92,
    environment: 'solar-desert', signature: 'A spring portal turns the last gap into a long, slow hop.', designHook: 'Solar Flare lays out 4 solar panel groups, 3 gaps, 1 portal (spring) and 1 shard.', hazardStyle: 'solar-panel',
    obstacles: [[10.2, 1], [34.99, 1], [59.78, 1], [81.8, 1]],
    gaps: [{ at: 27.2, width: 2.5 }, { at: 51.99, width: 2.5 }, { at: 74.01, width: 2.5 }],
    platforms: [],
    portals: [{ at: 37.03, type: 'spring' }],
    enemies: [],
    collectibles: [{ at: 8.6, height: 1.85 }],
    music: { bpm: 130, root: 52, scale: dorian, progression: [0, 3, 4, 2], motif: motif(0, 2, null, 3, 4, null, 5, 4, 3, null, 2, null, 4, 5, 3, null) },
  },
  {
    ...emptyCourse, id: 'gravity-garden', name: 'Gravity Garden', zone: 'A DIFFERENT RHYTHM',
    color: 0xc18aff, background: 0x17142a, floor: 0x1e1b35, speed: 8.5, length: 96,
    environment: 'gravity-garden', signature: 'Float first, so both gaps ask for a lazier jump than they look.', designHook: 'Gravity Garden lays out 5 vine groups, 3 gaps, 1 portal (float) and 1 shard.', hazardStyle: 'vine',
    obstacles: [[10.2, 1], [21.71, 1], [49.86, 1], [78.01, 1], [85.8, 1]],
    gaps: [{ at: 13.92, width: 2.5 }, { at: 42.07, width: 2.5 }, { at: 70.22, width: 2.5 }],
    platforms: [],
    portals: [{ at: 24.15, type: 'float' }],
    enemies: [],
    collectibles: [{ at: 8.96, height: 1.85 }],
    music: { bpm: 110, root: 55, scale: pentatonicMajor, progression: [0, 2, 4, 3], motif: motif(0, null, 4, 2, null, 3, 4, null, 2, null, 0, 2, null, 4, 3, null) },
  },
  {
    ...emptyCourse, id: 'pixel-pier', name: 'Pixel Pier', zone: 'ARCADE BY THE SEA',
    color: 0xffdf6e, background: 0x171b30, floor: 0x22233a, speed: 8.6, length: 100,
    environment: 'pixel-pier', signature: 'A crawler on the opening straight, then a kerb you jump onto for the shard.', designHook: 'Pixel Pier lays out 4 pixel block groups, 3 gaps, 1 kerb, 1 portal (spring), 1 crawler and 2 shards.', hazardStyle: 'pixel-block',
    obstacles: [[21.89, 1], [51.84, 1], [81.8, 1], [89.68, 1]],
    gaps: [{ at: 14.01, width: 2.5 }, { at: 43.96, width: 2.5 }, { at: 73.91, width: 2.5 }],
    platforms: [{ at: 29.5, width: 4.5, height: 0.45, kind: 'kerb' }],
    portals: [{ at: 24.54, type: 'spring' }],
    enemies: [{ at: 10.32, type: 'crawler' }],
    collectibles: [{ at: 9.15, height: 1.85 }, { at: 31.75, height: 1.65 }],
    music: { bpm: 136, root: 62, scale: mixolydian, progression: [0, 4, 2, 3], motif: motif(0, 2, 4, null, 2, 4, 5, null, 4, 2, null, 3, 2, null, 0, null) },
  },
  {
    ...emptyCourse, id: 'midnight-circuit', name: 'Midnight Circuit', zone: 'AFTER-HOURS TURBO',
    color: 0x4f91ff, background: 0x0b1328, floor: 0x131d35, speed: 8.7, length: 104,
    environment: 'midnight-circuit', signature: 'Dash compresses the run-up, so the second gap arrives early.', designHook: 'Midnight Circuit lays out 5 circuit beam groups, 2 gaps, 1 kerb, 1 portal (dash), 1 crawler and 2 shards.', hazardStyle: 'circuit-beam',
    obstacles: [[18.41, 2], [48.01, 1], [57.9, 1], [85.59, 1], [93.56, 1]],
    gaps: [{ at: 38.12, width: 2.5 }, { at: 77.61, width: 2.5 }],
    platforms: [{ at: 64.5, width: 4.5, height: 0.45, kind: 'kerb' }],
    portals: [{ at: 20.78, type: 'dash' }],
    enemies: [{ at: 10.44, type: 'crawler' }],
    collectibles: [{ at: 9.22, height: 1.85 }, { at: 66.75, height: 1.65 }],
    music: { bpm: 140, root: 50, scale: phrygian, progression: [0, 2, 3, 4], motif: motif(0, null, 1, 3, null, 5, 3, null, 2, null, 1, null, 4, 3, 2, null) },
  },
  {
    ...emptyCourse, id: 'candy-comet', name: 'Candy Comet', zone: 'SWEET BUT SPEEDY',
    color: 0xff79b8, background: 0x27152b, floor: 0x321d38, speed: 8.8, length: 108,
    environment: 'candy-comet', signature: 'Four holes, one launcher, and a crawler waiting after the last of them.', designHook: 'Candy Comet lays out 4 candy cane groups, 4 gaps, 1 kerb, 1 portal (spring), 1 crawler and 2 shards.', hazardStyle: 'candy-cane',
    obstacles: [[10.56, 1], [22.55, 1], [55.82, 1], [84.88, 1]],
    gaps: [{ at: 14.48, width: 2.5 }, { at: 47.75, width: 2.5 }, { at: 59.67, width: 2.5 }, { at: 88.57, width: 2.5 }],
    platforms: [{ at: 31.5, width: 4.5, height: 0.45, kind: 'kerb' }],
    portals: [{ at: 25.57, type: 'spring' }],
    enemies: [{ at: 96.64, type: 'crawler' }],
    collectibles: [{ at: 9.12, height: 1.85 }, { at: 33.75, height: 1.65 }],
    music: { bpm: 126, root: 57, scale: pentatonicMajor, progression: [0, 3, 4, 0], motif: motif(0, 2, 4, null, 4, 2, 3, null, 0, null, 2, 4, null, 3, 2, null) },
  },
  {
    ...emptyCourse, id: 'aqua-pulse', name: 'Aqua Pulse', zone: 'DEEP BLUE DRIVE',
    color: 0x48f0cf, background: 0x0b202a, floor: 0x102b36, speed: 8.9, length: 112,
    environment: 'aqua-reef', signature: 'Float across four holes, then a kerb for the shard.', designHook: 'Aqua Pulse lays out 5 coral groups, 4 gaps, 1 kerb, 1 portal (float), 1 crawler and 2 shards.', hazardStyle: 'coral',
    obstacles: [[10.68, 1], [18.84, 1], [30.96, 1], [61.81, 1], [88.24, 1]],
    gaps: [{ at: 22.8, width: 2.5 }, { at: 53.65, width: 2.5 }, { at: 65.55, width: 2.5 }, { at: 92.36, width: 2.5 }],
    platforms: [{ at: 76, width: 4.5, height: 0.45, kind: 'kerb' }],
    portals: [{ at: 34.82, type: 'float' }],
    enemies: [{ at: 100.52, type: 'crawler' }],
    collectibles: [{ at: 9.23, height: 1.85 }, { at: 78.25, height: 1.65 }],
    music: { bpm: 132, root: 53, scale: dorian, progression: [0, 2, 4, 3], motif: motif(0, null, 2, 3, null, 5, 3, null, 2, null, 4, 5, null, 3, 2, null) },
  },
  {
    ...emptyCourse, id: 'crystal-cavern', name: 'Crystal Cavern', zone: 'ECHOES IN THE DARK',
    color: 0x9daaff, background: 0x14172b, floor: 0x1b2139, speed: 9, length: 116,
    environment: 'crystal-cavern', signature: 'Phase through the wall of hazards, then jump the holes that follow.', designHook: 'Crystal Cavern lays out 4 crystal beam groups, 4 gaps, 1 kerb and 1 island, 1 portal (phase), 1 drone and 1 crawler and 3 shards.', hazardStyle: 'crystal-beam',
    obstacles: [[22.83, 1], [31.08, 1], [63.77, 1], [92.14, 1]],
    gaps: [{ at: 14.58, width: 2.5 }, { at: 55.52, width: 2.5 }, { at: 67.7, width: 4.9 }, { at: 96.15, width: 2.5 }],
    platforms: [{ at: 79, width: 4.5, height: 0.45, kind: 'kerb' }, { at: 67.7, width: 2.5, height: 0.5, kind: 'island' }],
    portals: [{ at: 34.01, type: 'phase' }],
    enemies: [{ at: 104.4, type: 'drone', height: 1.05 }, { at: 10.8, type: 'crawler' }],
    collectibles: [{ at: 9.5, height: 1.85 }, { at: 81.25, height: 1.65 }, { at: 68.95, height: 1.7 }],
    music: { bpm: 116, root: 60, scale: phrygian, progression: [0, 3, 2, 4], motif: motif(0, null, 3, null, 5, 4, null, 2, 0, null, 1, null, 3, 5, 2, null) },
  },
  {
    ...emptyCourse, id: 'stormbreaker', name: 'Stormbreaker', zone: 'RIDE THE THUNDER',
    color: 0xff6d73, background: 0x221522, floor: 0x2a1b2b, speed: 9.1, length: 120,
    environment: 'storm-coast', signature: 'Float opens the gaps up, dash closes the last one down again.', designHook: 'Stormbreaker lays out 4 storm debris groups, 4 gaps, 1 kerb and 1 island, 2 portals (float and dash), 1 drone and 1 crawler and 3 shards.', hazardStyle: 'storm-debris',
    obstacles: [[11.92, 1], [43.5, 1], [55.82, 1], [93.62, 1]],
    gaps: [{ at: 16.05, width: 4.9 }, { at: 47.48, width: 2.5 }, { at: 83.28, width: 2.5 }, { at: 97.94, width: 2.5 }],
    platforms: [{ at: 66, width: 4.5, height: 0.45, kind: 'kerb' }, { at: 16.05, width: 2.5, height: 0.5, kind: 'island' }],
    portals: [{ at: 19.35, type: 'float' }, { at: 59.12, type: 'dash' }],
    enemies: [{ at: 108.28, type: 'drone', height: 1.05 }, { at: 10.92, type: 'crawler' }],
    collectibles: [{ at: 9.98, height: 1.81 }, { at: 68.25, height: 1.65 }, { at: 17.3, height: 1.7 }],
    music: { bpm: 144, root: 55, scale: mixolydian, progression: [0, 3, 4, 2], motif: motif(0, 2, null, 4, 5, null, 4, 2, 3, null, 5, null, 4, 2, 0, null) },
  },
  {
    ...emptyCourse, id: 'final-orbit', name: 'Final Orbit', zone: 'THE LAST LAUNCH',
    color: 0xe9f1ff, background: 0x101326, floor: 0x191f38, speed: 9.2, length: 124,
    environment: 'orbital-shipyard', signature: 'Spring into a dash: one arc is long, the next is fast.', designHook: 'Final Orbit lays out 5 asteroid groups, 4 gaps, 1 kerb and 1 island, 2 portals (spring and dash), 1 drone and 1 crawler and 3 shards.', hazardStyle: 'asteroid',
    obstacles: [[23.73, 1], [32.16, 1], [62.78, 1], [75.15, 2], [97.34, 1]],
    gaps: [{ at: 15.3, width: 2.5 }, { at: 54.34, width: 2.5 }, { at: 66.72, width: 2.5 }, { at: 101.7, width: 4.9 }],
    platforms: [{ at: 84.5, width: 4.5, height: 0.45, kind: 'kerb' }, { at: 101.7, width: 2.5, height: 0.5, kind: 'island' }],
    portals: [{ at: 34.82, type: 'spring' }, { at: 77.82, type: 'dash' }],
    enemies: [{ at: 112.16, type: 'drone', height: 1.05 }, { at: 11.04, type: 'crawler' }],
    collectibles: [{ at: 9.69, height: 1.85 }, { at: 86.75, height: 1.65 }, { at: 102.95, height: 1.7 }],
    music: { bpm: 150, root: 48, scale: pentatonicMinor, progression: [0, 3, 4, 2], motif: motif(0, 3, null, 4, 5, 3, null, 2, 0, null, 4, 5, null, 3, 2, null) },
  },
  {
    ...emptyCourse, id: 'mosslight-hollow', name: 'Mosslight Hollow', zone: 'FIREFLIES BELOW',
    color: 0x96e88a, background: 0x101d1a, floor: 0x182b22, speed: 9.2, length: 128,
    environment: 'mosslight-hollow', signature: 'Five holes and two kerbs: the shards are all above the step-ups.', designHook: 'Mosslight Hollow lays out 5 moss stump groups, 4 gaps, 1 kerb, 1 island and 1 perch, 1 portal (float), 1 drone and 2 crawlers and 4 shards.', hazardStyle: 'moss-stump',
    obstacles: [[12.04, 1], [24.34, 1], [63.94, 1], [95.27, 1], [103.7, 1]],
    gaps: [{ at: 15.91, width: 2.5 }, { at: 55.51, width: 2.5 }, { at: 68.2, width: 4.9 }, { at: 107.73, width: 2.5 }],
    platforms: [{ at: 35.5, width: 4.5, height: 0.45, kind: 'kerb' }, { at: 68.2, width: 2.5, height: 0.5, kind: 'island' }, { at: 49.16, width: 4.5, height: 0.45, kind: 'perch' }],
    portals: [{ at: 27.59, type: 'float' }],
    enemies: [{ at: 116.16, type: 'drone', height: 1.05 }, { at: 11.04, type: 'crawler' }, { at: 51.41, type: 'crawler' }],
    collectibles: [{ at: 10.1, height: 1.84 }, { at: 15.79, height: 1.75 }, { at: 37.75, height: 1.65 }, { at: 69.45, height: 1.7 }],
    music: { bpm: 112, root: 57, scale: pentatonicMajor, progression: [0, 2, 3, 4], motif: motif(0, null, 2, 4, null, 2, 3, null, 4, null, 2, 0, null, 3, 2, null) },
  },
  {
    ...emptyCourse, id: 'clockwork-orchard', name: 'Clockwork Orchard', zone: 'BRASS BLOSSOMS',
    color: 0xeab76d, background: 0x211b28, floor: 0x30252e, speed: 9.3, length: 132,
    environment: 'clockwork-orchard', signature: 'Dash into spring, with gears turning between the five holes.', designHook: 'Clockwork Orchard lays out 4 gear fruit groups, 5 gaps, 1 kerb, 1 island and 1 perch, 2 portals (dash and spring), 1 drone and 2 crawlers and 4 shards.', hazardStyle: 'gear-fruit',
    obstacles: [[32.28, 1], [63.43, 1], [78.42, 2], [107.53, 1]],
    gaps: [{ at: 15.23, width: 2.5 }, { at: 52.86, width: 4.9 }, { at: 67.85, width: 2.5 }, { at: 99, width: 2.5 }, { at: 111.52, width: 2.5 }],
    platforms: [{ at: 39, width: 4.5, height: 0.45, kind: 'kerb' }, { at: 52.86, width: 2.5, height: 0.5, kind: 'island' }, { at: 21.5, width: 4.5, height: 0.45, kind: 'perch' }],
    portals: [{ at: 34.75, type: 'dash' }, { at: 80.89, type: 'spring' }],
    enemies: [{ at: 120.04, type: 'drone', height: 1.05 }, { at: 11.16, type: 'crawler' }, { at: 23.75, type: 'crawler' }],
    collectibles: [{ at: 9.81, height: 1.85 }, { at: 15.06, height: 1.66 }, { at: 41.25, height: 1.65 }, { at: 54.11, height: 1.7 }],
    music: { bpm: 120, root: 59, scale: mixolydian, progression: [0, 3, 4, 0], motif: motif(0, 2, 4, null, 3, 2, null, 4, 5, null, 2, 0, null, 3, 4, null) },
  },
  {
    ...emptyCourse, id: 'tidal-foundry', name: 'Tidal Foundry', zone: 'PRESSURE AND STEEL',
    color: 0x57e2da, background: 0x10252e, floor: 0x18313a, speed: 9.3, length: 136,
    environment: 'tidal-foundry', signature: 'One dash portal, five gaps, no second chances on the landing.', designHook: 'Tidal Foundry lays out 4 foundry pipe groups, 5 gaps, 1 kerb, 1 island and 1 perch, 1 portal (dash), 1 drone and 2 crawlers and 4 shards.', hazardStyle: 'foundry-pipe',
    obstacles: [[32.12, 1], [65.31, 1], [80.3, 2], [111.45, 1]],
    gaps: [{ at: 15.07, width: 2.5 }, { at: 54.74, width: 4.9 }, { at: 69.73, width: 2.5 }, { at: 102.92, width: 2.5 }, { at: 115.52, width: 2.5 }],
    platforms: [{ at: 40, width: 4.5, height: 0.45, kind: 'kerb' }, { at: 54.74, width: 2.5, height: 0.5, kind: 'island' }, { at: 21.34, width: 4.5, height: 0.45, kind: 'perch' }],
    portals: [{ at: 34.83, type: 'dash' }],
    enemies: [{ at: 124.04, type: 'drone', height: 1.05 }, { at: 11.16, type: 'crawler' }, { at: 23.59, type: 'crawler' }],
    collectibles: [{ at: 9.81, height: 1.85 }, { at: 14.91, height: 1.61 }, { at: 42.25, height: 1.65 }, { at: 55.99, height: 1.7 }],
    music: { bpm: 138, root: 52, scale: dorian, progression: [0, 3, 2, 4], motif: motif(0, 2, null, 3, 5, null, 4, 2, null, 3, 4, null, 2, 0, null, 3) },
  },
  {
    ...emptyCourse, id: 'paper-moon-parade', name: 'Paper Moon Parade', zone: 'FOLDED NIGHT SKY',
    color: 0xffd99a, background: 0x24213b, floor: 0x302c49, speed: 9.4, length: 140,
    environment: 'paper-moon', signature: 'Two springs, five gaps: the parade never quite touches the ground.', designHook: 'Paper Moon Parade lays out 5 paper banner groups, 5 gaps, 2 shelfs and 1 perch, 2 portals (spring), 1 drone and 2 crawlers and 4 shards.', hazardStyle: 'paper-banner',
    obstacles: [[36.73, 2], [70.16, 1], [82.73, 1], [120.1, 1], [128.72, 1]],
    gaps: [{ at: 15.39, width: 2.5 }, { at: 28.12, width: 2.5 }, { at: 61.54, width: 2.5 }, { at: 74.11, width: 2.5 }, { at: 111.49, width: 2.5 }],
    platforms: [{ at: 90, width: 10, height: 0.5, kind: 'shelf' }, { at: 43.5, width: 10, height: 0.5, kind: 'shelf' }, { at: 21.76, width: 4.5, height: 0.45, kind: 'perch' }],
    portals: [{ at: 39.71, type: 'spring' }, { at: 85.7, type: 'spring' }],
    enemies: [{ at: 107.54, type: 'drone', height: 1.05 }, { at: 11.28, type: 'crawler' }, { at: 24.01, type: 'crawler' }],
    collectibles: [{ at: 9.92, height: 1.85 }, { at: 15.25, height: 1.67 }, { at: 99.45, height: 1.7 }, { at: 52.95, height: 1.7 }],
    music: { bpm: 126, root: 62, scale: pentatonicMajor, progression: [0, 4, 2, 3], motif: motif(0, 2, 4, null, 2, 3, 5, null, 4, 2, null, 3, 2, null, 0, null) },
  },
  {
    ...emptyCourse, id: 'verdant-relay', name: 'Verdant Relay', zone: 'SEEDLIGHT CIRCUIT',
    color: 0x8bf2a7, background: 0x101f20, floor: 0x19302b, speed: 9.4, length: 144,
    environment: 'verdant-greenhouse', signature: 'Float through five holes and three shards spaced a beat apart.', designHook: 'Verdant Relay lays out 6 thorn groups, 5 gaps, 2 hovers and 1 perch, 1 portal (float), 1 drone and 2 crawlers and 5 shards.', hazardStyle: 'thorn',
    obstacles: [[23.85, 1], [56.89, 1], [81.32, 1], [94.29, 1], [122.82, 1], [131.44, 2]],
    gaps: [{ at: 15.23, width: 2.5 }, { at: 39.66, width: 2.5 }, { at: 72.7, width: 2.5 }, { at: 85.67, width: 2.5 }, { at: 114.21, width: 2.5 }],
    platforms: [{ at: 99.5, width: 4.5, height: 0.45, kind: 'hover' }, { at: 28.5, width: 4.5, height: 0.45, kind: 'hover' }, { at: 46.03, width: 4.5, height: 0.45, kind: 'perch' }],
    portals: [{ at: 61.16, type: 'float' }],
    enemies: [{ at: 110.1, type: 'drone', height: 1.05 }, { at: 11.28, type: 'crawler' }, { at: 48.28, type: 'crawler' }],
    collectibles: [{ at: 9.92, height: 1.85 }, { at: 15.1, height: 1.62 }, { at: 22.77, height: 1.85 }, { at: 101.75, height: 1.65 }, { at: 30.75, height: 1.65 }],
    music: { bpm: 120, root: 55, scale: pentatonicMajor, progression: [0, 2, 4, 3], motif: motif(0, null, 2, 4, null, 3, 2, null, 4, 5, null, 2, 0, null, 3, 2) },
  },
  {
    ...emptyCourse, id: 'shatterglass-express', name: 'Shatterglass Express', zone: 'PRISM TRAIN RUN',
    color: 0x9fdcff, background: 0x15142d, floor: 0x232248, speed: 9.5, length: 146,
    environment: 'shatterglass', signature: 'Phase then dash: skip a hazard wall, then outrun the glass.', designHook: 'Shatterglass Express lays out 6 glass shard groups, 5 gaps, 2 islands and 1 perch, 2 portals (phase and dash), 1 drone and 2 crawlers and 4 shards.', hazardStyle: 'glass-shard',
    obstacles: [[24.42, 1], [56.22, 1], [81.82, 1], [97.12, 1], [124.61, 1], [133.32, 2]],
    gaps: [{ at: 15.72, width: 2.5 }, { at: 38.81, width: 2.5 }, { at: 71.02, width: 4.9 }, { at: 86.33, width: 4.9 }, { at: 115.9, width: 2.5 }],
    platforms: [{ at: 71.02, width: 2.5, height: 0.5, kind: 'island' }, { at: 86.33, width: 2.5, height: 0.5, kind: 'island' }, { at: 45.27, width: 4.5, height: 0.45, kind: 'perch' }],
    portals: [{ at: 26.15, type: 'phase' }, { at: 58, type: 'dash' }],
    enemies: [{ at: 111.51, type: 'drone', height: 1.05 }, { at: 11.4, type: 'crawler' }, { at: 47.52, type: 'crawler' }],
    collectibles: [{ at: 9.99, height: 1.85 }, { at: 15.58, height: 1.73 }, { at: 72.27, height: 1.7 }, { at: 87.58, height: 1.7 }],
    music: { bpm: 148, root: 60, scale: phrygian, progression: [0, 3, 2, 4], motif: motif(0, 1, 3, null, 5, 4, null, 2, 0, null, 1, 3, null, 5, 2, null) },
  },
  {
    ...emptyCourse, id: 'cloudbreaker-causeway', name: 'Cloudbreaker Causeway', zone: 'ABOVE THE WEATHER',
    color: 0xb2d8ff, background: 0x192b4a, floor: 0x263b5b, speed: 9.5, length: 148,
    environment: 'cloudbreaker', signature: 'Shield for the wall, then six gaps to spend it before.', designHook: 'Cloudbreaker Causeway lays out 6 cloudstone groups, 6 gaps, 2 hovers and 1 perch, 1 portal (shield), 1 drone and 2 crawlers and 4 shards.', hazardStyle: 'cloudstone',
    obstacles: [[48.93, 1], [61.63, 1], [86.21, 1], [99.15, 2], [127.89, 1], [136.6, 1]],
    gaps: [{ at: 15.63, width: 2.5 }, { at: 40.22, width: 2.5 }, { at: 52.92, width: 2.5 }, { at: 77.5, width: 2.5 }, { at: 90.45, width: 2.5 }, { at: 119.18, width: 2.5 }],
    platforms: [{ at: 105, width: 4.5, height: 0.45, kind: 'hover' }, { at: 66, width: 4.5, height: 0.45, kind: 'hover' }, { at: 22.09, width: 4.5, height: 0.45, kind: 'perch' }],
    portals: [{ at: 63.53, type: 'shield' }],
    enemies: [{ at: 115.03, type: 'drone', height: 1.05 }, { at: 11.4, type: 'crawler' }, { at: 24.34, type: 'crawler' }],
    collectibles: [{ at: 9.99, height: 1.85 }, { at: 15.48, height: 1.7 }, { at: 107.25, height: 1.65 }, { at: 68.25, height: 1.65 }],
    music: { bpm: 128, root: 57, scale: pentatonicMajor, progression: [0, 4, 3, 2], motif: motif(0, 2, 4, null, 5, 4, null, 2, 3, null, 4, 2, null, 3, 0, null) },
  },
  {
    ...emptyCourse, id: 'magnetar-foundry', name: 'Magnetar Foundry', zone: 'IRON IN ORBIT',
    color: 0x5bc8ff, background: 0x0d1a2c, floor: 0x152a3f, speed: 9.6, length: 149,
    environment: 'magnetar-forge', signature: 'Two dash portals, five holes, and a drone waiting after the second.', designHook: 'Magnetar Foundry lays out 7 magnetic core groups, 5 gaps, 2 islands and 1 perch, 2 portals (dash), 1 drone and 2 crawlers and 4 shards.', hazardStyle: 'magnetic-core',
    obstacles: [[37.68, 2], [63.53, 1], [79, 1], [87.8, 1], [113.65, 1], [124.56, 1], [137.48, 1]],
    gaps: [{ at: 15.72, width: 2.5 }, { at: 28.88, width: 2.5 }, { at: 52.62, width: 4.9 }, { at: 68.09, width: 4.9 }, { at: 128.68, width: 2.5 }],
    platforms: [{ at: 52.62, width: 2.5, height: 0.5, kind: 'island' }, { at: 68.09, width: 2.5, height: 0.5, kind: 'island' }, { at: 22.27, width: 4.5, height: 0.45, kind: 'perch' }],
    portals: [{ at: 39.47, type: 'dash' }, { at: 89.59, type: 'dash' }],
    enemies: [{ at: 102.74, type: 'drone', height: 1.05 }, { at: 11.52, type: 'crawler' }, { at: 24.52, type: 'crawler' }],
    collectibles: [{ at: 10.03, height: 1.85 }, { at: 15.59, height: 1.7 }, { at: 53.87, height: 1.7 }, { at: 69.34, height: 1.7 }],
    music: { bpm: 152, root: 48, scale: phrygian, progression: [0, 2, 3, 4], motif: motif(0, 2, null, 4, 5, null, 4, 2, 3, null, 5, 4, null, 2, 0, null) },
  },
  {
    ...emptyCourse, id: 'eclipse-crown', name: 'Eclipse Crown', zone: 'THE LAST LIGHT',
    color: 0xffd86d, background: 0x14152d, floor: 0x242747, speed: 9.6, length: 150,
    environment: 'eclipse-observatory', signature: 'Shield and float, five holes, three shards: the finale asks for both.', designHook: 'Eclipse Crown lays out 8 corona groups, 5 gaps, 2 hovers and 1 perch, 2 portals (shield and float), 1 drone and 2 crawlers and 5 shards.', hazardStyle: 'corona',
    obstacles: [[24.44, 1], [37.6, 1], [38.6, 2], [79.54, 1], [88.33, 1], [116.44, 1], [125.24, 1], [138.48, 1]],
    gaps: [{ at: 15.64, width: 2.5 }, { at: 28.8, width: 2.5 }, { at: 57.9, width: 2.5 }, { at: 70.74, width: 2.5 }, { at: 129.68, width: 2.5 }],
    platforms: [{ at: 95, width: 4.5, height: 0.45, kind: 'hover' }, { at: 45.5, width: 4.5, height: 0.45, kind: 'hover' }, { at: 64.45, width: 4.5, height: 0.45, kind: 'perch' }],
    portals: [{ at: 42.84, type: 'shield' }, { at: 92.58, type: 'float' }],
    enemies: [{ at: 107.64, type: 'drone', height: 1.05 }, { at: 11.52, type: 'crawler' }, { at: 66.7, type: 'crawler' }],
    collectibles: [{ at: 10.03, height: 1.85 }, { at: 15.49, height: 1.67 }, { at: 23.15, height: 1.85 }, { at: 97.25, height: 1.65 }, { at: 47.75, height: 1.65 }],
    music: { bpm: 154, root: 50, scale: pentatonicMinor, progression: [0, 3, 4, 2], motif: motif(0, 3, null, 4, 5, 3, null, 2, 0, null, 4, 5, null, 3, 2, null) },
  },
];

const portalTypes = new Set(['spring', 'dash', 'float', 'shield', 'phase']);
const enemyTypes = new Set(['crawler', 'drone', 'beetle', 'moth', 'bunny']);
const platformKinds = new Set(['kerb', 'shelf', 'island', 'hover', 'perch', 'bounce']);
const archAnchors = new Set(['checkpoint', 'finish']);

export function validateLevels(catalog, { expected = 20 } = {}) {
  if (!Array.isArray(catalog) || catalog.length !== expected) {
    const count = expected === 20 ? 'twenty' : String(expected);
    throw new Error(`The campaign must contain exactly ${count} playable ${expected === 1 ? 'level' : 'levels'}.`);
  }
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
    // A hazard beat is an obstacle group or an enemy: a course that trades one group for two
    // enemies is just as dense, and the auto-player still has to clear every beat.
    if (!Array.isArray(level.obstacles) || level.obstacles.length + (level.enemies?.length ?? 0) < 3) {
      throw new Error(`${level.name} needs at least three hazard beats.`);
    }
    let previousEnd = 0;
    for (const group of level.obstacles) {
      if (!Array.isArray(group) || group.length < 2 || group.length > 3) throw new Error(`${level.name} contains an invalid obstacle group.`);
      const [distance, count, style] = group;
      if (!Number.isFinite(distance) || !Number.isInteger(count) || count < 1 || count > 2) throw new Error(`${level.name} contains an invalid obstacle group.`);
      if (style !== undefined && (typeof style !== 'string' || style.length === 0)) throw new Error(`${level.name} has an invalid hazard skin.`);
      if (distance <= previousEnd || distance + (count - 1) * 1.28 >= level.length - 3) throw new Error(`${level.name} has unsorted hazards or a hazard too near the finish.`);
      previousEnd = distance + (count - 1) * 1.28;
    }
    for (const key of ['gaps', 'platforms', 'portals', 'enemies', 'collectibles']) {
      if (!Array.isArray(level[key])) throw new Error(`${level.name} is missing its ${key} list.`);
    }
    for (const gap of level.gaps) {
      // Island gaps are wider than a plain hole so the island can keep 1.6 units of hole on each side.
      if (!Number.isFinite(gap.at) || gap.at < 3 || !Number.isFinite(gap.width) || gap.width < 2.5 || gap.width > 7 || gap.at + gap.width > level.length - 2) throw new Error(`${level.name} has an invalid gap.`);
    }
    for (const platform of level.platforms) {
      if (!Number.isFinite(platform.at) || platform.at < 3 || !Number.isFinite(platform.width) || platform.width < 2.5 || !Number.isFinite(platform.height) || platform.height < 0 || platform.height > .95 || platform.at + platform.width > level.length - 2) throw new Error(`${level.name} has an invalid platform.`);
      if (platform.kind !== undefined && !platformKinds.has(platform.kind)) throw new Error(`${level.name} has an unknown platform archetype: ${platform.kind}`);
    }
    for (const portal of level.portals) {
      if (!Number.isFinite(portal.at) || portal.at < 3 || portal.at > level.length - 3 || !portalTypes.has(portal.type)) throw new Error(`${level.name} has an invalid portal.`);
    }
    for (const enemy of level.enemies) {
      if (!Number.isFinite(enemy.at) || enemy.at < 3 || enemy.at > level.length - 3 || !enemyTypes.has(enemy.type)) throw new Error(`${level.name} has an invalid enemy.`);
    }
    for (const collectible of level.collectibles) {
      if (!Number.isFinite(collectible.at) || collectible.at < 3 || collectible.at > level.length - 3 || !Number.isFinite(collectible.height ?? 1.7)) throw new Error(`${level.name} has an invalid collectible.`);
      if (collectible.arc !== undefined && (!Number.isInteger(collectible.arc) || collectible.arc < 2 || collectible.arc > 5)) throw new Error(`${level.name} has an invalid shard arc size.`);
    }
    if (level.decor !== undefined) {
      if (!level.decor || typeof level.decor !== 'object' || Array.isArray(level.decor)) throw new Error(`${level.name} has invalid scenery data.`);
      if (level.decor.arches !== undefined && (!Array.isArray(level.decor.arches) || level.decor.arches.some((anchor) => !archAnchors.has(anchor)))) throw new Error(`${level.name} has an invalid scenery arch.`);
      if (level.decor.pomPoms !== undefined && (!Number.isInteger(level.decor.pomPoms) || level.decor.pomPoms < 3 || level.decor.pomPoms > 5)) throw new Error(`${level.name} has an invalid pom-pom count.`);
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
