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
    environment: 'neon-city', signature: 'Learn one clean jump at a time', designHook: 'Tutorial rhythm: single low spikes with roomy landings.', hazardStyle: 'spike',
    obstacles: [[13, 1], [23, 2], [35, 1], [46, 2], [58, 1], [69, 2]],
    music: { bpm: 118, root: 57, scale: pentatonicMinor, progression: [0, 3, 2, 4], motif: motif(0, null, 2, null, 4, 2, null, 3, 0, null, 2, null, 4, 3, 2, null) },
  },
  {
    ...emptyCourse, id: 'skyline-rush', name: 'Skyline Rush', zone: 'CITY AFTER DARK',
    color: 0x56d9ff, background: 0x0a182b, floor: 0x10243a, speed: 8.4, length: 88,
    environment: 'skyline-rooftops', signature: 'Float portal over broken roofs', designHook: 'Rain-slick rooftops, two safe rooftop breaks, and a wind-lift portal.', hazardStyle: 'vent',
    obstacles: [[12, 1], [55, 1], [82, 1]],
    gaps: [{ at: 22, width: 3.2 }, { at: 64, width: 4 }],
    platforms: [{ at: 47, width: 4, height: .5, kind: 'roof' }],
    portals: [{ at: 32, type: 'float' }],
    enemies: [{ at: 41, type: 'crawler' }],
    music: { bpm: 124, root: 60, scale: pentatonicMajor, progression: [0, 4, 3, 4], motif: motif(0, null, 2, 4, null, 2, 4, null, 3, null, 2, null, 4, 2, 0, null) },
  },
  {
    ...emptyCourse, id: 'solar-flare', name: 'Solar Flare', zone: 'HEAT OF THE MOMENT',
    color: 0xff9d52, background: 0x291528, floor: 0x301d2b, speed: 8.5, length: 92,
    environment: 'solar-desert', signature: 'Spring portal launches across solar breaks', designHook: 'Copper dunes, mirrored panels, and spring-assisted jumps over two gaps.', hazardStyle: 'solar-panel',
    obstacles: [[12, 1], [44, 1], [87, 1]],
    gaps: [{ at: 30, width: 3 }, { at: 61, width: 4 }],
    platforms: [{ at: 51, width: 3.8, height: .55, kind: 'panel' }],
    portals: [{ at: 26, type: 'spring' }],
    enemies: [{ at: 72, type: 'drone', height: 1.2 }],
    music: { bpm: 130, root: 52, scale: dorian, progression: [0, 3, 4, 2], motif: motif(0, 2, null, 3, 4, null, 5, 4, 3, null, 2, null, 4, 5, 3, null) },
  },
  {
    ...emptyCourse, id: 'gravity-garden', name: 'Gravity Garden', zone: 'A DIFFERENT RHYTHM',
    color: 0xc18aff, background: 0x17142a, floor: 0x1e1b35, speed: 8.5, length: 96,
    environment: 'gravity-garden', signature: 'Phase portal through glowing vine traps', designHook: 'Spacious greenhouse path with a bobbing root bridge and a brief phase window.', hazardStyle: 'vine',
    obstacles: [[13, 1], [38, 1], [87, 1]],
    gaps: [{ at: 24, width: 3.4 }, { at: 67, width: 4.1 }],
    platforms: [{ at: 56, width: 4.1, height: .5, kind: 'hover' }],
    portals: [{ at: 34, type: 'phase' }],
    enemies: [{ at: 78, type: 'drone', height: 1.3 }],
    music: { bpm: 110, root: 55, scale: pentatonicMajor, progression: [0, 2, 4, 3], motif: motif(0, null, 4, 2, null, 3, 4, null, 2, null, 0, 2, null, 4, 3, null) },
  },
  {
    ...emptyCourse, id: 'pixel-pier', name: 'Pixel Pier', zone: 'ARCADE BY THE SEA',
    color: 0xffdf6e, background: 0x171b30, floor: 0x22233a, speed: 8.6, length: 100,
    environment: 'pixel-pier', signature: 'Shield charge for one arcade hit', designHook: 'Chunky boardwalk breaks and one shield charge among blocky arcade hazards.', hazardStyle: 'pixel-block',
    obstacles: [[12, 1], [41, 1], [86, 1]],
    gaps: [{ at: 23, width: 3.5 }, { at: 65, width: 4 }],
    platforms: [{ at: 54, width: 4, height: .5, kind: 'pier' }],
    portals: [{ at: 33, type: 'shield' }],
    enemies: [{ at: 77, type: 'crawler' }],
    collectibles: [{ at: 92, height: 1.65 }],
    music: { bpm: 136, root: 62, scale: mixolydian, progression: [0, 4, 2, 3], motif: motif(0, 2, 4, null, 2, 4, 5, null, 4, 2, null, 3, 2, null, 0, null) },
  },
  {
    ...emptyCourse, id: 'midnight-circuit', name: 'Midnight Circuit', zone: 'AFTER-HOURS TURBO',
    color: 0x4f91ff, background: 0x0b1328, floor: 0x131d35, speed: 8.7, length: 104,
    environment: 'midnight-circuit', signature: 'Dash gates accelerate a clear straightaway', designHook: 'Black-glass raceway, timing bars, and a short boost before a wide landing.', hazardStyle: 'circuit-beam',
    obstacles: [[13, 1], [56, 1], [98, 1]],
    gaps: [{ at: 26, width: 3.8 }, { at: 73, width: 4.2 }],
    platforms: [{ at: 61, width: 3.5, height: .4, kind: 'curb' }],
    portals: [{ at: 38, type: 'dash' }],
    enemies: [{ at: 84, type: 'drone', height: 1.25 }],
    music: { bpm: 140, root: 50, scale: phrygian, progression: [0, 2, 3, 4], motif: motif(0, null, 1, 3, null, 5, 3, null, 2, null, 1, null, 4, 3, 2, null) },
  },
  {
    ...emptyCourse, id: 'candy-comet', name: 'Candy Comet', zone: 'SWEET BUT SPEEDY',
    color: 0xff79b8, background: 0x27152b, floor: 0x321d38, speed: 8.8, length: 108,
    environment: 'candy-comet', signature: 'Float portal softens a bridge break', designHook: 'Peppermint arches, a nougat bridge, and a float-assisted comet jump.', hazardStyle: 'candy-cane',
    obstacles: [[13, 1], [42, 1], [99, 1]],
    gaps: [{ at: 25, width: 3.6 }, { at: 72, width: 4.1 }],
    platforms: [{ at: 48, width: 4.2, height: .55, kind: 'nougat' }],
    portals: [{ at: 36, type: 'float' }],
    enemies: [{ at: 60, type: 'crawler' }, { at: 84, type: 'drone', height: 1.2 }],
    music: { bpm: 126, root: 57, scale: pentatonicMajor, progression: [0, 3, 4, 0], motif: motif(0, 2, 4, null, 4, 2, 3, null, 0, null, 2, 4, null, 3, 2, null) },
  },
  {
    ...emptyCourse, id: 'aqua-pulse', name: 'Aqua Pulse', zone: 'DEEP BLUE DRIVE',
    color: 0x48f0cf, background: 0x0b202a, floor: 0x102b36, speed: 8.9, length: 112,
    environment: 'aqua-reef', signature: 'Tidal gates pulse between coral obstacles', designHook: 'Underwater coral gates and bubbles; gaps are short and separated by long safe runs.', hazardStyle: 'coral',
    obstacles: [[16, 1], [34, 1], [103, 1]],
    gaps: [{ at: 45, width: 3.2 }, { at: 91, width: 3.6 }],
    platforms: [{ at: 66, width: 4.2, height: .4, kind: 'reef' }],
    portals: [{ at: 25, type: 'float' }],
    enemies: [{ at: 60, type: 'drone', height: 1.3 }],
    collectibles: [{ at: 74, height: 1.7 }],
    music: { bpm: 132, root: 53, scale: dorian, progression: [0, 2, 4, 3], motif: motif(0, null, 2, 3, null, 5, 3, null, 2, null, 4, 5, null, 3, 2, null) },
  },
  {
    ...emptyCourse, id: 'crystal-cavern', name: 'Crystal Cavern', zone: 'ECHOES IN THE DARK',
    color: 0x9daaff, background: 0x14172b, floor: 0x1b2139, speed: 9, length: 116,
    environment: 'crystal-cavern', signature: 'Crystal beams require a timed jump', designHook: 'Prism pylons fire wide laser bars, each followed by a broad recovery lane.', hazardStyle: 'crystal-beam',
    obstacles: [[15, 1], [33, 1], [51, 1], [72, 1], [100, 1]],
    gaps: [{ at: 58, width: 3.2 }],
    platforms: [{ at: 82, width: 4, height: .45, kind: 'crystal' }],
    portals: [{ at: 45, type: 'spring' }],
    enemies: [],
    collectibles: [{ at: 88, height: 1.75 }],
    music: { bpm: 116, root: 60, scale: phrygian, progression: [0, 3, 2, 4], motif: motif(0, null, 3, null, 5, 4, null, 2, 0, null, 1, null, 3, 5, 2, null) },
  },
  {
    ...emptyCourse, id: 'stormbreaker', name: 'Stormbreaker', zone: 'RIDE THE THUNDER',
    color: 0xff6d73, background: 0x221522, floor: 0x2a1b2b, speed: 9.1, length: 120,
    environment: 'storm-coast', signature: 'Gust portals float over storm debris', designHook: 'Wind-bent coast with drifting debris, isolated threats, and clear landing lanes.', hazardStyle: 'storm-debris',
    obstacles: [[16, 1], [35, 1], [89, 1], [108, 1]],
    gaps: [{ at: 52, width: 3.3 }, { at: 97, width: 3.8 }],
    platforms: [{ at: 77, width: 4, height: .45, kind: 'cliff' }],
    portals: [{ at: 27, type: 'float' }, { at: 82, type: 'dash' }],
    enemies: [{ at: 62, type: 'drone', height: 1.05 }],
    collectibles: [{ at: 66, height: 1.75 }],
    music: { bpm: 144, root: 55, scale: mixolydian, progression: [0, 3, 4, 2], motif: motif(0, 2, null, 4, 5, null, 4, 2, 3, null, 5, null, 4, 2, 0, null) },
  },
  {
    ...emptyCourse, id: 'final-orbit', name: 'Final Orbit', zone: 'THE LAST LAUNCH',
    color: 0xe9f1ff, background: 0x101326, floor: 0x191f38, speed: 9.2, length: 124,
    environment: 'orbital-shipyard', signature: 'Spring pads auto-launch between shipyard barriers', designHook: 'Orbital gantries, spring portals, and optional star pickups on long clear straights.', hazardStyle: 'asteroid',
    obstacles: [[16, 1], [36, 1], [118, 1]],
    gaps: [{ at: 52, width: 3.2 }, { at: 80, width: 3.6 }],
    platforms: [{ at: 67, width: 4.2, height: .5, kind: 'gantry' }],
    portals: [{ at: 23, type: 'spring' }, { at: 49, type: 'spring' }, { at: 77, type: 'spring' }, { at: 103, type: 'spring' }],
    enemies: [{ at: 96, type: 'drone', height: 1.3 }],
    collectibles: [{ at: 114, height: 1.7 }],
    music: { bpm: 150, root: 48, scale: pentatonicMinor, progression: [0, 3, 4, 2], motif: motif(0, 3, null, 4, 5, 3, null, 2, 0, null, 4, 5, null, 3, 2, null) },
  },
  {
    ...emptyCourse, id: 'mosslight-hollow', name: 'Mosslight Hollow', zone: 'FIREFLIES BELOW',
    color: 0x96e88a, background: 0x101d1a, floor: 0x182b22, speed: 9.2, length: 128,
    environment: 'mosslight-hollow', signature: 'Hover stones bridge three shallow chasms', designHook: 'Mossy basalt islands, short floating platforms, and visible shallow gaps.', hazardStyle: 'moss-stump',
    obstacles: [[18, 1], [46, 1], [84, 1]],
    gaps: [{ at: 33, width: 3.2 }, { at: 71, width: 3.6 }, { at: 108, width: 3.4 }],
    platforms: [{ at: 24, width: 5, height: .45, kind: 'hover' }, { at: 62, width: 5, height: .5, kind: 'hover' }, { at: 99, width: 5, height: .45, kind: 'hover' }],
    portals: [{ at: 89, type: 'float' }],
    enemies: [{ at: 92, type: 'drone', height: 1.05 }],
    collectibles: [{ at: 121, height: 1.7 }],
    music: { bpm: 112, root: 57, scale: pentatonicMajor, progression: [0, 2, 3, 4], motif: motif(0, null, 2, 4, null, 2, 3, null, 4, null, 2, 0, null, 3, 2, null) },
  },
  {
    ...emptyCourse, id: 'clockwork-orchard', name: 'Clockwork Orchard', zone: 'BRASS BLOSSOMS',
    color: 0xeab76d, background: 0x211b28, floor: 0x30252e, speed: 9.3, length: 132,
    environment: 'clockwork-orchard', signature: 'Shield portals pair with one protected enemy', designHook: 'Mechanical fruit trees and an alternating crawler/drone shield route.', hazardStyle: 'gear-fruit',
    obstacles: [[15, 1], [38, 1], [68, 1], [99, 1], [128, 1]],
    gaps: [{ at: 55, width: 3.4 }, { at: 89, width: 3.8 }],
    platforms: [{ at: 75, width: 4.5, height: .55, kind: 'trellis' }],
    portals: [{ at: 20, type: 'shield' }, { at: 48, type: 'shield' }, { at: 79, type: 'shield' }, { at: 109, type: 'shield' }],
    enemies: [{ at: 29, type: 'crawler' }, { at: 57, type: 'drone', height: 1.25 }, { at: 89, type: 'crawler' }, { at: 119, type: 'drone', height: 1.25 }],
    collectibles: [{ at: 68, height: 1.65 }],
    music: { bpm: 120, root: 59, scale: mixolydian, progression: [0, 3, 4, 0], motif: motif(0, 2, 4, null, 3, 2, null, 4, 5, null, 2, 0, null, 3, 4, null) },
  },
  {
    ...emptyCourse, id: 'tidal-foundry', name: 'Tidal Foundry', zone: 'PRESSURE AND STEEL',
    color: 0x57e2da, background: 0x10252e, floor: 0x18313a, speed: 9.3, length: 136,
    environment: 'tidal-foundry', signature: 'Alternating raised conveyor bridges cross water gaps', designHook: 'Copper pressure pipes, shallow water chasms, and alternating raised lanes.', hazardStyle: 'foundry-pipe',
    obstacles: [[12, 1], [59, 1], [96, 1]],
    gaps: [{ at: 26, width: 3 }, { at: 50, width: 3 }, { at: 86, width: 3 }, { at: 125, width: 2.8 }],
    platforms: [{ at: 35, width: 4, height: .5, kind: 'conveyor' }, { at: 66, width: 4, height: .55, kind: 'bridge' }, { at: 104, width: 4, height: .5, kind: 'conveyor' }],
    portals: [{ at: 112, type: 'dash' }],
    enemies: [{ at: 43, type: 'crawler' }, { at: 78, type: 'drone', height: 1.3 }, { at: 117, type: 'crawler' }],
    music: { bpm: 138, root: 52, scale: dorian, progression: [0, 3, 2, 4], motif: motif(0, 2, null, 3, 5, null, 4, 2, null, 3, 4, null, 2, 0, null, 3) },
  },
  {
    ...emptyCourse, id: 'paper-moon-parade', name: 'Paper Moon Parade', zone: 'FOLDED NIGHT SKY',
    color: 0xffd99a, background: 0x24213b, floor: 0x302c49, speed: 9.4, length: 140,
    environment: 'paper-moon', signature: 'Spring portals float the runner through a moon parade', designHook: 'Origami lanterns, four spring gates, and measured bridge-break jumps.', hazardStyle: 'paper-banner',
    obstacles: [[17, 1], [68, 1], [130, 1]],
    gaps: [{ at: 29, width: 3 }, { at: 57, width: 3 }, { at: 86, width: 3 }, { at: 117, width: 3 }],
    platforms: [{ at: 73, width: 4.5, height: .5, kind: 'float' }],
    portals: [{ at: 25, type: 'spring' }, { at: 53, type: 'spring' }, { at: 82, type: 'spring' }, { at: 113, type: 'spring' }],
    enemies: [{ at: 39, type: 'crawler' }, { at: 98, type: 'drone', height: 1.3 }],
    collectibles: [{ at: 134, height: 1.7 }],
    music: { bpm: 126, root: 62, scale: pentatonicMajor, progression: [0, 4, 2, 3], motif: motif(0, 2, 4, null, 2, 3, 5, null, 4, 2, null, 3, 2, null, 0, null) },
  },
  {
    ...emptyCourse, id: 'verdant-relay', name: 'Verdant Relay', zone: 'SEEDLIGHT CIRCUIT',
    color: 0x8bf2a7, background: 0x101f20, floor: 0x19302b, speed: 9.4, length: 144,
    environment: 'verdant-greenhouse', signature: 'Optional shard trails reward precise bridge jumps', designHook: 'Canopy route with four short bridges and collectible trails above safe ground.', hazardStyle: 'thorn',
    obstacles: [[18, 1], [48, 1], [132, 1]],
    gaps: [{ at: 35, width: 3 }, { at: 67, width: 3 }, { at: 101, width: 3 }],
    platforms: [{ at: 22, width: 4, height: .5, kind: 'leaf' }, { at: 53, width: 4, height: .55, kind: 'leaf' }, { at: 89, width: 4, height: .5, kind: 'leaf' }, { at: 124, width: 4, height: .55, kind: 'leaf' }],
    portals: [{ at: 72, type: 'float' }],
    enemies: [],
    collectibles: [{ at: 26, height: 1.85 }, { at: 29, height: 1.9 }, { at: 32, height: 1.85 }, { at: 57, height: 1.85 }, { at: 60, height: 1.9 }, { at: 63, height: 1.85 }, { at: 93, height: 1.85 }, { at: 96, height: 1.9 }],
    music: { bpm: 120, root: 55, scale: pentatonicMajor, progression: [0, 2, 4, 3], motif: motif(0, null, 2, 4, null, 3, 2, null, 4, 5, null, 2, 0, null, 3, 2) },
  },
  {
    ...emptyCourse, id: 'shatterglass-express', name: 'Shatterglass Express', zone: 'PRISM TRAIN RUN',
    color: 0x9fdcff, background: 0x15142d, floor: 0x232248, speed: 9.5, length: 146,
    environment: 'shatterglass', signature: 'Phase portals cross crystal hazards and gaps', designHook: 'Prismatic rail tunnel with four phase gates, spaced gaps, and wide landing spans.', hazardStyle: 'glass-shard',
    obstacles: [[17, 1], [29, 1], [47, 1], [64, 1], [84, 1], [101, 1], [122, 1], [140, 1]],
    gaps: [{ at: 35, width: 3 }, { at: 73, width: 3 }, { at: 110, width: 3 }],
    platforms: [{ at: 73, width: 4.5, height: .4, kind: 'rail' }],
    portals: [{ at: 21, type: 'phase' }, { at: 56, type: 'phase' }, { at: 94, type: 'phase' }, { at: 132, type: 'phase' }],
    enemies: [],
    collectibles: [{ at: 77, height: 1.75 }],
    music: { bpm: 148, root: 60, scale: phrygian, progression: [0, 3, 2, 4], motif: motif(0, 1, 3, null, 5, 4, null, 2, 0, null, 1, 3, null, 5, 2, null) },
  },
  {
    ...emptyCourse, id: 'cloudbreaker-causeway', name: 'Cloudbreaker Causeway', zone: 'ABOVE THE WEATHER',
    color: 0xb2d8ff, background: 0x192b4a, floor: 0x263b5b, speed: 9.5, length: 148,
    environment: 'cloudbreaker', signature: 'Cloudstone bridges alternate with short chasms', designHook: 'Sunrise sky islands with low, broad bridges and generous landing zones.', hazardStyle: 'cloudstone',
    obstacles: [[19, 1], [84, 1], [126, 1]],
    gaps: [{ at: 33, width: 3 }, { at: 72, width: 4 }, { at: 114, width: 3 }],
    platforms: [{ at: 23, width: 4, height: .55, kind: 'cloudstone' }, { at: 62, width: 4, height: .5, kind: 'cloudstone' }, { at: 104, width: 4, height: .55, kind: 'cloudstone' }, { at: 136, width: 4, height: .5, kind: 'cloudstone' }],
    portals: [{ at: 80, type: 'float' }],
    enemies: [{ at: 52, type: 'drone', height: 1.3 }, { at: 94, type: 'crawler' }],
    collectibles: [{ at: 140, height: 1.75 }],
    music: { bpm: 128, root: 57, scale: pentatonicMajor, progression: [0, 4, 3, 2], motif: motif(0, 2, 4, null, 5, 4, null, 2, 3, null, 4, 2, null, 3, 0, null) },
  },
  {
    ...emptyCourse, id: 'magnetar-foundry', name: 'Magnetar Foundry', zone: 'IRON IN ORBIT',
    color: 0x5bc8ff, background: 0x0d1a2c, floor: 0x152a3f, speed: 9.6, length: 149,
    environment: 'magnetar-forge', signature: 'Dash portals launch across long magnetic gaps', designHook: 'Cobalt asteroid forge with dash lanes, magnetic debris, and clean post-boost landings.', hazardStyle: 'magnetic-core',
    obstacles: [[16, 1], [50, 1], [89, 1]],
    gaps: [{ at: 29, width: 3 }, { at: 67, width: 3 }, { at: 107, width: 3 }, { at: 143, width: 2.5 }],
    platforms: [{ at: 37, width: 4, height: .45, kind: 'magnetic' }, { at: 75, width: 4, height: .45, kind: 'magnetic' }, { at: 121, width: 4, height: .5, kind: 'magnetic' }],
    portals: [{ at: 20, type: 'dash' }, { at: 58, type: 'dash' }, { at: 98, type: 'dash' }, { at: 138, type: 'dash' }],
    enemies: [{ at: 130, type: 'drone', height: 1.3 }],
    collectibles: [{ at: 84, height: 1.8 }],
    music: { bpm: 152, root: 48, scale: phrygian, progression: [0, 2, 3, 4], motif: motif(0, 2, null, 4, 5, null, 4, 2, 3, null, 5, 4, null, 2, 0, null) },
  },
  {
    ...emptyCourse, id: 'eclipse-crown', name: 'Eclipse Crown', zone: 'THE LAST LIGHT',
    color: 0xffd86d, background: 0x14152d, floor: 0x242747, speed: 9.6, length: 150,
    environment: 'eclipse-observatory', signature: 'Shield and float portals form the final gauntlet', designHook: 'Black-sun observatory finale alternating shield, float, gaps, and spaced enemies.', hazardStyle: 'corona',
    obstacles: [[18, 1], [80, 1], [132, 1]],
    gaps: [{ at: 31, width: 3 }, { at: 71, width: 3 }, { at: 114, width: 3 }, { at: 145, width: 2.5 }],
    platforms: [{ at: 44, width: 4, height: .45, kind: 'observatory' }, { at: 86, width: 4, height: .45, kind: 'observatory' }, { at: 121, width: 4, height: .5, kind: 'observatory' }],
    portals: [{ at: 22, type: 'shield' }, { at: 62, type: 'float' }, { at: 89, type: 'shield' }, { at: 138, type: 'float' }],
    enemies: [{ at: 53, type: 'drone', height: 1.35 }, { at: 96, type: 'crawler' }],
    collectibles: [{ at: 133, height: 1.8 }],
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
      if (previousEnd > 0 && distance - previousEnd < level.speed * .9) throw new Error(`${level.name} has groups too close for a fair landing window.`);
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
  }
  return true;
}

export function getLevel(id) {
  return levels.find((level) => level.id === id);
}

validateLevels(levels);
