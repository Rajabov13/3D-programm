# Testing checklist (demo version)

## Automated

| Command | Covers |
|---|---|
| `npm run typecheck` | Strict TypeScript |
| `npm run lint` | ESLint + React hooks rules |
| `npm test` | Check engine; rules engine (levels, idempotent XP, missions, daily goal, streaks); loop protection; sandbox bridge; collisions; **content integrity** — every exercise’s reference solution passes its checks (JS executed with Node, Python with `python3`), every starter fails, every quiz has valid answers |
| `npm run build && npm run preview`, then `npm run verify:exercises` | All 29 reference solutions through the **real browser sandboxes** (web preview, JS worker, self-hosted Pyodide, React with runtime click/typing checks) |
| `npm run smoke` (with `preview` running) | Every route on desktop and mobile: renders an `<h1>`, no runtime errors, no unlabeled controls, no horizontal overflow; full journey (quiz → exercise → lesson → mission → level 2 → CSS unlocked, no duplicate XP); admin validation & publishing; 3D world render + keyboard travel + building entry |

## Manual QA

### Landing & navigation
- [ ] Hero 3D city fades in; moving the pointer gently shifts the camera; buttons and text stay clickable.
- [ ] “Start Learning” → dashboard; “Explore the World” → `/world`.
- [ ] Demo banner is visible on app pages.
- [ ] Mobile (≤ 390 px): hamburger menu opens/closes with Esc; no horizontal scrolling.

### 3D world
- [ ] Loading overlay, then the city; WebGL unavailable → 2D map with explanation.
- [ ] Overview: drag orbits, wheel/pinch zooms, can’t go below ground or far outside the city.
- [ ] Hover a building → highlight + label; click → camera flies there and the info panel opens.
- [ ] Locked buildings show “Unlocks at level N”; their panel offers “Preview course”.
- [ ] `1`–`8` travel to locations; `V` switches Overview/Explore; `M` toggles 2D; `R` resets; `H` help.
- [ ] Explore: WASD/arrows move, Shift runs; can’t walk through buildings, the plaza monument or past the edge.
- [ ] “Enable mouse look” locks the pointer; Esc releases it; crosshair highlights targeted buildings; click opens the panel.
- [ ] Near an entrance: “Press E” prompt; E enters (or shows the panel if locked).
- [ ] Touch device: joystick walks, one-finger drag looks, “Enter” button on the prompt.
- [ ] Locations menu reaches every building without the 3D controls.
- [ ] “View in the city” on a course page focuses that building.
- [ ] Settings → Low quality / 2D map only take effect; reduced motion stops ambient animation.
- [ ] Simulate GPU loss (DevTools → Rendering → “WebGL context lost”) → 2D map with “Retry 3D”.

### Learning & workspace
- [ ] Course page: objectives, prerequisites, progress, lesson states; locked courses explain the XP needed.
- [ ] Lesson: blocks render; “Try it” opens the snippet in the playground; prev/next navigation.
- [ ] Knowledge check: can’t submit until all answered; wrong answers don’t reveal keys; pass shows explanations; retry works.
- [ ] “Complete lesson” disabled until the quiz and exercises pass.
- [ ] Workspace (web, console, Python, React): Run, Check, Reset (confirms), file tabs, Ctrl/⌘+Enter, Ctrl/⌘+Shift+Enter, resizable dividers (mouse + arrow keys), drafts survive reload, hints reveal one at a time.
- [ ] Errors show script-relative line numbers (JS/JSX) or clean tracebacks (Python).
- [ ] `while(true){}` in each mode is stopped; the page stays responsive.
- [ ] `fetch('https://example.com')` is blocked; `document.cookie`/`localStorage` throw in the preview.
- [ ] Python `input()` reads from “Program input”; first run shows “Loading Python runtime…”.
- [ ] Mobile: Task / Code / Output tabs; Run reachable.

### Progression
- [ ] XP, level ring and navbar chip update after awards; reward toast lists XP, level-ups, badges, daily goal.
- [ ] Repeating a completed quiz/exercise/lesson/mission awards nothing.
- [ ] Reaching level 2 unlocks CSS + Python; level 3 JavaScript; level 5 React.
- [ ] Missions: progress bars, claim only when met, “Completed” afterwards.
- [ ] Daily goal and streak follow the time zone in Settings.
- [ ] Profile → “Reset demo progress” clears everything after confirmation.

### Administration
- [ ] Create a course → hidden from learners until published.
- [ ] Edit lesson blocks (JSON with validation + preview) and quiz answers; edit exercise starter/solution/checks.
- [ ] “Validate solution” passes for the reference solution and reports that the starter fails.
- [ ] Publish/unpublish courses, lessons, exercises, achievements, missions; deleting asks for confirmation.
- [ ] “Reset demo content” restores the bundled courses.
- [ ] Overview shows activity, the XP-per-day chart (hover/focus tooltips, table view) and recent events.

### Accessibility
- [ ] Keyboard only: skip link, navbar, menus, modals (focus trapped, Esc closes, focus returns), quiz radios, switches, split-pane separators, location menu.
- [ ] Visible focus indicators everywhere; Monaco “Tab moves focus” via Ctrl+M.
- [ ] Screen reader: page titles, landmarks, labelled controls, live regions for console/toasts.
- [ ] 200 % zoom without loss of content; text contrast on all panels.
- [ ] `prefers-reduced-motion` respected (and the in-app override).

### Performance
- [ ] Initial landing load doesn’t include three.js or Monaco; the hero loads after idle.
- [ ] World stays smooth on a typical laptop at Auto; low-end/mobile defaults to Low.
- [ ] Navigating away from the world frees GPU memory.

### Error states
- [ ] Bad route → 404 page; a crashing component → error boundary with retry.
- [ ] Python runtime blocked (e.g. offline before first load) → clear error, never fake output.
