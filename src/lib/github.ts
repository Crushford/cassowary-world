const REPO_OWNER = 'Crushford'
const REPO_NAME = 'cassowary-world-lore'

function authHeaders(): HeadersInit {
  const h: HeadersInit = { Accept: 'application/vnd.github+json' }
  if (process.env.GITHUB_TOKEN) {
    h['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
  }
  return h
}

export type TreeItem = {
  path: string
  type: 'blob' | 'tree'
  sha: string
}

export type LayerType =
  | 'foundation'
  | 'canon'
  | 'baseline'
  | 'stories'
  | 'governance'
  | 'special'

export function getLayer(path: string): LayerType {
  if (path === 'CANON_INDEX.md' || path === '99-open-questions.md') return 'special'
  if (path.startsWith('lore/')) return 'canon'
  if (path.startsWith('reference/')) return 'baseline'
  if (path.startsWith('stories/')) return 'stories'
  if (path.startsWith('docs/') || path.startsWith('principles/')) return 'governance'
  return 'foundation'
}

export const LAYER_LABELS: Record<LayerType, string> = {
  foundation: 'Foundation',
  canon: 'Canon',
  baseline: 'Baseline',
  stories: 'Stories',
  governance: 'Governance',
  special: 'Special',
}

export const LAYER_COLORS: Record<LayerType, string> = {
  foundation: 'var(--color-cassowary)',
  canon: 'var(--color-leaf-shadow)',
  baseline: 'var(--color-bird-blue)',
  stories: 'var(--color-fern)',
  governance: '#9ca3af',
  special: 'var(--color-wattle-yellow)',
}

export async function getTree(branch = 'main'): Promise<TreeItem[]> {
  const res = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/git/trees/${branch}?recursive=1`,
    { headers: authHeaders(), next: { revalidate: 3600 } }
  )
  if (!res.ok) return []
  const data = await res.json()
  return (data.tree ?? []) as TreeItem[]
}

export async function getFileContent(
  path: string,
  branch = 'main'
): Promise<string | null> {
  const res = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${encodeURIComponent(path)}?ref=${branch}`,
    { headers: authHeaders(), next: { revalidate: 3600 } }
  )
  if (!res.ok) return null
  const data = await res.json()
  if (data.encoding !== 'base64' || !data.content) return null
  return Buffer.from(data.content.replace(/\n/g, ''), 'base64').toString('utf-8')
}

export async function getBranches(): Promise<string[]> {
  const res = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/branches`,
    { headers: authHeaders(), next: { revalidate: 3600 } }
  )
  if (!res.ok) return ['main']
  const data = await res.json()
  return (data as { name: string }[]).map(b => b.name)
}

export type Commit = {
  sha: string
  shortSha: string
  message: string
  date: string
}

export async function getCommits(branch = 'main', perPage = 30): Promise<Commit[]> {
  const res = await fetch(
    `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/commits?sha=${branch}&per_page=${perPage}`,
    { headers: authHeaders(), next: { revalidate: 3600 } }
  )
  if (!res.ok) return []
  const data = await res.json()
  return (data as { sha: string; commit: { message: string; author: { date: string } } }[]).map(c => ({
    sha: c.sha,
    shortSha: c.sha.slice(0, 7),
    message: c.commit.message.split('\n')[0],
    date: c.commit.author.date.slice(0, 10),
  }))
}

export function markdownFiles(tree: TreeItem[]): TreeItem[] {
  return tree.filter(item => item.type === 'blob' && item.path.endsWith('.md'))
}

// Given a URL path array (from [...path]) return the repo file path to try fetching.
// e.g. ['lore', 'agriculture', 'orchard-lineage-management'] → 'lore/agriculture/orchard-lineage-management.md'
// Falls back to {path}/README.md for directory-style URLs.
export function urlSegmentsToFilePath(segments: string[]): {
  primary: string
  fallback: string
} {
  const joined = segments.join('/')
  return {
    primary: `${joined}.md`,
    fallback: `${joined}/README.md`,
  }
}

// Convert a repo file path to a site URL path under /lore
// e.g. 'lore/agriculture/orchard-lineage-management.md' → '/lore/lore/agriculture/orchard-lineage-management'
export function filePathToUrl(filePath: string): string {
  return '/lore/' + filePath.replace(/\.md$/, '')
}
