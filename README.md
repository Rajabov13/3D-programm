# 3D Code World — demo version

**Learn to code by exploring a living 3D technology city.** Each tower is a learning
area — HTML Academy, CSS Design Studio, JavaScript Laboratory, Python Center and
React Development Tower — plus a Mission Center, Achievement Hall and Personal
Progress Center. Learners read short lessons, pass knowledge checks, solve coding
exercises in a professional editor, earn XP and unlock new districts.

> **This is the demo version.** It has no backend, database or accounts: the learner
> profile, progress, XP and admin edits are stored in the browser (`localStorage`).
> A banner in the app says so.

## Features

- **Interactive 3D city** (React Three Fiber): orbit/fly-to overview, first-person *Explore*
  mode with WASD + pointer lock, collisions, proximity prompts, touch joystick, keyboard
  shortcuts, adaptive quality, and a 2D map fallback when WebGL isn’t available.
- **Real courses**: 5 tracks × 5–6 lessons (29 lessons, 87 knowledge-check questions,
  29 auto-checked exercises) from beginner to advanced.
- **Coding workspace**: Monaco editor, live preview, console, resizable panels, keyboard
  shortcuts and drafts. Code runs in isolated browser sandboxes: HTML/CSS/JS and React in
  an opaque-origin iframe, JavaScript in a Web Worker, Python via self-hosted Pyodide
  (CPython compiled to WebAssembly).
- **Progression**: XP and levels, missions, achievements, daily goals and streaks, course
  unlocks and a leaderboard (with clearly labelled sample entries). XP is never awarded twice
  for the same activity.
- **Admin area**: course/lesson/exercise/quiz editors, publish/unpublish, solution validation
  through the real sandboxes, achievements & missions, activity overview.
- Responsive, keyboard accessible, reduced-motion aware.

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
| `npm test` | Unit + content-integrity tests (Vitest) |
| `npm run verify:exercises` | Runs every reference solution through the real browser sandboxes (needs Playwright and a running `preview`) |
| `npm run smoke` | End-to-end smoke test: every route on desktop + mobile, a full learning journey, admin and the 3D world (needs Playwright and a running `preview`) |

The two browser scripts use Playwright: `npm i -D playwright && npx playwright install chromium`.

## Project structure

```
├── docs/                    Architecture, testing checklist
├── public/                  Favicon, fonts for 3D text, hosting headers (pyodide/ is generated on install)
├── scripts/                 Pyodide copy step, browser verification scripts
└── src/
    ├── components/          UI kit (buttons, panels, modal, fields…), layout, markdown, code blocks
    ├── data/                Courses, lessons, exercises, quizzes, missions, achievements, city layout
    ├── editor/              Monaco setup, workspace, split panes, preview, console
    │   └── sandbox/         Preview documents, bridge, loop protection, JS worker + Python runners
    ├── features/            profile, content, progress (rules engine + local store), world, learning, admin, settings
    ├── hooks/               Media queries, reduced motion, drafts, shortcuts
    ├── lib/                 Dates, errors, storage, highlighting, RNG
    ├── pages/               Route components (incl. admin/)
    ├── services/            Runtime configuration
    ├── shared/              Exercise check engine (dependency-free, never executes code)
    ├── styles/              Tailwind entry + design tokens
    ├── three/               City scene, buildings, materials, controls, quality, collisions
    └── types/               Domain types
```

More detail: **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**. Manual QA: **[docs/TESTING_CHECKLIST.md](docs/TESTING_CHECKLIST.md)**.

## Deploying

`npm run build` produces a static site in `dist/`; any static host works with an SPA fallback
to `index.html`. One requirement: **`/pyodide/*` must be served with
`Access-Control-Allow-Origin: *`**, because the Python sandbox runs in an opaque-origin iframe.
`public/_headers` (Netlify / Cloudflare Pages) and `vercel.json` already do this.

## Limitations of the demo version

- Progress and admin edits live in one browser; clearing site data resets them.
- There are no accounts, and the admin area has no access control — fine for a demo, not for
  production.
- Rewards are computed in the browser, so a determined user could edit their own local data.
  A production version needs a backend that stores progress and verifies completions server-side.

## Licenses

Bundled fonts (Inter, JetBrains Mono) are under the SIL Open Font License — see `public/fonts/LICENSE.md`.
Pyodide is MPL-2.0; React, three.js, Monaco and the other dependencies are under their respective licenses.
