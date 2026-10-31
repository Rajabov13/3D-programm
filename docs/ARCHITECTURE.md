# Architecture (demo version)

## Overview

```
Browser (React 18 + Vite) — no backend
 ├─ Pages & UI (Tailwind)          src/pages, src/components
 ├─ i18n (uz · ru · en)            src/i18n            — typed dictionaries + tx() for content
 ├─ Game                           src/game            — content, rules engine, zustand store, sounds
 ├─ 3D city (R3F + drei + three)   src/three           — lazy chunk, only on / and /world
 ├─ Workspace (Monaco)             src/editor          — lazy chunk, only on boss and lab pages
 │   └─ Sandboxes                  src/editor/sandbox  — opaque-origin iframes + workers
 ├─ Check engine                   src/shared/checks.ts
 └─ Profile                        display name, avatar, leaderboard opt-in
```

All state is per browser:

| Key | Contents |
|---|---|
| `cw.game.v1` | XP, best stars per stage, defeated bosses, badges, claimed quests, XP ledger and history, per-day stats |
| `cw.lang.v1` | Interface language (`uz` default; first visit follows the browser language) |
| `cw.demo.profile.v1` | Display name, avatar, leaderboard opt-in |
| `cw.settings.v1` | Sound, graphics quality, motion, editor and camera preferences |
| `cw.draft.*` | Code per boss / lab mode |

## Routes

| Route | Page |
|---|---|
| `/` | Landing |
| `/map` | Player strip, “continue” button, today’s quests, world cards |
| `/zone/:zoneId` | Stage path of a world (zig-zag nodes with stars) and the boss node |
| `/play/:stageId` | Full-screen mini-game run (tip → tasks → result) |
| `/boss/:zoneId` | Boss fight: task + requirement checklist + editor/preview/console |
| `/quests`, `/badges`, `/leaderboard`, `/profile`, `/settings`, `/lab`, `/world` | Hub pages, code lab, 3D city |

Links from the earlier course-based version (`/dashboard`, `/courses/*`, `/missions`, …) redirect to the map.

## Game rules

`src/game/engine.ts` contains pure functions over a serialisable `GameState`, covered by `engine.test.ts`:

- Level curve: total XP to reach level *L* is `25·(L−1)·(L+2)` (100, 250, 450, 700, …).
- Worlds unlock by level (HTML 1, CSS 2, Python 2, JavaScript 3, React 4); stages unlock in order;
  the boss unlocks when every stage of its world is cleared.
- A stage is cleared with fewer than 3 mistakes. Stars: 0 mistakes → 3, 1 → 2, 2 → 1. A wrong task
  is repeated once at the end of the run.
- XP: +10 first clear, +10 per new best star (max 40 per stage), boss XP once per world, badge XP when
  earned, quest XP when claimed. Every reward goes through an idempotency ledger
  (`stage:id`, `stage:id:starN`, `boss:zone`, `badge:id`, `quest:day:id`), so nothing pays twice.
- Daily quests and the streak use the local calendar day.

## Content format

`src/game/content/<world>.ts` — each world has 5 stages (tip + 6 tasks) and a boss. Code and options are
language-neutral; translated text uses `tx(uz, ru, en)`. Task kinds:

| Kind | Fields |
|---|---|
| `pick` | `q` (translated), `code?`, `options`, `answer` |
| `output` | `code`, `lang`, `options` (possible outputs), `answer` |
| `blank` | `code` with one `___`, `options`, `answer` |
| `order` | `lines` in the correct order (shown shuffled) |
| `bug` | `lines`, `bug` (index of the broken line), `fix` (shown afterwards) |
| `match` | `pairs` of `[code, meaning]` (optionally verified as JS/Python expressions in tests) |
| `look` | `code` (CSS), `preview` kind, `options` (style objects rendered as previews), `answer` |

`content.dom.test.ts` executes every JavaScript/Python `output` task and expression `match` pair to prove the
answer keys are right, checks translations are complete, runs every boss solution (and starter) through the
check engine, and makes sure building names only use glyphs the bundled 3D font covers.

## Check engine

`src/shared/checks.ts` evaluates boss checks without ever executing code — it inspects
comment-stripped source, parses HTML with a script-free `DOMParser`, parses CSS, and compares program
output produced by the sandboxes. Check types:

| Type | Fields |
|---|---|
| `source_includes` | `file`, `value`, `caseSensitive?` |
| `source_regex` / `source_not_regex` | `file`, `pattern`, `flags?` |
| `html_element` | `selector`, `min?`, `max?`, `textIncludes?`, `attribute?: { name, valuePattern? }` |
| `css_declaration` | `selector`, `property`, `valuePattern?` (reads the CSS file and `<style>` blocks; `@media` rules flattened) |
| `output_equals` / `output_includes` | `expected` / `value` (output normalised: line endings, trailing whitespace) |
| `dom_runtime` | `selector`, `min?`, `textIncludes?`, `textEquals?`, `before?: [{type:'click',selector,times?} \| {type:'input',selector,value}]` — evaluated inside the preview sandbox |

`file` is one of `html`, `css`, `js`, `jsx`, `py`. Because the engine is dependency-free and
runtime-agnostic, a future backend can reuse it unchanged to re-verify submissions server-side.

## Code sandboxes

Learner code only ever runs in isolated browser environments:

| Sandbox | Used for | Isolation |
|---|---|---|
| Preview iframe | HTML/CSS and React bosses, lab preview | `sandbox="allow-scripts"` without `allow-same-origin` → opaque origin (no access to the app’s storage or DOM). In-document CSP blocks all network. Loops are instrumented (`loopProtect.ts`) and stopped after 1.5 s; `alert/confirm/prompt`, navigation and form submission are neutralised. |
| Web Worker in a sandboxed iframe | JavaScript boss and lab | Same opaque origin + CSP; `fetch`, `XMLHttpRequest`, `WebSocket`, `importScripts` disabled; the worker is hard-terminated after 4 s; output capped at 200 KB. |
| Pyodide in a Worker in a sandboxed iframe | Python | Opaque origin; network limited to the Pyodide directory; fresh global namespace per run; terminated after 10 s (restarts on next run). |

React code is transformed with Sucrase in the app and executed in the preview with React 18
UMD builds bundled locally. Errors are reported with script-relative line numbers; Python
tracebacks hide interpreter-internal frames.

## The 3D city

- `src/data/buildings.ts` — positions, collision radii, shapes, routes, translated name keys. Buildings face the central plaza.
- `src/three/CityScene.tsx` — sky, stars, lighting (≤ 1 shadow-casting light + 2 point lights), the
  single-draw-call ground shader (grid, plaza rings, roads, fog), the instanced skyline (one draw call),
  drones (one instanced draw call), the plaza monument, landmarks and floating glyphs.
- Materials and canvas-generated window textures are shared through a context and disposed on
  unmount/quality change. Reflections come from a procedural `Environment` rendered once (no HDR download).
- 3D sign text uses troika with the bundled full Inter font in `public/fonts` (Latin incl. Uzbek ʻ ʼ and
  Cyrillic — a test guards this so troika never fetches fallback fonts from a CDN). Signs re-render when
  the language changes.
- **Quality presets** (`src/three/quality.ts`): `high`/`medium`/`low`/`2d`; `auto` picks from cores,
  memory and pointer type, then `PerformanceMonitor` adapts the pixel ratio at runtime.
- **Controls**: `OverviewControls` (smooth fly-to), `WalkController` (WASD/arrows, Shift to run, pointer
  lock or drag-to-look, touch joystick, collisions with buildings and the world boundary, proximity +
  crosshair targeting), `HeroCamera` (landing page).
- **Fallbacks**: no WebGL → 2D map; render error or GPU context loss → 2D map with “Retry 3D”; slow
  load → offer the 2D map. Reduced motion stops ambient animation and makes transitions instant.

## Content-Security-Policy (optional)

If you add a CSP header when hosting, this policy has been verified with the full smoke test and
every sandbox type:

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob:;
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
font-src 'self' data:;
connect-src 'self';
worker-src 'self' blob:;
frame-src 'self';
object-src 'none';
base-uri 'self';
frame-ancestors 'none'
```

`'unsafe-inline'`/`'unsafe-eval'` are required because the sandboxes are `srcdoc` iframes, which
inherit the page’s CSP (and add their own stricter one); `script-src 'self'` breaks the JS, React and
Python runners. To keep a strict policy for the app shell, serve the sandbox documents from a separate
origin. If you load Pyodide from a CDN, add its URL to `script-src` and `connect-src`.

## Moving beyond the demo

A production version would add a backend for accounts and persistence, store game progress server-side,
re-verify boss solutions there (the check engine is reusable as-is), and run Python/JS output checks on an
isolated execution service.

## Extending

- **New stage or task**: add it to `src/game/content/<world>.ts` and run `npm test` — the content tests
  execute the answers and check translations.
- **New world**: add a `Zone` file, register it in `src/game/content/index.ts`, add a building in
  `src/data/buildings.ts` (+ a shape in `src/three/buildings/shapes.tsx`) and its `b.*`/`bd.*` names in
  the three dictionaries.
- **New UI text**: add the key to `src/i18n/uz.ts` — TypeScript then requires it in `ru.ts` and `en.ts`.
- **New language**: add a dictionary, extend `Lang`/`LANGS` and the `tx()` signature.
- **New check type**: extend `CheckSpec`, `evaluateCheck`, `validateCheckSpecs` and (for runtime
  checks) `src/editor/sandbox/bridge.ts`.
