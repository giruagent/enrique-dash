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
    environment: 'neon-city', signature: 'A spike group into an open gap.', designHook: 'Neon Run lays out 3 spike groups and 3 open gaps.', hazardStyle: 'spike',
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
    environment: 'skyline-rooftops', signature: 'A vent run of 4 hazard groups over 3 open gaps, every landing clear.', designHook: 'Skyline Rush lays out 4 vent groups, 3 open gaps, 1 portal (float) and 1 shard.', hazardStyle: 'vent',
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
    environment: 'solar-desert', signature: 'A solar panel run of 4 hazard groups over 3 open gaps, every landing clear.', designHook: 'Solar Flare lays out 4 solar panel groups, 3 open gaps, 1 portal (spring) and 1 shard.', hazardStyle: 'solar-panel',
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
    environment: 'gravity-garden', signature: 'A vine group into an open gap.', designHook: 'Gravity Garden lays out 5 vine groups, 3 open gaps, 1 portal (float) and 1 shard.', hazardStyle: 'vine',
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
    environment: 'pixel-pier', signature: 'A pixel block group into an open gap.', designHook: 'Pixel Pier lays out 5 pixel block groups, 3 open gaps, 1 portal (spring) and 1 shard.', hazardStyle: 'pixel-block',
    obstacles: [[10.32, 1], [25.59, 1], [52.43, 1], [79.28, 1], [89.68, 1]],
    gaps: [{ at: 15.19, width: 2.5 }, { at: 42.03, width: 2.5 }, { at: 68.87, width: 2.5 }],
    platforms: [],
    portals: [{ at: 27.56, type: 'spring' }],
    enemies: [],
    collectibles: [{ at: 8.01, height: 1.9 }],
    music: { bpm: 136, root: 62, scale: mixolydian, progression: [0, 4, 2, 3], motif: motif(0, 2, 4, null, 2, 4, 5, null, 4, 2, null, 3, 2, null, 0, null) },
  },
  {
    ...emptyCourse, id: 'midnight-circuit', name: 'Midnight Circuit', zone: 'AFTER-HOURS TURBO',
    color: 0x4f91ff, background: 0x0b1328, floor: 0x131d35, speed: 8.7, length: 104,
    environment: 'midnight-circuit', signature: 'A circuit beam run of 6 hazard groups over 2 open gaps, every landing clear.', designHook: 'Midnight Circuit lays out 6 circuit beam groups, 2 open gaps, 1 portal (dash) and 1 shard.', hazardStyle: 'circuit-beam',
    obstacles: [[10.44, 1], [20.96, 2], [48.8, 1], [59.33, 1], [83.04, 1], [93.56, 1]],
    gaps: [{ at: 35.75, width: 2.5 }, { at: 72.51, width: 2.5 }],
    platforms: [],
    portals: [{ at: 22.74, type: 'dash' }],
    enemies: [],
    collectibles: [{ at: 8.68, height: 1.9 }],
    music: { bpm: 140, root: 50, scale: phrygian, progression: [0, 2, 3, 4], motif: motif(0, null, 1, 3, null, 5, 3, null, 2, null, 1, null, 4, 3, 2, null) },
  },
  {
    ...emptyCourse, id: 'candy-comet', name: 'Candy Comet', zone: 'SWEET BUT SPEEDY',
    color: 0xff79b8, background: 0x27152b, floor: 0x321d38, speed: 8.8, length: 108,
    environment: 'candy-comet', signature: 'A candy cane group into an open gap.', designHook: 'Candy Comet lays out 4 candy cane groups, 4 open gaps, 1 portal (spring), 1 crawler and 1 shard.', hazardStyle: 'candy-cane',
    obstacles: [[10.56, 1], [26.38, 1], [56.53, 1], [81.11, 1]],
    gaps: [{ at: 15.74, width: 2.5 }, { at: 45.89, width: 2.5 }, { at: 61.61, width: 2.5 }, { at: 85.99, width: 2.5 }],
    platforms: [],
    portals: [{ at: 28.72, type: 'spring' }],
    enemies: [{ at: 96.64, type: 'crawler' }],
    collectibles: [{ at: 8.28, height: 1.9 }],
    music: { bpm: 126, root: 57, scale: pentatonicMajor, progression: [0, 3, 4, 0], motif: motif(0, 2, 4, null, 4, 2, 3, null, 0, null, 2, 4, null, 3, 2, null) },
  },
  {
    ...emptyCourse, id: 'aqua-pulse', name: 'Aqua Pulse', zone: 'DEEP BLUE DRIVE',
    color: 0x48f0cf, background: 0x0b202a, floor: 0x102b36, speed: 8.9, length: 112,
    environment: 'aqua-reef', signature: 'A coral group into an open gap.', designHook: 'Aqua Pulse lays out 5 coral groups, 4 open gaps, 1 portal (float), 1 crawler and 1 shard.', hazardStyle: 'coral',
    obstacles: [[10.68, 1], [21.45, 1], [37.55, 2], [64.05, 1], [84.82, 1]],
    gaps: [{ at: 26.78, width: 2.5 }, { at: 53.28, width: 2.5 }, { at: 69.08, width: 2.5 }, { at: 89.75, width: 2.5 }],
    platforms: [],
    portals: [{ at: 44.16, type: 'float' }],
    enemies: [{ at: 100.52, type: 'crawler' }],
    collectibles: [{ at: 8.23, height: 1.9 }],
    music: { bpm: 132, root: 53, scale: dorian, progression: [0, 2, 4, 3], motif: motif(0, null, 2, 3, null, 5, 3, null, 2, null, 4, 5, null, 3, 2, null) },
  },
  {
    ...emptyCourse, id: 'crystal-cavern', name: 'Crystal Cavern', zone: 'ECHOES IN THE DARK',
    color: 0x9daaff, background: 0x14172b, floor: 0x1b2139, speed: 9, length: 116,
    environment: 'crystal-cavern', signature: 'A crystal beam group into an open gap.', designHook: 'Crystal Cavern lays out 5 crystal beam groups, 4 open gaps, 1 portal (phase), 1 drone and 1 shard.', hazardStyle: 'crystal-beam',
    obstacles: [[10.8, 1], [26.68, 1], [37.57, 1], [65.74, 1], [88.22, 1]],
    gaps: [{ at: 15.79, width: 2.5 }, { at: 54.85, width: 2.5 }, { at: 70.93, width: 2.5 }, { at: 93.51, width: 2.5 }],
    platforms: [],
    portals: [{ at: 39.64, type: 'phase' }],
    enemies: [{ at: 104.4, type: 'drone', height: 1.05 }],
    collectibles: [{ at: 9.15, height: 1.9 }],
    music: { bpm: 116, root: 60, scale: phrygian, progression: [0, 3, 2, 4], motif: motif(0, null, 3, null, 5, 4, null, 2, 0, null, 1, null, 3, 5, 2, null) },
  },
  {
    ...emptyCourse, id: 'stormbreaker', name: 'Stormbreaker', zone: 'RIDE THE THUNDER',
    color: 0xff6d73, background: 0x221522, floor: 0x2a1b2b, speed: 9.1, length: 120,
    environment: 'storm-coast', signature: 'A storm debris group into an open gap.', designHook: 'Stormbreaker lays out 5 storm debris groups, 4 open gaps, 2 portals (float and dash), 1 drone and 1 shard.', hazardStyle: 'storm-debris',
    obstacles: [[21.93, 1], [49.43, 1], [50.43, 1], [78.06, 1], [91.71, 1]],
    gaps: [{ at: 10.92, width: 2.5 }, { at: 27.49, width: 2.5 }, { at: 55.89, width: 2.5 }, { at: 97.27, width: 2.5 }],
    platforms: [],
    portals: [{ at: 31.22, type: 'float' }, { at: 59.66, type: 'dash' }],
    enemies: [{ at: 108.28, type: 'drone', height: 1.05 }],
    collectibles: [{ at: 9.28, height: 1.9 }],
    music: { bpm: 144, root: 55, scale: mixolydian, progression: [0, 3, 4, 2], motif: motif(0, 2, null, 4, 5, null, 4, 2, 3, null, 5, null, 4, 2, 0, null) },
  },
  {
    ...emptyCourse, id: 'final-orbit', name: 'Final Orbit', zone: 'THE LAST LAUNCH',
    color: 0xe9f1ff, background: 0x101326, floor: 0x191f38, speed: 9.2, length: 124,
    environment: 'orbital-shipyard', signature: 'An asteroid group into an open gap.', designHook: 'Final Orbit lays out 6 asteroid groups, 4 open gaps, 2 portals (spring and dash), 1 drone and 1 shard.', hazardStyle: 'asteroid',
    obstacles: [[11.04, 1], [27.48, 1], [28.48, 2], [58.3, 1], [74.53, 1], [92.6, 1]],
    gaps: [{ at: 16.35, width: 2.5 }, { at: 47.17, width: 2.5 }, { at: 63.4, width: 2.5 }, { at: 98.36, width: 2.5 }],
    platforms: [],
    portals: [{ at: 31.66, type: 'spring' }, { at: 77.6, type: 'dash' }],
    enemies: [{ at: 112.16, type: 'drone', height: 1.05 }],
    collectibles: [{ at: 8.55, height: 1.9 }],
    music: { bpm: 150, root: 48, scale: pentatonicMinor, progression: [0, 3, 4, 2], motif: motif(0, 3, null, 4, 5, 3, null, 2, 0, null, 4, 5, null, 3, 2, null) },
  },
  {
    ...emptyCourse, id: 'mosslight-hollow', name: 'Mosslight Hollow', zone: 'FIREFLIES BELOW',
    color: 0x96e88a, background: 0x101d1a, floor: 0x182b22, speed: 9.2, length: 128,
    environment: 'mosslight-hollow', signature: 'A moss stump group into an open gap.', designHook: 'Mosslight Hollow lays out 6 moss stump groups, 5 open gaps, 1 portal (float), 1 drone and 2 shards.', hazardStyle: 'moss-stump',
    obstacles: [[11.04, 1], [22.17, 1], [38.4, 1], [61.06, 1], [77.29, 2], [88.49, 1]],
    gaps: [{ at: 27.27, width: 2.5 }, { at: 49.93, width: 2.5 }, { at: 66.17, width: 2.5 }, { at: 93.9, width: 2.5 }, { at: 105.03, width: 2.5 }],
    platforms: [],
    portals: [{ at: 43.24, type: 'float' }],
    enemies: [{ at: 116.16, type: 'drone', height: 1.05 }],
    collectibles: [{ at: 8.24, height: 1.9 }, { at: 19.36, height: 1.9 }],
    music: { bpm: 112, root: 57, scale: pentatonicMajor, progression: [0, 2, 3, 4], motif: motif(0, null, 2, 4, null, 2, 3, null, 4, null, 2, 0, null, 3, 2, null) },
  },
  {
    ...emptyCourse, id: 'clockwork-orchard', name: 'Clockwork Orchard', zone: 'BRASS BLOSSOMS',
    color: 0xeab76d, background: 0x211b28, floor: 0x30252e, speed: 9.3, length: 132,
    environment: 'clockwork-orchard', signature: 'A gear fruit group into an open gap.', designHook: 'Clockwork Orchard lays out 6 gear fruit groups, 5 open gaps, 2 portals (dash and spring), 1 drone and 2 shards.', hazardStyle: 'gear-fruit',
    obstacles: [[11.16, 1], [27.88, 1], [28.88, 2], [58.78, 1], [75.29, 1], [103.11, 1]],
    gaps: [{ at: 16.63, width: 2.5 }, { at: 44.83, width: 2.5 }, { at: 64.04, width: 2.5 }, { at: 91.86, width: 2.5 }, { at: 108.79, width: 2.5 }],
    platforms: [],
    portals: [{ at: 31.59, type: 'dash' }, { at: 78.11, type: 'spring' }],
    enemies: [{ at: 120.04, type: 'drone', height: 1.05 }],
    collectibles: [{ at: 8.64, height: 1.9 }, { at: 16.47, height: 1.87 }],
    music: { bpm: 120, root: 59, scale: mixolydian, progression: [0, 3, 4, 0], motif: motif(0, 2, 4, null, 3, 2, null, 4, 5, null, 2, 0, null, 3, 4, null) },
  },
  {
    ...emptyCourse, id: 'tidal-foundry', name: 'Tidal Foundry', zone: 'PRESSURE AND STEEL',
    color: 0x57e2da, background: 0x10252e, floor: 0x18313a, speed: 9.3, length: 136,
    environment: 'tidal-foundry', signature: 'A foundry pipe group into an open gap.', designHook: 'Tidal Foundry lays out 6 foundry pipe groups, 5 open gaps, 1 portal (dash), 1 drone and 2 shards.', hazardStyle: 'foundry-pipe',
    obstacles: [[11.16, 1], [27.57, 1], [38.82, 1], [67.19, 1], [83.7, 2], [107.42, 1]],
    gaps: [{ at: 16.32, width: 2.5 }, { at: 53.24, width: 2.5 }, { at: 72.45, width: 2.5 }, { at: 96.17, width: 2.5 }, { at: 112.79, width: 2.5 }],
    platforms: [],
    portals: [{ at: 40.55, type: 'dash' }],
    enemies: [{ at: 124.04, type: 'drone', height: 1.05 }],
    collectibles: [{ at: 8.41, height: 1.9 }, { at: 16.18, height: 1.86 }],
    music: { bpm: 138, root: 52, scale: dorian, progression: [0, 3, 2, 4], motif: motif(0, 2, null, 3, 5, null, 4, 2, null, 3, 4, null, 2, 0, null, 3) },
  },
  {
    ...emptyCourse, id: 'paper-moon-parade', name: 'Paper Moon Parade', zone: 'FOLDED NIGHT SKY',
    color: 0xffd99a, background: 0x24213b, floor: 0x302c49, speed: 9.4, length: 140,
    environment: 'paper-moon', signature: 'A paper banner group into an open gap.', designHook: 'Paper Moon Parade lays out 7 paper banner groups, 5 open gaps, 2 portals (spring), 1 drone and 2 shards.', hazardStyle: 'paper-banner',
    obstacles: [[11.28, 1], [28.39, 1], [45.5, 1], [75.34, 1], [92.35, 2], [127.72, 1], [128.72, 1]],
    gaps: [{ at: 17.02, width: 2.5 }, { at: 34.13, width: 2.5 }, { at: 63.97, width: 2.5 }, { at: 80.98, width: 2.5 }, { at: 116.35, width: 2.5 }],
    platforms: [],
    portals: [{ at: 48.64, type: 'spring' }, { at: 95.49, type: 'spring' }],
    enemies: [{ at: 110.82, type: 'drone', height: 1.05 }],
    collectibles: [{ at: 9.37, height: 1.9 }, { at: 16.88, height: 1.8 }],
    music: { bpm: 126, root: 62, scale: pentatonicMajor, progression: [0, 4, 2, 3], motif: motif(0, 2, 4, null, 2, 3, 5, null, 4, 2, null, 3, 2, null, 0, null) },
  },
  {
    ...emptyCourse, id: 'verdant-relay', name: 'Verdant Relay', zone: 'SEEDLIGHT CIRCUIT',
    color: 0x8bf2a7, background: 0x101f20, floor: 0x19302b, speed: 9.4, length: 144,
    environment: 'verdant-greenhouse', signature: 'A thorn group into an open gap.', designHook: 'Verdant Relay lays out 8 thorn groups, 5 open gaps, 1 portal (float), 1 drone and 3 shards.', hazardStyle: 'thorn',
    obstacles: [[11.28, 1], [27.97, 1], [50.82, 1], [51.82, 1], [74.68, 1], [91.68, 1], [120.07, 1], [131.44, 2]],
    gaps: [{ at: 16.6, width: 2.5 }, { at: 39.45, width: 2.5 }, { at: 63.31, width: 2.5 }, { at: 80.31, width: 2.5 }, { at: 108.7, width: 2.5 }],
    platforms: [],
    portals: [{ at: 53.78, type: 'float' }],
    enemies: [{ at: 103.17, type: 'drone', height: 1.05 }],
    collectibles: [{ at: 8.98, height: 1.9 }, { at: 16.44, height: 1.79 }, { at: 25.9, height: 1.9 }],
    music: { bpm: 120, root: 55, scale: pentatonicMajor, progression: [0, 2, 4, 3], motif: motif(0, null, 2, 4, null, 3, 2, null, 4, 5, null, 2, 0, null, 3, 2) },
  },
  {
    ...emptyCourse, id: 'shatterglass-express', name: 'Shatterglass Express', zone: 'PRISM TRAIN RUN',
    color: 0x9fdcff, background: 0x15142d, floor: 0x232248, speed: 9.5, length: 146,
    environment: 'shatterglass', signature: 'A glass shard group into an open gap.', designHook: 'Shatterglass Express lays out 8 glass shard groups, 5 open gaps, 2 portals (phase and dash), 1 drone and 2 shards.', hazardStyle: 'glass-shard',
    obstacles: [[11.4, 1], [28.37, 1], [47.49, 1], [48.49, 1], [72.01, 1], [92.21, 1], [121.83, 1], [133.32, 2]],
    gaps: [{ at: 16.88, width: 2.5 }, { at: 40.7, width: 2.5 }, { at: 63.59, width: 2.5 }, { at: 77.96, width: 2.5 }, { at: 110.34, width: 2.5 }],
    platforms: [],
    portals: [{ at: 34.17, type: 'phase' }, { at: 55.59, type: 'dash' }],
    enemies: [{ at: 104.53, type: 'drone', height: 1.05 }],
    collectibles: [{ at: 9, height: 1.9 }, { at: 16.75, height: 1.83 }],
    music: { bpm: 148, root: 60, scale: phrygian, progression: [0, 3, 2, 4], motif: motif(0, 1, 3, null, 5, 4, null, 2, 0, null, 1, 3, null, 5, 2, null) },
  },
  {
    ...emptyCourse, id: 'cloudbreaker-causeway', name: 'Cloudbreaker Causeway', zone: 'ABOVE THE WEATHER',
    color: 0xb2d8ff, background: 0x192b4a, floor: 0x263b5b, speed: 9.5, length: 148,
    environment: 'cloudbreaker', signature: 'A cloudstone group into an open gap.', designHook: 'Cloudbreaker Causeway lays out 8 cloudstone groups, 6 open gaps, 1 portal (shield), 1 drone and 2 shards.', hazardStyle: 'cloudstone',
    obstacles: [[11.4, 1], [23.89, 1], [47.84, 1], [65.13, 1], [89.08, 1], [106.06, 2], [135.6, 1], [136.6, 1]],
    gaps: [{ at: 17.1, width: 2.5 }, { at: 36.35, width: 2.5 }, { at: 53.64, width: 2.5 }, { at: 77.59, width: 2.5 }, { at: 94.57, width: 2.5 }, { at: 124.11, width: 2.5 }],
    platforms: [],
    portals: [{ at: 70.36, type: 'shield' }],
    enemies: [{ at: 118.52, type: 'drone', height: 1.05 }],
    collectibles: [{ at: 8.68, height: 1.9 }, { at: 16.93, height: 1.89 }],
    music: { bpm: 128, root: 57, scale: pentatonicMajor, progression: [0, 4, 3, 2], motif: motif(0, 2, 4, null, 5, 4, null, 2, 3, null, 4, 2, null, 3, 0, null) },
  },
  {
    ...emptyCourse, id: 'magnetar-foundry', name: 'Magnetar Foundry', zone: 'IRON IN ORBIT',
    color: 0x5bc8ff, background: 0x0d1a2c, floor: 0x152a3f, speed: 9.6, length: 149,
    environment: 'magnetar-forge', signature: 'A magnetic core group into an open gap.', designHook: 'Magnetar Foundry lays out 9 magnetic core groups, 5 open gaps, 2 portals (dash), 1 drone and 2 shards.', hazardStyle: 'magnetic-core',
    obstacles: [[11.52, 1], [28.67, 1], [45.61, 1], [75.02, 1], [87.74, 1], [88.74, 1], [104.75, 1], [119.15, 1], [136.2, 2]],
    gaps: [{ at: 17.06, width: 2.5 }, { at: 34, width: 2.5 }, { at: 60.62, width: 2.5 }, { at: 80.88, width: 2.5 }, { at: 124.59, width: 2.5 }],
    platforms: [],
    portals: [{ at: 49.66, type: 'dash' }, { at: 92.8, type: 'dash' }],
    enemies: [{ at: 103.75, type: 'drone', height: 1.05 }],
    collectibles: [{ at: 9.02, height: 1.9 }, { at: 16.91, height: 1.84 }],
    music: { bpm: 152, root: 48, scale: phrygian, progression: [0, 2, 3, 4], motif: motif(0, 2, null, 4, 5, null, 4, 2, 3, null, 5, 4, null, 2, 0, null) },
  },
  {
    ...emptyCourse, id: 'eclipse-crown', name: 'Eclipse Crown', zone: 'THE LAST LIGHT',
    color: 0xffd86d, background: 0x14152d, floor: 0x242747, speed: 9.6, length: 150,
    environment: 'eclipse-observatory', signature: 'A corona group into an open gap.', designHook: 'Eclipse Crown lays out 10 corona groups, 5 open gaps, 2 portals (shield and float), 1 drone and 3 shards.', hazardStyle: 'corona',
    obstacles: [[11.52, 1], [28.78, 1], [46.26, 1], [57.87, 2], [87.76, 1], [104.8, 1], [105.8, 1], [125.08, 1], [126.08, 1], [138.48, 1]],
    gaps: [{ at: 17.17, width: 2.5 }, { at: 34.64, width: 2.5 }, { at: 76.14, width: 2.5 }, { at: 93.19, width: 2.5 }, { at: 131.62, width: 2.5 }],
    platforms: [],
    portals: [{ at: 65.54, type: 'shield' }, { at: 113.48, type: 'float' }],
    enemies: [{ at: 124.08, type: 'drone', height: 1.05 }],
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
