# Level verification pipeline

The level tools answer three different questions: whether the deterministic auto-player can finish a course, how much timing room its jumps have, and whether feature spacing is readable and varied. They analyze the authored catalogue without changing it.

## Course vocabulary

Distances are measured in course units. The runner stays at world `x = -3`; a feature authored at `at` starts at world `at - 3`, so `at` is also the course distance at which that feature reaches the runner.

- **Obstacle groups** contain one or two hazards. The second hazard is **1.28 units** after the first. Collision clearance comes from the level's hazard profile.
- **Gaps** are authored with an `at` position and a width, currently **2.5–5 units** in the catalogue. Open gaps remove ground support.
- **Platforms** are raised surfaces. A grounded runner can step onto a rise of at most **0.6 units**. A platform covering a gap forms a **bridge** and can be crossed without jumping.
- **Portals** have five effects: **spring** launches at 10.8 units/s, **dash** multiplies speed by 1.24 for 2.2 s, **float** multiplies gravity by 0.58 for 2.8 s, **shield** supplies one hit charge, and **phase** lasts 2.4 s.
- **Crawlers** are ground enemies and can be stomped; **drones** occupy an authored height and are not stompable.
- **Collectible shards** are optional pickups with horizontal and vertical contact tests. They do not make a course easier to finish.

## Physics used by the tools

The tools import `jumpTuning`, `motionTuning`, `getHazardProfile()`, `portalEffects`, and the support/motion helpers from `src/game-logic.js`; they do not keep a second set of jump, gravity, hazard-clearance, or portal-effect constants.

A normal jump starts at **8.5 units/s** under gravity **19 units/s²**:

```text
air time    = 2 × 8.5 / 19 = 0.894736… s
jump reach  = level speed × air time
gap reach   = jump reach at the applicable speed
```

At speed 8.2, for example, one normal jump spans about **7.34 course units**. Dash multiplies horizontal reach by **1.24** while active. Float changes simulated vertical motion for its actual duration rather than being folded into the base reach constant.

`tools/level-physics.mjs` exports `airTime()`, `jumpReach(speed)`, `gapReach(speed)`, and `beatWindows(level)`. Beat windows describe the course-distance intervals in which a runner must be airborne (hazards, open gaps, and enemies) or supported by a bridge. Hazard groups retain their 1.28-unit internal spacing and collision extents.

## Fair spacing

Compare the distance between consecutive beats with one jump reach at the applicable speed:

- **Same jump:** at most **0.8 × reach**.
- **Reaction spacing:** at least **1.35 × reach**.
- **Do not author the region between those bands.** The report calls **0.8 × reach < spacing < 1.35 × reach** the **dead band**: the previous jump lands too late for a comfortable reaction, while jumping for both beats in the previous arc is too early.

A dash portal compresses following spacing because it increases reach while the authored distance stays fixed. The report resolves dash duration in the time/distance domain and uses the speed in effect at each beat.

**Telegraph** is clear track before a beat divided by level speed. A beat with less than **0.6 s** of clear track is flagged. Low variety is descriptive rather than a playability failure: the report counts distinct feature categories and names categories used exactly once.

## Run the tools

```sh
node tools/auto-player.mjs                 # every catalogue level
node tools/auto-player.mjs neon-run        # one or more selected ids
node tools/level-report.mjs                # aligned twenty-level report

npm run levels:play
npm run levels:report
npm run levels:check                       # auto-player plus synthetic tool tests
```

The auto-player advances at a fixed **1/120 s**, applies portals when they reach the runner, and uses `findStepSurface`, `getTrackSupportHeight`, and `stepPlayerMotion` through the shared motion path. It chooses the latest safe reachable jump opportunity, never performs a second jump in the air, and uses the shared obstacle and collectible collision helpers. It exits non-zero if any selected level cannot be completed.

## Read the report

Each row contains inputs per second (hazard groups, gaps, and enemies divided by `finishTime`), individual obstacles per second, gap and enemy counts, the smallest jump margin, jump count, dead-band findings, short telegraphs, feature variety, and completion status. Platforms and portals are course features, not jump-triggering inputs, so they do not inflate the input rate.

- **Margin** is course distance between the latest distance at which a jump had to start and where the auto-player actually started it. Smaller values mean less timing room; a negative value means the policy started after the ideal deadline.
- **Dead band** shows both the number of violations and their authored beat-to-beat distances.
- **Telegraph** lists every beat below 0.6 s; the minimum clear-track time is included for comparison.
- **Variety** counts obstacle, gap, platform, portal, enemy, and collectible categories when present. Single-use categories are named separately.

The summary gives average inputs/s, auto-player completions, dead-band and telegraph totals, and failed level ids with the recorded death reason. A completed level can still have spacing or telegraph warnings; conversely, an auto-player failure is reported as a failure, never repaired by changing level data or relaxing the solver.

The unit tests in `src/levels.tools.test.js` use only synthetic levels. They cover normal jumping, dead-band detection, impossible gaps, bridge support, dash spacing, and tightening a second beat.
