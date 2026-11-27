const pentatonicMajor = [0, 2, 4, 7, 9];
const motif = (...steps) => steps;
const emptyCourse = { gaps: [], platforms: [], portals: [], enemies: [], collectibles: [] };

// Wool Road is a second campaign. Its courses carry their palette and scenery
// explicitly so a wool course can never inherit a core environment by accident.
export const woolLevels = [
  {
    ...emptyCourse, id: 'wool-thimble-meadow', name: 'Thimble Meadow', zone: 'FIRST STITCHES',
    campaign: 'wool',
    color: 0xe8a0a8, background: 0xf6eadf, floor: 0x4a3b36,
    speed: 7.8, length: 76,
    environment: 'wool-meadow', scenery: 'wool',
    palette: { sky: 0xF6EADF, lane: 0x4A3B36, accent: 0xE8A0A8, platform: 0xD8CCC0 },
    signature: 'Three open gaps in the meadow, each one a single soft landing.', designHook: 'Thimble Meadow lays out 3 spike groups, 3 gaps, 1 bounce pad and 1 shard.',
    hazardStyle: 'spike',
    obstacles: [[9.36, 1], [33.86, 1], [65.36, 2]],
    gaps: [{ at: 26.52, width: 2.5 }, { at: 50.69, width: 2.5 }, { at: 58.02, width: 2.5 }],
    platforms: [{ at: 15, width: 3.5, height: 0.35, kind: 'bounce' }],
    portals: [],
    enemies: [],
    collectibles: [{ at: 8.36, height: 1.85 }],
    music: { bpm: 108, root: 60, scale: pentatonicMajor, progression: [0, 2, 4, 3], motif: motif(0, null, 2, 4, null, 2, 3, null, 4, null, 2, null, 3, 2, 0, null) },
  },
  {
    ...emptyCourse, id: 'wool-02-button-bush', name: 'Button Bush', zone: 'FIRST STITCHES',
    campaign: 'wool',
    color: 0x8fbf9f, background: 0xf6eadf, floor: 0x4a3b36,
    speed: 7.9, length: 82,
    environment: 'wool-button-bush', scenery: 'wool',
    palette: { sky: 0xF6EADF, lane: 0x4A3B36, accent: 0x8FBF9F, platform: 0xD8CCC0 },
    signature: 'A plush pad under the first shard launches you at the wide gap; two open holes follow.', designHook: 'Button Bush lays out 4 spike groups, 3 gaps, 1 bounce pad and 1 shard.',
    hazardStyle: 'spike',
    obstacles: [[9.48, 1], [43.16, 1], [57.84, 1], [72.52, 1]],
    gaps: [{ at: 26.86, width: 4 }, { at: 50.44, width: 2.5 }, { at: 65.12, width: 2.5 }],
    platforms: [{ at: 20.5, width: 3.5, height: 0.35, kind: 'bounce' }],
    portals: [],
    enemies: [],
    collectibles: [{ at: 22.25, height: 1.7 }],
    music: { bpm: 112, root: 62, scale: pentatonicMajor, progression: [0, 2, 4, 3], motif: motif(0, null, 2, 4, null, 3, 2, null, 4, null, 2, 0, null, 3, 2, null) },
  },
];
