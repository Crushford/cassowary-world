# Cassowary World — Agent Context

This document gives AI planning and coding agents the full picture of this project: what it is, how it works, and where it is going.

---

## What This Project Is

[cassowaryworld.com](http://cassowaryworld.com) is a world-building lore site for the Cassowary World setting — a speculative-fiction universe centred on intelligent cassowaries in prehistoric Australia (~6–2 MYA). The site displays lore documents, stories, reference material, and concept art.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15.5.15 (App Router) |
| Language | TypeScript 5.x |
| Runtime | React 19.1.0 |
| Styling | Tailwind CSS 4.x + `@tailwindcss/typography` |
| Markdown rendering | `react-markdown` + `remark-gfm` |
| Image galleries | `lightgallery` 2.9 (zoom + thumbnail plugins) |
| Fonts | Playfair Display, Crimson Pro, Source Code Pro |
| Package manager | Yarn |

---

## Project Structure

```
cassowary-world/
├── src/
│   ├── app/                        # Next.js App Router pages
│   │   ├── layout.tsx              # Root layout (nav, header, footer)
│   │   ├── page.tsx                # Home page — randomised featured content
│   │   ├── technical-docs/         # List + [slug] detail + /compiled view
│   │   ├── secret-technical-docs/  # Same structure as technical-docs
│   │   ├── speeches/               # List + [slug] detail
│   │   └── concept-art/            # Image grid gallery + [slug] detail
│   ├── components/
│   │   ├── ContentList.tsx         # Generic list/grid for any content type
│   │   ├── ImageGallery.tsx        # LightGallery client component wrapper
│   │   ├── FooterBar.tsx
│   │   └── CopyButton.tsx          # Clipboard copy (used on /compiled pages)
│   └── lib/
│       └── content.ts              # All content loading — currently reads local JSON
├── content/                        # Local content (JSON files + images)
│   ├── technical-docs/             # One .json per document + index.json
│   ├── secret-technical-docs/
│   ├── speeches/
│   ├── concept-art/
│   └── images/                     # Local image files
├── public/
│   └── content-images/             # Synced from content/images at build time (gitignored)
└── scripts/
    ├── sync-images.mjs             # Copies content/images → public/content-images
    ├── export-from-sanity.mjs      # Legacy — no longer used
    └── download-images.mjs         # Legacy — no longer used
```

---

## Content Pipeline (Current State)

The site recently migrated away from Sanity CMS. All content now lives as local files in `/content`.

**`src/lib/content.ts`** is the single content access layer:

```ts
getContentIndex(folder)       // reads content/{folder}/index.json — metadata only, no markdown body
getContentDoc(folder, slug)   // reads content/{folder}/{slug}.json — full content including markdown
```

Each JSON document has this shape:
```json
{
  "_id": "...",
  "title": "The Great Casque Expansion",
  "slug": { "current": "casque-expansion" },
  "_createdAt": "2024-01-01T00:00:00Z",
  "markdown": "# Full markdown content...",
  "image": "/content-images/some-image.jpg",
  "headerImage": "/content-images/some-header.jpg"
}
```

`index.json` per folder has the same shape minus `markdown` (for efficient list pages).

**Image sync:** `scripts/sync-images.mjs` runs before every `dev` and `build`, copying `content/images/` → `public/content-images/`. This output folder is `.gitignored`.

---

## Routing

Every content type follows the same pattern:

| Route | What it renders |
|---|---|
| `/technical-docs` | List of all docs (reads `index.json`) |
| `/technical-docs/[slug]` | Single doc rendered as markdown |
| `/technical-docs/compiled` | All docs concatenated — for pasting into LLMs |
| `/speeches`, `/speeches/[slug]` | Same pattern |
| `/secret-technical-docs`, `[slug]`, `compiled` | Same pattern |
| `/concept-art` | Image grid with LightGallery |
| `/concept-art/[slug]` | Full gallery with zoom/thumbnails |
| `/` | Home: randomised featured items from all content types |

---

## Build & Deploy

```json
"dev":   "node scripts/sync-images.mjs && next dev --turbopack",
"build": "node scripts/sync-images.mjs && next build"
```

No Vercel/Netlify config detected — standard Next.js deployment.

---

## Planned Migration: GitHub API Content Source

### Goal

Replace the local `/content` folder with content fetched at runtime from the **cassowary-world-lore** GitHub repo:
- Repo: `https://github.com/Crushford/cassowary-world-lore.git`
- Local mirror (for development reference): `../cassowary-world-lore`

### Why GitHub API (not git submodule)

The key feature driving this decision is **branch-based lore versioning**: users should be able to select a branch of the lore repo and see the world as it existed at that point in history. This requires runtime fetching — a build-time submodule cannot support it.

### Lore Repo Structure

The lore repo is a markdown-first knowledge base (~48 files). The folder hierarchy and filenames are the structure — markdown frontmatter is not used. The repo is already close to a CMS content model where `file path = content section`.

```
cassowary-world-lore/
├── README.md                    # Site/repo entry point
├── 00-world-overview.md         # Root foundation docs (first-class pages)
├── 01-regions-and-places.md
├── 02-people-cultures-and-factions.md
├── 03-history-and-timeline.md
├── 04-rules-of-the-world.md
├── 05-story-foundation.md
├── GUIDING_PRINCIPLES.md
├── CORE_LOGIC.md
├── CANON_INDEX.md               # Canon status map — which docs are canon, candidate, draft
├── 99-open-questions.md         # Unresolved issues ledger
├── TO_DOS.md
├── reference/                   # Real-world baseline and world-state constraints
│   ├── README.md                # Section index
│   ├── species/                 # cassowaries.md, honeypot-ants.md, cockatoos.md
│   ├── geography/               # sahul-and-pleistocene-climate.md
│   └── ecology/                 # aphid-ant-relationships.md
├── lore/                        # Main canon layer — world systems and mechanisms
│   ├── agriculture/             # orchard-lineage-management.md
│   ├── honeypot-ants/           # harvesting, orchard-system-management, sugar-preservation
│   ├── ecology/
│   ├── biology/
│   ├── infrastructure/
│   ├── tribute/
│   ├── divergences/             # How the world diverges from real-world baseline
│   └── frameworks/
├── stories/                     # Non-canon exploratory narrative material
│   └── spikes/                  # Short experiments / scene probes
├── docs/                        # Contributor-facing docs (navigation layer, mostly points to root)
└── principles/                  # Philosophy and canon constraints (navigation layer)
```

Markdown files have inline metadata sections, not YAML frontmatter. Example:
```markdown
# Orchard Lineage Management

## Metadata
- Layer: Cassowary World system
- Topics: orchards, tree selection, propagation
- Status: Canon Candidate
- Time periods: `~6-4 MYA`, `4-3 MYA`
- Regions: Sahul orchard ecologies
```

**Content layer classification** — each folder has a distinct meaning and should receive different visual treatment:

| Layer | Folder(s) | Role | Visual treatment |
|---|---|---|---|
| Foundation | root `*.md` files | First-class world overview pages | Primary / featured |
| Canon | `lore/` | Main retrievable canon — world systems and mechanisms | Standard lore style |
| Baseline | `reference/` | Real-world substrate lore builds on — not canon itself | Reference/muted style |
| Stories | `stories/` | Non-canon narrative exploration | Clearly marked non-canon |
| Governance | `docs/`, `principles/` | Navigation / contributor meta — mostly points back to root | Utility style |
| Special | `CANON_INDEX.md` | Active canon status map | Surfaced prominently |
| Special | `99-open-questions.md` | Unresolved issues ledger | Surfaced prominently |

**README.md files** in each folder act as section index / landing pages and should render as the index route for that section.

### Planned Architecture

**Route structure** — mirrors the lore repo's folder hierarchy directly:

| Route | What it renders |
|---|---|
| `/lore` | Top-level landing — renders root `README.md` + section nav |
| `/lore/[...path]` | Any `.md` file by its repo path (e.g. `/lore/lore/agriculture/orchard-lineage-management`) |

Folder paths (no `.md` file, just a directory) resolve to that folder's `README.md`. Branch selection is a URL parameter (`?branch=chapter-3`), defaulting to `main`.

**New content layer** — `src/lib/github.ts` replaces `src/lib/content.ts`:

- `getTree(branch)` — GitHub Git Trees API (recursive), gets the full file tree in one request, cached per branch
- `getFileContent(path, branch)` — GitHub Contents API, fetches and base64-decodes a single file, cached per path+branch
- `getBranches()` — GitHub Branches API, lists available branches for the branch selector UI

Caching strategy: Next.js `fetch` with `{ next: { revalidate: 3600 } }` so GitHub is hit at most once per hour per branch+path, not on every visitor request. A `GITHUB_TOKEN` env var lifts rate limit from 60 req/hr (unauthenticated) to 5000 req/hr.

**Sidebar / navigation** — built from the tree response:
- Groups files by folder
- Highlights current file
- Respects layer classification for visual treatment
- Branch selector sits at the top of the sidebar

### What Is Not Changing (yet)

- The existing `/technical-docs`, `/speeches`, `/concept-art` routes and their local JSON content remain until explicitly migrated
- Site styling, layout, and component structure are unchanged
- The image pipeline (`sync-images.mjs`, `public/content-images/`) is unchanged for existing content
