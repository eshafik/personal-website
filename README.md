# Md. Shafikul Islam — personal terminal

A personal website that *is* a terminal: a custom, DOM-based command interpreter with autocomplete,
history and rich output, a full-screen CV viewer and a Markdown research reader. Static Astro build,
hosted on GitHub Pages. No backend, no shell, no LLM — every command is a typed, registered object.

## Develop

```sh
npm install
npm run dev        # http://localhost:4321 (draft articles visible)
npm test           # command-engine unit tests (node, no deps)
npm run check      # type-check
npm run build      # static output in dist/
```

Requires Node ≥ 22.23 (CI uses Node 24).

## Where things live

| Path | What |
| --- | --- |
| `src/data/profile.ts` | **All personal content**: experience, education, expertise, robotics, projects, contact, links, CV PDF, and the journey graph. Terminal, CV and SEO all read from here. |
| `src/content/research/*.md` | Articles (Markdown; math via `$…$`/`$$…$$`, ```` ```mermaid ```` diagrams, code highlighting). |
| `src/terminal/engine.ts` | Pure registry: tokenizer, resolve (alias, case, unique prefix, typo hint), completion. |
| `src/terminal/commands.ts` | Command definitions and their output renderers. |
| `src/terminal/app.ts` | UI: prompt, ARIA combobox suggestions, history, session persistence, CV viewer, dialogs. |
| `src/terminal/journey.ts` | Git-graph journey renderer (used for the SSR welcome screen and the `journey` command). |
| `src/components/CV.astro` | Full-screen CV page (`/#cv`), generated from `profile.ts`. View-only — no PDF, download or print actions. |
| `src/pages/research/[slug].astro` | Article reader: TOC, progress, copy-code, KaTeX, Mermaid, related, prev/next. |

## Content management

**Contact / links** — fill `contact` and `links` in `profile.ts`. Undefined fields are hidden, never faked.

**Robotics photos & videos** — images live in `public/media/`; each award in `robotics.awards` lists its
`media` (`{ src: 'media/x.jpg', alt, caption }`) and optional YouTube `video` (`{ id, title }`).
Projects can also have `videos`. Videos load a thumbnail first and only embed
(youtube-nocookie.com) after a click.

**Portrait** — source lives in `assets-src/MSI_SHAFIK_HD.png` (not deployed). `npm run portrait`
crops, colour-grades it into the site palette and writes `public/media/portrait-400.webp` (welcome
screen) and `portrait-og.jpg` (social previews, structured data).

**Dates** — `Experience.period` and `Education.period` are optional; add real ones and they render.

**Journey graph** — edit `journey` in `profile.ts`. Rows are nodes (`lane` 0 = main line, 1 = branch)
or `fork`/`merge` connectors. `cmd` is what a click runs.

**New article** — add `src/content/research/my-slug.md`:

```md
---
title: Title
abstract: One or two sentences shown in listings and meta description.
date: 2026-12-01
updated: 2026-12-10      # optional
topics: [Agentic AI, Voice AI]
draft: false             # true = visible only in `npm run dev`
---
```

It gets `/research/my-slug/`, appears in `research`, autocomplete, RSS and the sitemap.
`designing-a-deterministic-terminal.md` is a sample draft about this site — publish, edit or delete it.

**New command** — add an object to `commands` in `src/terminal/commands.ts`
(`name`, `desc`, `aliases?`, `usage?`, `args?`, `primary?`, `run`). It is automatically in `help`,
`man`, autocomplete and typo suggestions. Add it to the palette list in `src/pages/index.astro` if primary.

## Deploy (GitHub Pages)

1. Push this folder to a GitHub repo (`main` branch).
2. Repo → Settings → Pages → Source: **GitHub Actions**.
3. Every push to `main` runs `.github/workflows/deploy.yml` (tests → build → deploy).

The site is built for `https://shafik.dev` (set in `.github/workflows/deploy.yml`). The custom
domain is configured in repo Settings → Pages → Custom domain; DNS lives in Cloudflare
(A/AAAA records for `@` → GitHub Pages IPs, CNAME `www` → `eshafik.github.io`, all "DNS only").

## Design notes

- Three compositions were considered: (A) terminal + identity sidebar, (B) unified terminal with
  identity as first output, (C) tmux-style split panes. **B** won: one workspace, strongest first
  screen, and on wide screens the welcome output itself splits into identity + journey graph, so
  the story is visible without a separate dashboard. C fragmented mobile; A made the sidebar feel
  like a separate portfolio.
- Custom DOM terminal instead of xterm.js: semantic, selectable, accessible output with real
  tables, links and buttons; responsive layout; ~12 KB gzipped JS.
- Session = transcript of command lines in `localStorage`, replayed deterministically on load,
  plus history, draft input, scroll position and theme.
- The CV is a hash route (`/#cv`) overlay so Back/Forward open and close it while the terminal
  stays mounted underneath; articles are real static pages.
- Accessibility: combobox/listbox ARIA pattern, no focus trap on an empty prompt, visible focus,
  reduced-motion support, information never conveyed by colour alone, touch-only navigation via
  the command drawer, no auto-opened keyboard on touch devices.
