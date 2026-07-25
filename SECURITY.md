# Security Policy

## Reporting a vulnerability

Please **do not** open a public issue for security problems. Report privately
via GitHub's
[**Report a vulnerability**](https://github.com/Gwani-28/preprod-agent/security/advisories/new)
(Security → Advisories → *Report a vulnerability*).

Include what you found, steps to reproduce, and the impact you believe it has.
We aim to acknowledge reports within a few days.

## Threat model

Preproduction Agent is a static, client-side web app:

- No backend, no accounts, no network calls — project data stays in the
  browser's `localStorage`.
- The hosted demo on GitHub Pages serves the same static files; it collects no
  user data.

Relevant issue classes include XSS via user-entered content that is later
rendered (e.g. in exports) and unsafe handling of imported project data.

## Supported versions

Fixes land on `main` and in the latest release. Please test against the latest
`main` before reporting.
