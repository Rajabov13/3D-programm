# 3D Code World — demo version

**Learn to code by playing.** A neon 3D city with five worlds — HTML, CSS, Python,
JavaScript and React. Each world has 5 short stages. Every stage goes
**info → example → test**: a few picture cards teach each new thing, then quick mini-games
check it. Each world ends with a **boss fight** where you write real code. Collect stars, keep your streak, finish daily
quests, earn badges and level up to unlock the next world.

The interface is available in **Oʻzbekcha (default), Русский and English** — switch
any time with the UZ · RU · EN switcher (also on the 3D signs in the city).

> **This is the demo version.** There is no backend, database or account system: the
> player profile and game progress are stored in the browser (`localStorage`).

## How the game works

| | |
|---|---|
| 🗺 **Map** | Five worlds. HTML is open from the start; CSS and Python open at level 2, JavaScript at 3, React at 4. |
| 📘 **Learn first** | Every stage opens with 2–4 cards (78 in total). Each card has a short explanation (**Maʼlumot**), a picture — highlighted code parts, variable boxes, list indexes, a box-model diagram, side-by-side CSS previews or a cheat-sheet table — and an **example** (**Namuna**) whose result you reveal: a rendered mini web page or console output. The test starts only after the last card. |
| 🎮 **Then the test** | 6 tasks, about 2 minutes: *pick the answer*, *what does it print?*, *fill the blank*, *build the code in order*, *find the bug*, *match pairs*, *which CSS looks like this?* The 📖 *Notes* button reopens the cards at any time. |
| ❤️ **Hearts** | 3 per stage. A mistake costs a heart and the task comes back at the end. No hearts left → try again. |
| ⭐ **Stars** | 0 mistakes = 3 stars, 1 = 2, 2 = 1. Combo counter for answers in a row. |
| ⚔️ **Boss** | After all 5 stages: a real coding task in the Monaco editor, run in a sandbox and checked automatically (HTML page, CSS card, Python loop, JavaScript function, React counter). |
| ✨ **XP** | +10 for clearing a stage the first time, +10 for every new best star, +50 per boss, badge and quest rewards. Replays never pay twice. Levels: 100, 250, 450, 700 … XP. |
| 🎁 **Daily quests** | Three small goals every day (clear 2 stages, get 3 stars, earn 50 XP). |
| 🏅 **Badges / 🏆 Ranking / 🔥 Streak** | 9 badges, a leaderboard (sample players + you) and a day streak. |
| 🧪 **Lab** | A free code editor (HTML/CSS/JS, JavaScript, Python, React) with examples. |
| 🏙 **3D city** | Walk or fly between the towers; each tower opens its world. 2D map fallback without WebGL. |

Sound effects are synthesized with Web Audio (no audio files) and can be turned off in Settings.

## Quick start

Requirements: **Node.js ≥ 20.11** (tested with Node 22) and npm.

```bash
npm install
```

```bash
npm run dev
```

Open http://localhost:5173.

`npm install` also copies the Pyodide runtime (~14 MB) into `public/pyodide/` so Python runs
from your own origin — no third-party CDN at runtime. Optional settings are listed in
`.env.example`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Vite dev server on :5173 |
| `npm run build` | Type-check + production build into `dist/` |
| `npm run preview` | Serve the production build on :4173 |
| `npm run typecheck` / `npm run lint` | TypeScript / ESLint |
| `npm test` | Game rules, content integrity (every task answer is executed and verified), learning cards (every example output is executed, and every test answer must be taught on the cards first), translations, sandbox helpers (Vitest) |
| `npm run verify:bosses` | Runs every boss solution (and starter) through the real browser sandboxes (needs Playwright and a running `preview`) |
| `npm run smoke` | End-to-end: every route on desktop/mobile/Russian, language switching, the learning cards (all 78 open on a phone without errors), a full game journey (stages, hearts, stars, boss, quests, level-up) and the 3D world (needs Playwright and a running `preview`) |

The two browser scripts use Playwright: `npm i -D playwright && npx playwright install chromium`.

## Project structure

```
├── docs/                    Architecture, testing checklist
├── public/                  Favicon, fonts for 3D text, hosting headers (pyodide/ is generated on install)
├── scripts/                 Pyodide copy step, browser verification scripts
└── src/
    ├── game/                The game: content (5 worlds × 5 stages + bosses), learning cards, rules engine, store, sounds, components
    ├── i18n/                uz / ru / en dictionaries, language store, switcher
    ├── components/          UI kit (buttons, modal, fields, toasts…), layout
    ├── data/                City layout (buildings)
    ├── editor/              Monaco setup, workspace, preview, console, examples
    │   └── sandbox/         Preview documents, bridge, loop protection, JS worker + Python runners
    ├── features/            profile, world (3D/2D map panels), settings
    ├── hooks/               Media queries, reduced motion, drafts
    ├── lib/                 Dates, errors, storage, syntax highlighting
    ├── pages/               Route components
    ├── shared/              Code check engine (dependency-free, never executes code)
    ├── styles/              Tailwind entry + design tokens
    └── three/               City scene, buildings, materials, controls, quality, collisions
```

More detail: **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**. Manual QA: **[docs/TESTING_CHECKLIST.md](docs/TESTING_CHECKLIST.md)**.

## Deploying

`npm run build` produces a static site in `dist/`; any static host works with an SPA fallback
to `index.html`. One requirement: **`/pyodide/*` must be served with
`Access-Control-Allow-Origin: *`**, because the Python sandbox runs in an opaque-origin iframe.
`public/_headers` (Netlify / Cloudflare Pages) and `vercel.json` already do this.

## Limitations of the demo version

- Progress lives in one browser; clearing site data resets it.
- There are no accounts; leaderboard rivals are sample players.
- Rewards are computed in the browser, so a determined player could edit their own local data.
  A production version needs a backend that stores progress and verifies boss solutions server-side
  (the check engine in `src/shared/checks.ts` is reusable as-is).

## Licenses

Bundled fonts (Inter, JetBrains Mono) are under the SIL Open Font License — see `public/fonts/LICENSE.md`.
Pyodide is MPL-2.0; React, three.js, Monaco and the other dependencies are under their respective licenses.
