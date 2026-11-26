# Level verification pipeline

The level tools answer three different questions: whether the deterministic auto-player can finish a course, how much timing room its jumps have, and whether feature spacing is readable and varied. They analyze the authored catalogue without changing it.

## Course vocabulary

Distances are measured in course units. The runner stays at world `x = -3`; a feature authored at `at` starts at world `at - 3`, so `at` is also the course distance at which that feature reaches the runner.

- **Obstacle groups** contain one or two hazards. The second hazard is **1.28 units** after the first. Collision clearance comes from the level's hazard profile.
- **Gaps** are authored with an `at` position and a width, currently **2.5–7 units** in the catalogue. Open gaps remove ground support. An island gap is wider so the platform can sit inside it with at least **1.6 units** of hole on each side.
- **Platforms** are raised surfaces. A grounded runner can step onto a rise of at most **0.6 units**. A platform covering a gap forms a **bridge** and can be crossed without jumping.
- **Platform archetypes** give the mix a readable shape: `kerb` (.45 high, 4–5 wide, on plain track), `shelf` (.50 high, 9–11 wide with half a jump reach of clear track at each end), `island` (.90 high, 2.5–3 wide, a six-sided prism inside a gap), `hover` (.45 high, bobbing ±.10, courses 15–20 only), and `perch` (a kerb with a crawler standing at the platform centre). Every non-bridge platform except the perch carries a shard.
- **Portals** have five effects: **spring** launches at 10.8 units/s, **dash** multiplies speed by 1.24 for 2.2 s, **float** multiplies gravity by 0.58 for 2.8 s, **shield** supplies one hit charge, and **phase** lasts 2.4 s.
- **Crawlers** are ground enemies and can be stomped; **drones** occupy an authored height and are not stompable.
- **Collectible shards** are optional pickups with horizontal and vertical contact tests. They do not make a course easier to finish.

## Physics used by the tools

The tools import `jumpTuning`, `motionTuning`, `getHazardProfile()`, `portalEffects`, and the support/motion helpers from `src/game-logic.js`; they do not keep a second set of jump, gravity, hazard-clearance, or portal-effect constants.

A normal jump starts at **10 units/s**. Gravity is asymmetric: **27 units/s²** while the runner is rising (`velocityY > 0`) and **1.45 × 27 = 39.15 units/s²** while falling (`velocityY <= 0`). `stepPlayerMotion()` chooses the regime from the velocity at the start of each step.

```text
rise time   = 10 / 27                       = 0.370370… s
apex height = 10² / (2 × 27)                = 1.851851… units
fall time   = 10 / (27 × √1.45)             = 0.307578… s
air time    = 0.370370… + 0.307578…         = 0.677948… s
jump reach  = level speed × air time
gap reach   = jump reach at the applicable speed
```

At speed 8.2, for example, one normal jump spans about **5.56 course units** (down from 7.34 before the asymmetric jump). Dash multiplies horizontal reach by **1.24** while active. Float changes simulated vertical motion for its actual duration rather than being folded into the base reach constant.

`tools/level-physics.mjs` exports `airTime()`, `jumpReach(speed)`, `gapReach(speed)`, and `beatWindows(level)`. Beat windows describe the course-distance intervals in which a runner must be airborne (hazards, open gaps, and enemies) or supported by a bridge. Hazard groups retain their 1.28-unit internal spacing and collision extents.

## Fair spacing

Compare the distance between consecutive beats with one jump reach at the applicable speed:

- **Same jump:** at most **0.8 × reach**.
- **Reaction spacing:** at least **1.35 × reach**.
- **Do not author the region between those bands.** The report calls **0.8 × reach < spacing < 1.35 × reach** the **dead band**: the previous jump lands too late for a comfortable reaction, while jumping for both beats in the previous arc is too early.

A dash portal compresses following spacing because it increases reach while the authored distance stays fixed. The report resolves dash duration in the time/distance domain and uses the speed in effect at each beat.

**Telegraph** is clear track before the first beat of a phrase divided by level speed. Every phrase opener needs at least **0.6 s** of clear track. Beats that share the previous jump are already committed to, so they are counted separately as **combo beats** rather than flagged. Low variety is descriptive rather than a playability failure: the report counts distinct feature categories and names categories used exactly once.

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

Each row contains inputs per second (hazard groups, gaps, and enemies divided by `finishTime`), individual obstacles per second, gap, bridge and enemy counts, the platform archetype mix, the smallest jump margin, jump count and jumps per beat, combo-beat count, dead-band findings, short first-beat telegraphs, feature variety, and completion status. Platforms and portals are course features, not jump-triggering inputs, so they do not inflate the input rate.

- **Margin** is course distance between the latest distance at which a jump had to start and where the auto-player actually started it. Smaller values mean less timing room; a negative value means the policy started after the ideal deadline.
- **Dead band** shows both the number of violations and their authored beat-to-beat distances.
- **Telegraph** lists every phrase-opening beat below 0.6 s; the minimum clear-track time is included for comparison. Intra-phrase beats appear only in the combo count.
- **Variety** counts obstacle, gap, platform, portal, enemy, and collectible categories when present. Single-use categories are named separately.

The summary gives average inputs/s, auto-player completions, dead-band and telegraph totals, and failed level ids with the recorded death reason. A completed level can still have spacing or telegraph warnings; conversely, an auto-player failure is reported as a failure, never repaired by changing level data or relaxing the solver.

The unit tests in `src/levels.tools.test.js` use only synthetic levels. They cover normal jumping, dead-band detection, impossible gaps, bridge support, dash spacing, and tightening a second beat.

## Two stages: rhythm, then mix

`npm run levels:compose` runs two deterministic stages:

1. **`tools/compose-levels.mjs` owns the rhythm** — how many input beats, where they sit, how they are
   spaced against the real portal speed profile, and the first-beat telegraph. It rejects any layout
   the auto-player cannot finish cleanly.
2. **`tools/apply-feature-quotas.mjs` owns the mix** — it converts a few hazard slots into enemies and
   builds the platform archetypes per course range: kerb only in 1–4, one kerb in 5–8, kerb plus a shelf
   or island in 9–14, two of shelf/island/hover plus a perch in 15–20 (and a perch from course 12 on).
   Every single change is replayed through the auto-player and reverted if the course stops being
   completable or breaks a fairness gate, so the mix can never cost solvability. A perch replaces one
   single-hazard beat so the target input rate is unchanged; free apex shards are re-derived from the
   final run trace after the mix moves the jump that carries them.

Course copy (`signature`, `designHook`) is hand-written in the feature pass, keyed by level id, and
checked for uniqueness by the validator. If you add a course, add its copy there too.

### Gates enforced by `npm test`

inputs/s within 5 0f the blueprint · average rate rising across each five-course block · zero
spacing in the 0.80–1.35 × reach dead band · at most one third of gaps bridged · jumps ≥ 75 0f input
beats · tightest margin ≥ 0.35 units · first-beat telegraph ≥ 0.6 s · shards inside the apex band ·
no three beats of the same kind in a row · tier quotas for platforms, enemies, portals and shards ·
islands inside a gap with 1.6 units of hole each side · perch crawler at the platform centre ·
half a reach of clear track at both ends of every shelf.
