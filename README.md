# Preproduction Agent · 프리프로덕션 에이전트

A local-first web app for organizing film / ad / music-video **pre-production**
and exporting a **PPM (Pre-Production Meeting) Book**. Runs entirely in your
browser — no account, no server, no data leaves your machine.

[![CI](https://github.com/Gwani-28/preprod-agent/actions/workflows/ci.yml/badge.svg)](https://github.com/Gwani-28/preprod-agent/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
![React](https://img.shields.io/badge/React-Vite-61DAFB.svg)

**▶ Live demo: https://gwani-28.github.io/preprod-agent/**

**English** | [한국어](README.ko.md)

## What it does

Preproduction on a short film, a commercial, or a music video means juggling a
dozen half-finished documents — project brief, checklist, budget, crew list,
shooting plan, reference images — and then turning all of it into a meeting
deck. Preproduction Agent keeps those in one place, flags what's missing before
you shoot, and exports a clean PPM Book.

### Features

- **Dashboard** — project overview (format, genre, runtime, shoot dates, scale)
- **Checklist** — categorized pre-production tasks with status and notes
- **Budget** — line-item budget tracking
- **Crew** — cast/crew roster with roles and contacts
- **Shooting plan** — per-day shooting schedule / call-sheet style plan
- **Documents** — freeform notes and document memos
- **Visual board** — reference images and mood
- **Missing check** — automatically surfaces items you haven't filled in yet
- **Format presets** — one click sets the format and adds a checklist tuned for
  **short film / commercial / music video** (each has its own priorities — client
  approval and media rights for ads, artist/playback for MVs, etc.)
- **PPM preview & export** — assemble everything into a PPM Book and export as
  HTML / Markdown / PDF
- **Project backup** — export the whole project to a JSON file and import it back
  (move a project between browsers/devices)
- **Local-first** — all data is stored in your browser (`localStorage`); works
  offline and on mobile (open the dev server's Network URL on the same Wi-Fi)

## Run it

Use the hosted **[live demo](https://gwani-28.github.io/preprod-agent/)**, or run
locally:

```bash
git clone https://github.com/Gwani-28/preprod-agent.git
cd preprod-agent
npm install
npm run dev
```

On macOS you can also double-click `프리프로덕션 에이전트 실행.command`, which
installs dependencies (if needed) and opens the app in your browser.

## Tech

- **React + TypeScript + Vite**
- **Tailwind CSS**
- **No backend** — state lives in `localStorage`; the whole app is static files
- Only runtime dependencies are `react` / `react-dom`

## Build

```bash
npm run build     # production build → dist/
npm run preview   # preview the production build
```

## How it works

Everything is client-side. There's no login and no network calls — your project
data never leaves the browser, which makes it safe for unreleased productions
and trivial to self-host (it's just static files). Exports are generated in the
browser from your current state.

## Roadmap

See [ROADMAP.md](ROADMAP.md) — planned: export polish, per-day call-sheet
export, collaborative sharing, and English UI localization.

## Community

- [Contributing](CONTRIBUTING.md) · [Code of Conduct](CODE_OF_CONDUCT.md) · [Security](SECURITY.md)
- [Changelog](CHANGELOG.md)
- Ideas & bugs → [open an issue](https://github.com/Gwani-28/preprod-agent/issues/new/choose)

## License

[MIT](LICENSE) © 2026 Gwani-28

---

🇰🇷 **한국어 문서:** [README.ko.md](README.ko.md)
