# Contributing to Preproduction Agent

Thanks for your interest! This is a small, local-first web app for film/ad/MV
pre-production.

## Ground rules

- **Stay local-first.** No backend, no accounts, no telemetry. Project data
  lives in the browser (`localStorage`) and must not leave the user's machine.
- **Keep dependencies minimal.** The app ships with just `react`/`react-dom` at
  runtime. Please avoid adding heavy libraries without a strong reason.
- Keep changes small and focused; one concern per PR.

## Getting set up

```bash
npm install
npm run dev       # dev server
npm run build     # production build
npx tsc --noEmit  # type-check
```

## Before opening a PR

- `npx tsc --noEmit` and `npm run build` both pass.
- Describe what you changed and how you verified it in the UI.

## Reporting bugs

Open an issue with: browser + OS, what you did, what you expected, and what
happened. A screenshot helps.

## Ideas

Feature ideas are welcome — see the [roadmap](ROADMAP.md) and open a feature
request to discuss before large changes.
