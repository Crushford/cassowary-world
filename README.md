# Cassowary World

The website for [cassowaryworld.com](http://cassowaryworld.com) — a world-building lore site for the Cassowary World speculative-fiction setting.

## Tech Stack

- **Next.js 15** (App Router, TypeScript)
- **Tailwind CSS 4** with `@tailwindcss/typography`
- **react-markdown** + **remark-gfm** for markdown rendering
- **lightgallery** for concept art image galleries

## Getting Started

```bash
yarn dev
```

Opens at [http://localhost:3000](http://localhost:3000).

## Content

Content is currently sourced from local JSON files in `/content`, organised by type:

- `technical-docs/` — in-world technical documents
- `secret-technical-docs/` — classified documents
- `speeches/` — in-world speeches and proclamations
- `concept-art/` — concept art with image galleries

Each folder has an `index.json` (metadata, no body) and one `.json` per document.

Images live in `content/images/` and are synced to `public/content-images/` at build time via `scripts/sync-images.mjs`. This runs automatically as part of `yarn dev` and `yarn build`.

## Build

```bash
yarn build
yarn start
```

## Content Migration (in progress)

The site is migrating from local JSON files to fetching content at runtime from the [cassowary-world-lore](https://github.com/Crushford/cassowary-world-lore) GitHub repo via the GitHub API. This will enable branch-based lore versioning — users can select a branch to view the world as it existed at that point in history.

See [CLAUDE.md](./CLAUDE.md) for full architectural details.
