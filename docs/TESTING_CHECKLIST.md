# Testing checklist (demo version)

## Automated

| Command | Covers |
|---|---|
| `npm run typecheck` | Strict TypeScript (a missing translation key fails compilation) |
| `npm run lint` | ESLint + React hooks rules |
| `npm test` | Check engine; game rules (levels, stars, idempotent XP, unlock order, bosses, quests, badges, streaks); loop protection; sandbox bridge; collisions; **content integrity** — every JS/Python `output` answer and expression pair is executed, translations are complete in uz/ru/en, every boss solution passes and every starter fails, 3D sign glyphs are covered by the bundled font |
| `npm run build && npm run preview`, then `npm run verify:bosses` | All 5 boss solutions pass and all starters fail in the **real browser sandboxes** (web preview, JS worker, self-hosted Pyodide, React with runtime click checks) |
| `npm run smoke` (with `preview` running) | Every route on desktop, mobile and in Russian: `<h1>`, no runtime errors, no unlabeled controls, no horizontal overflow, correct `<html lang>`; language switching (instant, remembered, browser default); game journey (perfect run → 3 stars + exact XP, replay with a mistake → 2 stars and no XP, 3 mistakes → out of hearts, locked stages, boss starter fails / solution wins, quest claim, level-up unlocks CSS); 3D world render, keyboard travel, live language switch on the 3D panel, building entry |

## Manual QA

### Language
- [ ] First visit follows the browser language (uz/ru/en), otherwise Uzbek.
- [ ] UZ · RU · EN switcher in the navbar, the mobile menu, the 3D city HUD and Settings; the change is instant everywhere, including 3D signs and the building panel.
- [ ] Uzbek letters ʻ / ʼ render correctly in UI and on 3D signs.

### Game
- [ ] Map: “Continue” goes to the next unfinished stage or boss; locked worlds say at which level they open.
- [ ] Stage: tip card → Start; 1–4 picks an option, Enter checks/continues; hearts, combo, progress bar.
- [ ] Each task kind works by mouse, touch and keyboard: pick, output, blank, order (tap to build, tap to remove), bug, match, look.
- [ ] A mistake shows the correct answer and repeats the task at the end; 3 mistakes → “Out of hearts”.
- [ ] Result screen: stars animate, confetti (not with reduced motion), XP / accuracy / best combo, Next / Again / Map.
- [ ] Quitting mid-stage asks for confirmation and saves nothing.
- [ ] Boss: task + requirement checklist; Run shows preview/console; Check marks requirements ✓/✗; output bosses show expected vs. yours; a win shows the trophy dialog with XP once.
- [ ] Quests can be claimed once per day; badges show progress; level-up and badge toasts appear.
- [ ] Profile: name/avatar change, stats, world progress, recent rewards, reset progress (with confirmation).
- [ ] Sound effects play and can be turned off in Settings.

### 3D world
- [ ] Loading overlay, then the city; WebGL unavailable → 2D map with explanation.
- [ ] Overview: drag orbits, wheel/pinch zooms, can’t go below ground or far outside the city.
- [ ] Hover a building → highlight + label; click → camera flies there and the panel opens (stars, Play, Open).
- [ ] Locked worlds show “Unlocks at level N” on the sign and in the panel.
- [ ] `1`–`8` travel to locations; `V` switches Overview/Explore; `M` toggles 2D; `R` resets; `H` help.
- [ ] Explore: WASD/arrows move, Shift runs; can’t walk through buildings, the plaza monument or past the edge.
- [ ] Mouse look locks the pointer; Esc releases it; E enters the building in front.
- [ ] Touch device: joystick walks, one-finger drag looks, “Enter” button on the prompt.
- [ ] The “3D” button on a world page focuses that tower in the city.
- [ ] Settings → Low quality / 2D only take effect; reduced motion stops ambient animation.

### Accessibility
- [ ] Keyboard only: skip link, navbar, menus, modals (focus trapped, Esc closes, focus returns), task options, switches, split panes, location menu.
- [ ] Visible focus indicators everywhere; Monaco “Tab moves focus” via Ctrl+M.
- [ ] Screen reader: page titles, landmarks, labelled controls, live regions for answers/toasts/console.
- [ ] 200 % zoom without loss of content; `prefers-reduced-motion` respected (and the in-app override).

### Performance
- [ ] Landing and map don’t load three.js or Monaco; the 3D hero loads after idle.
- [ ] World stays smooth on a typical laptop at Auto; low-end/mobile defaults to Low.

### Error states
- [ ] Bad route → 404 page; old course links redirect to the map; a crashing component → error boundary with retry.
- [ ] Python runtime blocked (e.g. offline before first load) → clear error, never fake output.
