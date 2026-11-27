// The Wool Road tier table and rhythm briefs. Only course 1 ships today; add
// one entry per later course and the composer handles the rest.
export const woolTiers = [
  { tier: 1, courses: '1–5', length: '76–92', speed: '7.8–8.2', inputs: '0.60–0.68' },
  { tier: 2, courses: '6–10', length: '96–112', speed: '8.3–8.7', inputs: '0.70–0.78' },
  { tier: 3, courses: '11–15', length: '116–132', speed: '8.8–9.2', inputs: '0.80–0.94' },
  { tier: 4, courses: '16–20', length: '136–150', speed: '9.3–9.6', inputs: '0.96–1.05' },
];

export const woolBlueprint = [
  {
    id: 'wool-thimble-meadow', target: .62, phrase: [1, 2], rest: 2.2, portals: [], shards: 1,
    vocabulary: {
      skins: ['spike', 'yarn-spike', 'felt-block'],
      arcs: [{ source: 'gap', ordinal: 1, count: 3 }],
      arches: ['finish'],
      pomPoms: 4,
    },
  },
  {
    id: 'wool-02-button-bush', target: .67, phrase: [1, 2], rest: 2.2, portals: [], shards: 1, wideGap: { ordinal: 0, width: 4 }, padBeforeGap: 0, shardAbovePad: true,
    vocabulary: {
      skins: ['button-bomb', 'spike', 'button-bomb'],
      replaceGroup: { ordinal: 3, type: 'beetle' },
      arcs: [{ source: 'pad', count: 3 }],
      replaceShards: true,
      arches: ['checkpoint'],
      pomPoms: 5,
    },
  },
  {
    id: 'wool-03-darning-dell', target: 0.64, phrase: [1, 2], rest: 2.2, portals: [], shards: 1,
  },
  {
    id: 'wool-04-pillow-pines', target: 0.66, phrase: [1, 2], rest: 2.2, portals: [], shards: 1,
  },
  {
    id: 'wool-05-loom-lake', target: 0.68, phrase: [1, 2], rest: 2.1, portals: [], shards: 1,
  },
  {
    id: 'wool-06-patchwork-square', target: 0.7, phrase: [2, 2], rest: 2.0, portals: ['float'], shards: 1,
  },
  {
    id: 'wool-07-bobble-bridge', target: 0.72, phrase: [1, 2], rest: 2.0, portals: ['spring'], shards: 1,
  },
  {
    id: 'wool-08-spool-street', target: 0.74, phrase: [2, 2], rest: 2.0, portals: ['float'], shards: 1,
  },
  {
    id: 'wool-09-cardigan-cove', target: 0.76, phrase: [2, 1], rest: 1.95, portals: ['dash'], shards: 1,
  },
  {
    id: 'wool-10-tassel-terrace', target: 0.78, phrase: [2, 2], rest: 1.95, portals: ['float', 'spring'], shards: 1,
  },
  {
    id: 'wool-11-yarnstorm-ridge', target: 0.8, phrase: [2, 1], rest: 1.9, portals: ['float'], shards: 1,
  },
  {
    id: 'wool-12-tangled-thicket', target: 0.83, phrase: [2, 1], rest: 1.9, portals: ['spring', 'float'], shards: 1,
  },
  {
    id: 'wool-13-kite-string', target: 0.86, phrase: [2, 1], rest: 1.85, portals: ['dash', 'float'], shards: 1,
  },
  {
    id: 'wool-14-winders-climb', target: .9, phrase: [3, 2], rest: 1.85, portals: ['spring', 'dash'], shards: 1,
  },
  {
    id: 'wool-15-frayed-frontier', target: 0.94, phrase: [3, 2], rest: 1.8, portals: ['float', 'spring'], shards: 1,
  },
  {
    id: 'wool-16-button-barrel', target: 0.96, phrase: [3, 2], rest: 1.8, portals: ['float', 'dash'], shards: 1,
  },
  {
    id: 'wool-17-needle-nook', target: 0.98, phrase: [3, 2], rest: 1.75, portals: ['spring', 'float'], shards: 1,
  },
  {
    id: 'wool-18-dust-bunny-run', target: 1.0, phrase: [3, 2], rest: 1.75, portals: ['float', 'spring'], shards: 1,
  },
];
