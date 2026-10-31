# Architecture (demo version)

## Overview

```
Browser (React 18 + Vite) — no backend
 ├─ Pages & UI (Tailwind)          src/pages, src/components
 ├─ 3D city (R3F + drei + three)   src/three           — lazy chunk, only on / and /world
 ├─ Workspace (Monaco)             src/editor          — lazy chunk, only on editor pages
 │   └─ Sandboxes                  src/editor/sandbox  — opaque-origin iframes + workers
 ├─ Check engine                   src/shared/checks.ts
 ├─ Data layer (TanStack Query)
 │   ├─ Content                    bundled src/data + admin edits in localStorage
 │   └─ Progress                   rules engine (src/features/progress/engine.ts) + localStorage
 └─ Profile                        display name, avatar, leaderboard opt-in (localStorage)
```

All state is per browser:

| Key | Contents |
|---|---|
| `cw.demo.progress.v1` | XP, completed lessons/exercises, quiz results, missions, achievements, XP history, daily activity, daily goal, time zone |
| `cw.demo.profile.v1` | Display name, avatar, leaderboard opt-in |
| `cw.demo.content.v1` | Only present after admin edits; otherwise the bundled catalog is used |
| `cw.settings.v1` | Graphics quality, motion, editor and camera preferences |
| `cw.draft.*` | Unsaved code per exercise / playground mode |

## Progression rules

`src/features/progress/engine.ts` contains pure functions, covered by `engine.test.ts`:

- Level curve: total XP to reach level *L* is `25·(L−1)·(L+2)` (100, 250, 450, 700, …).
- A lesson completes only after its knowledge check is passed (≥ 60 %) and all its exercises pass.
- XP is recorded as transactions keyed by `(source type, source id)` — the same lesson, exercise,
  quiz, mission or achievement never awards XP twice.
- Daily goal: reaching the goal awards +10 XP once per day; streaks count consecutive active days
  in the learner’s time zone.
- Achievements are evaluated after every award; missions are claimed explicitly once met.
- Courses unlock by level (HTML 1, CSS 2, Python 2, JavaScript 3, React 5).
- Wrong quiz answers don’t reveal the correct options until the check is passed.

## Check engine

`src/shared/checks.ts` evaluates exercise checks without ever executing code — it inspects
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
| Preview iframe | HTML/CSS/JS and React exercises, live preview | `sandbox="allow-scripts"` without `allow-same-origin` → opaque origin (no access to the app’s storage or DOM). In-document CSP blocks all network. Loops are instrumented (`loopProtect.ts`) and stopped after 1.5 s; `alert/confirm/prompt`, navigation and form submission are neutralised. |
| Web Worker in a sandboxed iframe | JavaScript console exercises | Same opaque origin + CSP; `fetch`, `XMLHttpRequest`, `WebSocket`, `importScripts` disabled; the worker is hard-terminated after 4 s; output capped at 200 KB. |
| Pyodide in a Worker in a sandboxed iframe | Python | Opaque origin; network limited to the Pyodide directory; fresh global namespace per run; terminated after 10 s (restarts on next run). |

React exercises are transformed with Sucrase in the app and executed in the preview with React 18
UMD builds bundled locally. Errors are reported with script-relative line numbers; Python
tracebacks hide interpreter-internal frames.

## Lesson content format

`lesson.blocks` is an array of:

```json
{ "type": "text", "md": "Markdown with `code`, **bold**, *italic*, [links](https://…), lists" }
{ "type": "heading", "text": "Section title" }
{ "type": "code", "language": "html|css|javascript|python|jsx|bash|text", "code": "…", "caption": "optional" }
{ "type": "callout", "variant": "tip|info|warning", "title": "optional", "md": "…" }
```

Markdown is rendered by a small built-in renderer that produces React elements (raw HTML in
content is shown as text). Code blocks get a “Try it” button that opens the snippet in the playground.

## The 3D city

- `src/data/buildings.ts` — positions, collision radii, shapes, routes. Buildings face the central plaza.
- `src/three/CityScene.tsx` — sky, stars, lighting (≤ 1 shadow-casting light + 2 point lights), the
  single-draw-call ground shader (grid, plaza rings, roads, fog), the instanced skyline (one draw call),
  drones (one instanced draw call), the plaza monument, landmarks and floating glyphs.
- Materials and canvas-generated window textures are shared through a context and disposed on
  unmount/quality change. Reflections come from a procedural `Environment` rendered once (no HDR download).
- Text uses troika with bundled fonts in `public/fonts` (Latin-1 only — a test guards this so troika
  never fetches fallback fonts from a CDN).
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

A production version would add a backend for accounts and persistence, store progress server-side,
re-verify exercise submissions there (the check engine is reusable as-is), run Python/JS output checks
on an isolated execution service, and protect the admin area with server-side authorization.

## Extending

- **New course**: add a draft in `src/data/courses/`, register it in `src/data/index.ts`, map it to a
  building, and run `npm test` (content integrity). Or create it in the admin area.
- **New building**: add it to `src/data/buildings.ts` and a shape in `src/three/buildings/shapes.tsx`.
- **New check type**: extend `CheckSpec`, `evaluateCheck`, `validateCheckSpecs` and (for runtime
  checks) `src/editor/sandbox/bridge.ts`.
- **New language**: add an `ExerciseMode`, a runner in `src/editor/sandbox`, and file tabs in
  `src/editor/files.ts`.
