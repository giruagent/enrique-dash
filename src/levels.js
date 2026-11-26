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
    environment: 'neon-city', signature: 'A spike group into a gap in the same jump.', designHook: 'Neon Run lays out 3 spike groups and 3 gaps.', hazardStyle: 'spike',
    obstacles: [[9.84, 1], [33.57, 2], [68.16, 1]],
    gaps: [{ at: 15.53, width: 2.5 }, { at: 51.61, width: 2.5 }, { at: 63.75, width: 4.3 }],
    platforms: [],
    portals: [],
    enemies: [],
    collectibles: [],
    music: { bpm: 118, root: 57, scale: pentatonicMinor, progression: [0, 3, 2, 4], motif: motif(0, null, 2, null, 4, 2, null, 3, 0, null, 2, null, 4, 3, 2, null) },
  },
  {
    ...emptyCourse, id: 'skyline-rush', name: 'Skyline Rush', zone: 'CITY AFTER DARK',
    color: 0x56d9ff, background: 0x0a182b, floor: 0x10243a, speed: 8.4, length: 88,
    environment: 'skyline-rooftops', signature: 'Gap, then a vent group in the same jump.', designHook: 'Skyline Rush lays out 4 vent groups, 3 gaps, 1 portal (float) and 1 apex shard.', hazardStyle: 'vent',
    obstacles: [[10.08, 1], [32.69, 1], [55.31, 1], [77.92, 1]],
    gaps: [{ at: 28.31, width: 4.3 }, { at: 50.92, width: 4.3 }, { at: 73.54, width: 4.3 }],
    platforms: [],
    portals: [{ at: 38.89, type: 'float' }],
    enemies: [],
    collectibles: [{ at: 7.67, height: 1.9 }],
    music: { bpm: 124, root: 60, scale: pentatonicMajor, progression: [0, 4, 3, 4], motif: motif(0, null, 2, 4, null, 2, 4, null, 3, null, 2, null, 4, 2, 0, null) },
  },
  {
    ...emptyCourse, id: 'solar-flare', name: 'Solar Flare', zone: 'HEAT OF THE MOMENT',
    color: 0xff9d52, background: 0x291528, floor: 0x301d2b, speed: 8.5, length: 92,
    environment: 'solar-desert', signature: 'Gap, then a solar panel group in the same jump.', designHook: 'Solar Flare lays out 4 solar panel groups, 3 gaps, 1 portal (spring) and 1 apex shard.', hazardStyle: 'solar-panel',
    obstacles: [[10.2, 1], [33.93, 1], [57.8, 1], [81.8, 1]],
    gaps: [{ at: 29.63, width: 4.2 }, { at: 53.36, width: 4.3 }, { at: 77.23, width: 4.5 }],
    platforms: [],
    portals: [{ at: 40.54, type: 'spring' }],
    enemies: [],
    collectibles: [{ at: 7.55, height: 1.9 }],
    music: { bpm: 130, root: 52, scale: dorian, progression: [0, 3, 4, 2], motif: motif(0, 2, null, 3, 4, null, 5, 4, 3, null, 2, null, 4, 5, 3, null) },
  },
  {
    ...emptyCourse, id: 'gravity-garden', name: 'Gravity Garden', zone: 'A DIFFERENT RHYTHM',
    color: 0xc18aff, background: 0x17142a, floor: 0x1e1b35, speed: 8.5, length: 96,
    environment: 'gravity-garden', signature: 'A vine group into a gap in the same jump.', designHook: 'Gravity Garden lays out 4 vine groups, 4 gaps, 1 portal (float) and 1 apex shard.', hazardStyle: 'vine',
    obstacles: [[10.2, 1], [20.71, 1], [50.37, 1], [85.8, 1]],
    gaps: [{ at: 16, width: 4.6 }, { at: 45.8, width: 4.5 }, { at: 75.47, width: 2.5 }, { at: 81.37, width: 4.3 }],
    platforms: [],
    portals: [{ at: 29.24, type: 'float' }],
    enemies: [],
    collectibles: [{ at: 8.12, height: 1.9 }],
    music: { bpm: 110, root: 55, scale: pentatonicMajor, progression: [0, 2, 4, 3], motif: motif(0, null, 4, 2, null, 3, 4, null, 2, null, 0, 2, null, 4, 3, null) },
  },
  {
    ...emptyCourse, id: 'pixel-pier', name: 'Pixel Pier', zone: 'ARCADE BY THE SEA',
    color: 0xffdf6e, background: 0x171b30, floor: 0x22233a, speed: 8.6, length: 100,
    environment: 'pixel-pier', signature: 'A pixel block group into a gap in the same jump.', designHook: 'Pixel Pier lays out 5 pixel block groups, 3 gaps, 1 low pier bridge, 1 portal (spring) and 1 apex shard.', hazardStyle: 'pixel-block',
    obstacles: [[10.32, 1], [47.64, 1], [53.6, 1], [83.81, 1], [89.68, 1]],
    gaps: [{ at: 16.09, width: 2.5 }, { at: 22.05, width: 2.5 }, { at: 79.19, width: 4.5 }],
    platforms: [{ at: 22.05, width: 2.5, height: 0.05, kind: 'pier' }],
    portals: [{ at: 30.75, type: 'spring' }],
    enemies: [],
    collectibles: [{ at: 8.01, height: 1.9 }],
    music: { bpm: 136, root: 62, scale: mixolydian, progression: [0, 4, 2, 3], motif: motif(0, 2, 4, null, 2, 4, 5, null, 4, 2, null, 3, 2, null, 0, null) },
  },
  {
    ...emptyCourse, id: 'midnight-circuit', name: 'Midnight Circuit', zone: 'AFTER-HOURS TURBO',
    color: 0x4f91ff, background: 0x0b1328, floor: 0x131d35, speed: 8.7, length: 104,
    environment: 'midnight-circuit', signature: 'A circuit beam group into a gap in the same jump.', designHook: 'Midnight Circuit lays out 5 circuit beam groups, 3 gaps, 1 low curb bridge, 1 portal (dash) and 1 apex shard.', hazardStyle: 'circuit-beam',
    obstacles: [[10.44, 1], [49.34, 1], [55.37, 1], [87.53, 1], [93.56, 1]],
    gaps: [{ at: 16.38, width: 2.5 }, { at: 43.71, width: 5 }, { at: 82.71, width: 4.7 }],
    platforms: [{ at: 16.38, width: 2.5, height: 0.05, kind: 'curb' }],
    portals: [{ at: 25.67, type: 'dash' }],
    enemies: [],
    collectibles: [{ at: 8.68, height: 1.9 }],
    music: { bpm: 140, root: 50, scale: phrygian, progression: [0, 2, 3, 4], motif: motif(0, null, 1, 3, null, 5, 3, null, 2, null, 1, null, 4, 3, 2, null) },
  },
  {
    ...emptyCourse, id: 'candy-comet', name: 'Candy Comet', zone: 'SWEET BUT SPEEDY',
    color: 0xff79b8, background: 0x27152b, floor: 0x321d38, speed: 8.8, length: 108,
    environment: 'candy-comet', signature: 'A candy cane group into a gap in the same jump.', designHook: 'Candy Comet lays out 4 candy cane groups, 4 gaps, 1 low nougat bridge, 1 portal (spring), 1 crawler and 1 apex shard.', hazardStyle: 'candy-cane',
    obstacles: [[10.56, 1], [49.04, 1], [59.39, 2], [85.66, 1]],
    gaps: [{ at: 16.66, width: 2.5 }, { at: 22.76, width: 2.5 }, { at: 54.94, width: 4.3 }, { at: 91.77, width: 4.8 }],
    platforms: [{ at: 22.76, width: 2.5, height: 0.05, kind: 'nougat' }],
    portals: [{ at: 31.7, type: 'spring' }],
    enemies: [{ at: 96.64, type: 'crawler' }],
    collectibles: [{ at: 8.28, height: 1.9 }],
    music: { bpm: 126, root: 57, scale: pentatonicMajor, progression: [0, 3, 4, 0], motif: motif(0, 2, 4, null, 4, 2, 3, null, 0, null, 2, 4, null, 3, 2, null) },
  },
  {
    ...emptyCourse, id: 'aqua-pulse', name: 'Aqua Pulse', zone: 'DEEP BLUE DRIVE',
    color: 0x48f0cf, background: 0x0b202a, floor: 0x102b36, speed: 8.9, length: 112,
    environment: 'aqua-reef', signature: 'A coral group into a gap in the same jump.', designHook: 'Aqua Pulse lays out 3 coral groups, 5 gaps, 3 low reef bridges, 1 portal (float), 1 crawler and 1 apex shard.', hazardStyle: 'coral',
    obstacles: [[10.68, 1], [50.12, 1], [62.46, 2]],
    gaps: [{ at: 16.85, width: 2.5 }, { at: 23.02, width: 2.5 }, { at: 56.29, width: 2.5 }, { at: 89.56, width: 2.5 }, { at: 95.73, width: 4.7 }],
    platforms: [{ at: 16.85, width: 2.5, height: 0.05, kind: 'reef' }, { at: 23.02, width: 2.5, height: 0.05, kind: 'reef' }, { at: 56.29, width: 2.5, height: 0.05, kind: 'reef' }],
    portals: [{ at: 32.24, type: 'float' }],
    enemies: [{ at: 100.52, type: 'crawler' }],
    collectibles: [{ at: 8.23, height: 1.9 }],
    music: { bpm: 132, root: 53, scale: dorian, progression: [0, 2, 4, 3], motif: motif(0, null, 2, 3, null, 5, 3, null, 2, null, 4, 5, null, 3, 2, null) },
  },
  {
    ...emptyCourse, id: 'crystal-cavern', name: 'Crystal Cavern', zone: 'ECHOES IN THE DARK',
    color: 0x9daaff, background: 0x14172b, floor: 0x1b2139, speed: 9, length: 116,
    environment: 'crystal-cavern', signature: 'Two crystal beam groups in one jump.', designHook: 'Crystal Cavern lays out 5 crystal beam groups, 4 gaps, 2 low crystal bridges, 1 portal (phase), 1 drone and 1 apex shard.', hazardStyle: 'crystal-beam',
    obstacles: [[10.8, 1], [16.84, 1], [55.2, 1], [61.44, 1], [93.57, 1]],
    gaps: [{ at: 23.08, width: 2.5 }, { at: 29.32, width: 2.5 }, { at: 67.68, width: 2.5 }, { at: 99.71, width: 4.6 }],
    platforms: [{ at: 29.32, width: 2.5, height: 0.05, kind: 'crystal' }, { at: 67.68, width: 2.5, height: 0.05, kind: 'crystal' }],
    portals: [{ at: 39.54, type: 'phase' }],
    enemies: [{ at: 104.4, type: 'drone', height: 1.05 }],
    collectibles: [{ at: 9.15, height: 1.9 }],
    music: { bpm: 116, root: 60, scale: phrygian, progression: [0, 3, 2, 4], motif: motif(0, null, 3, null, 5, 4, null, 2, 0, null, 1, null, 3, 5, 2, null) },
  },
  {
    ...emptyCourse, id: 'stormbreaker', name: 'Stormbreaker', zone: 'RIDE THE THUNDER',
    color: 0xff6d73, background: 0x221522, floor: 0x2a1b2b, speed: 9.1, length: 120,
    environment: 'storm-coast', signature: 'A storm debris group into a gap in the same jump.', designHook: 'Stormbreaker lays out 3 storm debris groups, 6 gaps, 5 low cliff bridges, 2 portals (float and dash), 1 drone and 1 apex shard.', hazardStyle: 'storm-debris',
    obstacles: [[10.92, 1], [50.7, 1], [91.06, 1]],
    gaps: [{ at: 17.23, width: 2.5 }, { at: 23.54, width: 2.5 }, { at: 56.8, width: 2.5 }, { at: 63.11, width: 2.5 }, { at: 97.37, width: 2.5 }, { at: 103.68, width: 4.5 }],
    platforms: [{ at: 17.23, width: 2.5, height: 0.05, kind: 'cliff' }, { at: 23.54, width: 2.5, height: 0.05, kind: 'cliff' }, { at: 56.8, width: 2.5, height: 0.05, kind: 'cliff' }, { at: 63.11, width: 2.5, height: 0.05, kind: 'cliff' }, { at: 97.37, width: 2.5, height: 0.05, kind: 'cliff' }],
    portals: [{ at: 32.77, type: 'float' }, { at: 72.62, type: 'dash' }],
    enemies: [{ at: 108.28, type: 'drone', height: 1.05 }],
    collectibles: [{ at: 8.45, height: 1.9 }],
    music: { bpm: 144, root: 55, scale: mixolydian, progression: [0, 3, 4, 2], motif: motif(0, 2, null, 4, 5, null, 4, 2, 3, null, 5, null, 4, 2, 0, null) },
  },
  {
    ...emptyCourse, id: 'final-orbit', name: 'Final Orbit', zone: 'THE LAST LAUNCH',
    color: 0xe9f1ff, background: 0x101326, floor: 0x191f38, speed: 9.2, length: 124,
    environment: 'orbital-shipyard', signature: 'Two asteroid groups in one jump.', designHook: 'Final Orbit lays out 5 asteroid groups, 5 gaps, 5 low gantry bridges, 2 portals (spring and dash), 1 drone and 1 apex shard.', hazardStyle: 'asteroid',
    obstacles: [[11.04, 1], [17.42, 1], [55.35, 1], [67.9, 1], [99.4, 1]],
    gaps: [{ at: 23.7, width: 2.5 }, { at: 30.08, width: 2.5 }, { at: 61.53, width: 2.5 }, { at: 74.18, width: 2.5 }, { at: 105.78, width: 2.5 }],
    platforms: [{ at: 23.7, width: 2.5, height: 0.05, kind: 'gantry' }, { at: 30.08, width: 2.5, height: 0.05, kind: 'gantry' }, { at: 61.53, width: 2.5, height: 0.05, kind: 'gantry' }, { at: 74.18, width: 2.5, height: 0.05, kind: 'gantry' }, { at: 105.78, width: 2.5, height: 0.05, kind: 'gantry' }],
    portals: [{ at: 38.67, type: 'spring' }, { at: 82.76, type: 'dash' }],
    enemies: [{ at: 112.16, type: 'drone', height: 1.05 }],
    collectibles: [{ at: 8.55, height: 1.9 }],
    music: { bpm: 150, root: 48, scale: pentatonicMinor, progression: [0, 3, 4, 2], motif: motif(0, 3, null, 4, 5, 3, null, 2, 0, null, 4, 5, null, 3, 2, null) },
  },
  {
    ...emptyCourse, id: 'mosslight-hollow', name: 'Mosslight Hollow', zone: 'FIREFLIES BELOW',
    color: 0x96e88a, background: 0x101d1a, floor: 0x182b22, speed: 9.2, length: 128,
    environment: 'mosslight-hollow', signature: 'Gap, then a moss stump group in the same jump.', designHook: 'Mosslight Hollow lays out 4 moss stump groups, 7 gaps, 5 low hover bridges, 1 portal (float), 1 drone and 2 apex shards.', hazardStyle: 'moss-stump',
    obstacles: [[17.42, 1], [55, 1], [67.65, 1], [103.4, 1]],
    gaps: [{ at: 11.04, width: 2.5 }, { at: 23.8, width: 2.5 }, { at: 30.18, width: 2.5 }, { at: 61.27, width: 2.5 }, { at: 73.93, width: 2.5 }, { at: 98.75, width: 4.6 }, { at: 109.78, width: 2.5 }],
    platforms: [{ at: 23.8, width: 2.5, height: 0.05, kind: 'hover' }, { at: 30.18, width: 2.5, height: 0.05, kind: 'hover' }, { at: 61.27, width: 2.5, height: 0.05, kind: 'hover' }, { at: 73.93, width: 2.5, height: 0.05, kind: 'hover' }, { at: 109.78, width: 2.5, height: 0.05, kind: 'hover' }],
    portals: [{ at: 38.62, type: 'float' }],
    enemies: [{ at: 116.16, type: 'drone', height: 1.05 }],
    collectibles: [{ at: 9.39, height: 1.9 }, { at: 18.12, height: 1.88 }],
    music: { bpm: 112, root: 57, scale: pentatonicMajor, progression: [0, 2, 3, 4], motif: motif(0, null, 2, 4, null, 2, 3, null, 4, null, 2, 0, null, 3, 2, null) },
  },
  {
    ...emptyCourse, id: 'clockwork-orchard', name: 'Clockwork Orchard', zone: 'BRASS BLOSSOMS',
    color: 0xeab76d, background: 0x211b28, floor: 0x30252e, speed: 9.3, length: 132,
    environment: 'clockwork-orchard', signature: 'Two gear fruit groups in one jump.', designHook: 'Clockwork Orchard lays out 5 gear fruit groups, 6 gaps, 5 low trellis bridges, 2 portals (dash and spring), 1 drone and 2 apex shards.', hazardStyle: 'gear-fruit',
    obstacles: [[11.16, 1], [17.5, 1], [56.75, 1], [69.65, 1], [107.14, 1]],
    gaps: [{ at: 23.95, width: 2.5 }, { at: 30.4, width: 2.5 }, { at: 63.2, width: 2.5 }, { at: 75.89, width: 2.5 }, { at: 102.29, width: 4.8 }, { at: 113.59, width: 2.5 }],
    platforms: [{ at: 23.95, width: 2.5, height: 0.05, kind: 'trellis' }, { at: 30.4, width: 2.5, height: 0.05, kind: 'trellis' }, { at: 63.2, width: 2.5, height: 0.05, kind: 'trellis' }, { at: 75.89, width: 2.5, height: 0.05, kind: 'trellis' }, { at: 113.59, width: 2.5, height: 0.05, kind: 'trellis' }],
    portals: [{ at: 39.36, type: 'dash' }, { at: 84.86, type: 'spring' }],
    enemies: [{ at: 120.04, type: 'drone', height: 1.05 }],
    collectibles: [{ at: 8.64, height: 1.9 }, { at: 16.72, height: 1.89 }],
    music: { bpm: 120, root: 59, scale: mixolydian, progression: [0, 3, 4, 0], motif: motif(0, 2, 4, null, 3, 2, null, 4, 5, null, 2, 0, null, 3, 4, null) },
  },
  {
    ...emptyCourse, id: 'tidal-foundry', name: 'Tidal Foundry', zone: 'PRESSURE AND STEEL',
    color: 0x57e2da, background: 0x10252e, floor: 0x18313a, speed: 9.3, length: 136,
    environment: 'tidal-foundry', signature: 'Two foundry pipe groups in one jump.', designHook: 'Tidal Foundry lays out 5 foundry pipe groups, 6 gaps, 5 low conveyor bridges, 1 portal (dash), 1 drone and 2 apex shards.', hazardStyle: 'foundry-pipe',
    obstacles: [[11.16, 1], [17.4, 1], [59.9, 1], [72.8, 1], [111.14, 1]],
    gaps: [{ at: 23.75, width: 2.5 }, { at: 30.19, width: 2.5 }, { at: 66.35, width: 2.5 }, { at: 79.25, width: 2.5 }, { at: 106.29, width: 4.8 }, { at: 117.59, width: 2.5 }],
    platforms: [{ at: 23.75, width: 2.5, height: 0.05, kind: 'conveyor' }, { at: 30.19, width: 2.5, height: 0.05, kind: 'conveyor' }, { at: 66.35, width: 2.5, height: 0.05, kind: 'conveyor' }, { at: 79.25, width: 2.5, height: 0.05, kind: 'conveyor' }, { at: 117.59, width: 2.5, height: 0.05, kind: 'conveyor' }],
    portals: [{ at: 40.29, type: 'dash' }],
    enemies: [{ at: 124.04, type: 'drone', height: 1.05 }],
    collectibles: [{ at: 8.41, height: 1.9 }, { at: 16.63, height: 1.9 }],
    music: { bpm: 138, root: 52, scale: dorian, progression: [0, 3, 2, 4], motif: motif(0, 2, null, 3, 5, null, 4, 2, null, 3, 4, null, 2, 0, null, 3) },
  },
  {
    ...emptyCourse, id: 'paper-moon-parade', name: 'Paper Moon Parade', zone: 'FOLDED NIGHT SKY',
    color: 0xffd99a, background: 0x24213b, floor: 0x302c49, speed: 9.4, length: 140,
    environment: 'paper-moon', signature: 'A paper banner group into a gap in the same jump.', designHook: 'Paper Moon Parade lays out 5 paper banner groups, 7 gaps, 3 low float bridges, 2 portals (spring), 1 drone and 2 apex shards.', hazardStyle: 'paper-banner',
    obstacles: [[11.28, 1], [22.6, 1], [62.21, 1], [73.57, 1], [113.18, 1]],
    gaps: [{ at: 17.69, width: 4.8 }, { at: 28.9, width: 2.5 }, { at: 35.42, width: 2.5 }, { at: 68.52, width: 5 }, { at: 79.98, width: 2.5 }, { at: 119.7, width: 2.5 }, { at: 126.22, width: 2.5 }],
    platforms: [{ at: 35.42, width: 2.5, height: 0.05, kind: 'float' }, { at: 79.98, width: 2.5, height: 0.05, kind: 'float' }, { at: 126.22, width: 2.5, height: 0.05, kind: 'float' }],
    portals: [{ at: 44.53, type: 'spring' }, { at: 89.09, type: 'spring' }],
    enemies: [{ at: 106.77, type: 'drone', height: 1.05 }],
    collectibles: [{ at: 9.37, height: 1.9 }, { at: 28.76, height: 1.89 }],
    music: { bpm: 126, root: 62, scale: pentatonicMajor, progression: [0, 4, 2, 3], motif: motif(0, 2, 4, null, 2, 3, 5, null, 4, 2, null, 3, 2, null, 0, null) },
  },
  {
    ...emptyCourse, id: 'verdant-relay', name: 'Verdant Relay', zone: 'SEEDLIGHT CIRCUIT',
    color: 0x8bf2a7, background: 0x101f20, floor: 0x19302b, speed: 9.4, length: 144,
    environment: 'verdant-greenhouse', signature: 'A thorn group into a gap in the same jump.', designHook: 'Verdant Relay lays out 6 thorn groups, 7 gaps, 5 low leaf bridges, 1 portal (float), 1 drone and 3 apex shards.', hazardStyle: 'thorn',
    obstacles: [[11.28, 1], [43.57, 1], [49.88, 1], [80.91, 1], [124.92, 1], [131.44, 2]],
    gaps: [{ at: 17.59, width: 2.5 }, { at: 24.11, width: 2.5 }, { at: 56.39, width: 2.5 }, { at: 75.86, width: 5 }, { at: 87.22, width: 2.5 }, { at: 93.74, width: 2.5 }, { at: 119.72, width: 5 }],
    platforms: [{ at: 17.59, width: 2.5, height: 0.05, kind: 'leaf' }, { at: 24.11, width: 2.5, height: 0.05, kind: 'leaf' }, { at: 56.39, width: 2.5, height: 0.05, kind: 'leaf' }, { at: 87.22, width: 2.5, height: 0.05, kind: 'leaf' }, { at: 93.74, width: 2.5, height: 0.05, kind: 'leaf' }],
    portals: [{ at: 63.01, type: 'float' }],
    enemies: [{ at: 113.2, type: 'drone', height: 1.05 }],
    collectibles: [{ at: 8.98, height: 1.9 }, { at: 41.25, height: 1.9 }, { at: 49.11, height: 1.86 }],
    music: { bpm: 120, root: 55, scale: pentatonicMajor, progression: [0, 2, 4, 3], motif: motif(0, null, 2, 4, null, 3, 2, null, 4, 5, null, 2, 0, null, 3, 2) },
  },
  {
    ...emptyCourse, id: 'shatterglass-express', name: 'Shatterglass Express', zone: 'PRISM TRAIN RUN',
    color: 0x9fdcff, background: 0x15142d, floor: 0x232248, speed: 9.5, length: 146,
    environment: 'shatterglass', signature: 'A glass shard group into a gap in the same jump.', designHook: 'Shatterglass Express lays out 6 glass shard groups, 7 gaps, 5 low rail bridges, 2 portals (phase and dash), 1 drone and 2 apex shards.', hazardStyle: 'glass-shard',
    obstacles: [[11.4, 1], [42.88, 1], [49.47, 1], [83.86, 1], [126.73, 1], [133.32, 2]],
    gaps: [{ at: 17.99, width: 2.5 }, { at: 24.58, width: 2.5 }, { at: 56.05, width: 2.5 }, { at: 77.28, width: 2.5 }, { at: 90.45, width: 2.5 }, { at: 97.04, width: 2.5 }, { at: 121.93, width: 4.7 }],
    platforms: [{ at: 17.99, width: 2.5, height: 0.05, kind: 'rail' }, { at: 24.58, width: 2.5, height: 0.05, kind: 'rail' }, { at: 56.05, width: 2.5, height: 0.05, kind: 'rail' }, { at: 90.45, width: 2.5, height: 0.05, kind: 'rail' }, { at: 97.04, width: 2.5, height: 0.05, kind: 'rail' }],
    portals: [{ at: 30.8, type: 'phase' }, { at: 63.27, type: 'dash' }],
    enemies: [{ at: 115.34, type: 'drone', height: 1.05 }],
    collectibles: [{ at: 9, height: 1.9 }, { at: 40.51, height: 1.9 }],
    music: { bpm: 148, root: 60, scale: phrygian, progression: [0, 3, 2, 4], motif: motif(0, 1, 3, null, 5, 4, null, 2, 0, null, 1, 3, null, 5, 2, null) },
  },
  {
    ...emptyCourse, id: 'cloudbreaker-causeway', name: 'Cloudbreaker Causeway', zone: 'ABOVE THE WEATHER',
    color: 0xb2d8ff, background: 0x192b4a, floor: 0x263b5b, speed: 9.5, length: 148,
    environment: 'cloudbreaker', signature: 'A cloudstone group into a gap in the same jump.', designHook: 'Cloudbreaker Causeway lays out 6 cloudstone groups, 8 gaps, 3 low cloudstone bridges, 1 portal (shield), 1 drone and 2 apex shards.', hazardStyle: 'cloudstone',
    obstacles: [[11.4, 1], [43.91, 1], [55.45, 1], [86.33, 1], [130.12, 1], [136.6, 1]],
    gaps: [{ at: 17.99, width: 2.5 }, { at: 24.58, width: 2.5 }, { at: 50.5, width: 4.9 }, { at: 62.04, width: 2.5 }, { at: 81.37, width: 4.9 }, { at: 92.91, width: 2.5 }, { at: 99.5, width: 2.5 }, { at: 125.32, width: 4.7 }],
    platforms: [{ at: 24.58, width: 2.5, height: 0.05, kind: 'cloudstone' }, { at: 62.04, width: 2.5, height: 0.05, kind: 'cloudstone' }, { at: 99.5, width: 2.5, height: 0.05, kind: 'cloudstone' }],
    portals: [{ at: 68.61, type: 'shield' }],
    enemies: [{ at: 118.84, type: 'drone', height: 1.05 }],
    collectibles: [{ at: 8.68, height: 1.9 }, { at: 17.23, height: 1.9 }],
    music: { bpm: 128, root: 57, scale: pentatonicMajor, progression: [0, 4, 3, 2], motif: motif(0, 2, 4, null, 5, 4, null, 2, 3, null, 4, 2, null, 3, 0, null) },
  },
  {
    ...emptyCourse, id: 'magnetar-foundry', name: 'Magnetar Foundry', zone: 'IRON IN ORBIT',
    color: 0x5bc8ff, background: 0x0d1a2c, floor: 0x152a3f, speed: 9.6, length: 149,
    environment: 'magnetar-forge', signature: 'A magnetic core group into a gap in the same jump.', designHook: 'Magnetar Foundry lays out 6 magnetic core groups, 7 gaps, 7 low magnetic bridges, 2 portals (dash), 1 drone and 2 apex shards.', hazardStyle: 'magnetic-core',
    obstacles: [[11.52, 1], [24.62, 1], [63.21, 1], [76.52, 1], [83.07, 1], [121.67, 1]],
    gaps: [{ at: 17.96, width: 2.5 }, { at: 31.28, width: 2.5 }, { at: 37.93, width: 2.5 }, { at: 69.87, width: 2.5 }, { at: 89.73, width: 2.5 }, { at: 128.32, width: 2.5 }, { at: 134.98, width: 2.5 }],
    platforms: [{ at: 17.96, width: 2.5, height: 0.05, kind: 'magnetic' }, { at: 31.28, width: 2.5, height: 0.05, kind: 'magnetic' }, { at: 37.93, width: 2.5, height: 0.05, kind: 'magnetic' }, { at: 69.87, width: 2.5, height: 0.05, kind: 'magnetic' }, { at: 89.73, width: 2.5, height: 0.05, kind: 'magnetic' }, { at: 128.32, width: 2.5, height: 0.05, kind: 'magnetic' }, { at: 134.98, width: 2.5, height: 0.05, kind: 'magnetic' }],
    portals: [{ at: 47.92, type: 'dash' }, { at: 99.72, type: 'dash' }],
    enemies: [{ at: 115.01, type: 'drone', height: 1.05 }],
    collectibles: [{ at: 9.02, height: 1.9 }, { at: 25.43, height: 1.86 }],
    music: { bpm: 152, root: 48, scale: phrygian, progression: [0, 2, 3, 4], motif: motif(0, 2, null, 4, 5, null, 4, 2, 3, null, 5, 4, null, 2, 0, null) },
  },
  {
    ...emptyCourse, id: 'eclipse-crown', name: 'Eclipse Crown', zone: 'THE LAST LIGHT',
    color: 0xffd86d, background: 0x14152d, floor: 0x242747, speed: 9.6, length: 150,
    environment: 'eclipse-observatory', signature: 'A corona group into a gap in the same jump.', designHook: 'Eclipse Crown lays out 7 corona groups, 8 gaps, 7 low observatory bridges, 2 portals (shield and float), 1 drone and 3 apex shards.', hazardStyle: 'corona',
    obstacles: [[11.52, 1], [24.83, 1], [31.38, 1], [64.86, 1], [78.06, 1], [84.51, 1], [122.88, 1]],
    gaps: [{ at: 18.18, width: 2.5 }, { at: 37.93, width: 2.5 }, { at: 44.59, width: 2.5 }, { at: 71.41, width: 2.5 }, { at: 90.95, width: 2.5 }, { at: 117.87, width: 4.9 }, { at: 129.32, width: 2.5 }, { at: 135.98, width: 2.5 }],
    platforms: [{ at: 18.18, width: 2.5, height: 0.05, kind: 'observatory' }, { at: 37.93, width: 2.5, height: 0.05, kind: 'observatory' }, { at: 44.59, width: 2.5, height: 0.05, kind: 'observatory' }, { at: 71.41, width: 2.5, height: 0.05, kind: 'observatory' }, { at: 90.95, width: 2.5, height: 0.05, kind: 'observatory' }, { at: 129.32, width: 2.5, height: 0.05, kind: 'observatory' }, { at: 135.98, width: 2.5, height: 0.05, kind: 'observatory' }],
    portals: [{ at: 51.48, type: 'shield' }, { at: 97.84, type: 'float' }],
    enemies: [{ at: 111.22, type: 'drone', height: 1.05 }],
    collectibles: [{ at: 9.1, height: 1.9 }, { at: 25.72, height: 1.85 }, { at: 33.66, height: 1.9 }],
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
    }
  }
  return true;
}

export function getLevel(id) {
  return levels.find((level) => level.id === id);
}

export let levelValidationError = null;
try { validateLevels(levels); } catch (error) { levelValidationError = error; console.error('Course data failed validation.', error); }
