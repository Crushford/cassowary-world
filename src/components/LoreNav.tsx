'use client'

import Link from 'next/link'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import {
  type TreeItem,
  type LayerType,
  type Commit,
  getLayer,
  filePathToUrl,
  LAYER_LABELS,
  LAYER_COLORS,
  markdownFiles,
} from '@/lib/github'

// ── Types ──────────────────────────────────────────────────────────────────

type NavNode = {
  name: string
  filePath: string
  urlPath: string
  layer: LayerType
  children: NavNode[]
  isFolder: boolean
}

// ── Tree builder ───────────────────────────────────────────────────────────

function buildTree(items: TreeItem[]): NavNode[] {
  const mdFiles = markdownFiles(items)
  const root: NavNode[] = []
  const folderMap = new Map<string, NavNode>()

  for (const item of mdFiles) {
    const parts = item.path.split('/')
    const layer = getLayer(item.path)

    if (parts.length === 1) {
      root.push({
        name: friendlyName(parts[0]),
        filePath: item.path,
        urlPath: filePathToUrl(item.path),
        layer,
        children: [],
        isFolder: false,
      })
      continue
    }

    let siblings = root
    let folderPath = ''
    for (let i = 0; i < parts.length - 1; i++) {
      folderPath = folderPath ? `${folderPath}/${parts[i]}` : parts[i]
      if (!folderMap.has(folderPath)) {
        const folderNode: NavNode = {
          name: friendlyName(parts[i]),
          filePath: folderPath,
          urlPath: `/lore/${folderPath}`,
          layer: getLayer(folderPath + '/'),
          children: [],
          isFolder: true,
        }
        siblings.push(folderNode)
        folderMap.set(folderPath, folderNode)
      }
      siblings = folderMap.get(folderPath)!.children
    }

    const fileName = parts[parts.length - 1]
    siblings.push({
      name: friendlyName(fileName),
      filePath: item.path,
      urlPath: filePathToUrl(item.path),
      layer,
      children: [],
      isFolder: false,
    })
  }

  return root
}

function friendlyName(raw: string): string {
  return raw
    .replace(/\.md$/, '')
    .replace(/^\d+-/, '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
}

// ── URL helpers ────────────────────────────────────────────────────────────

function buildHref(
  urlPath: string,
  branch: string,
  commit: string | null
): string {
  const params = new URLSearchParams()
  if (branch !== 'main') params.set('branch', branch)
  if (commit) params.set('commit', commit)
  const qs = params.toString()
  return qs ? `${urlPath}?${qs}` : urlPath
}

// ── Layer badge ────────────────────────────────────────────────────────────

const LAYER_VISIBLE: LayerType[] = ['canon', 'baseline', 'stories', 'governance']

function LayerBadge({ layer }: { layer: LayerType }) {
  if (!LAYER_VISIBLE.includes(layer)) return null
  return (
    <span
      className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded opacity-70"
      style={{ backgroundColor: LAYER_COLORS[layer] + '22', color: LAYER_COLORS[layer] }}
    >
      {LAYER_LABELS[layer]}
    </span>
  )
}

// ── Branch selector ────────────────────────────────────────────────────────

function BranchSelector({ branches, current }: { branches: string[]; current: string }) {
  const router = useRouter()
  const pathname = usePathname()

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const branch = e.target.value
    // Changing branch clears any selected commit
    const url = branch === 'main' ? pathname : `${pathname}?branch=${branch}`
    router.push(url)
  }

  return (
    <div className="mb-3">
      <label
        htmlFor="branch-select"
        className="block text-xs font-mono uppercase mb-1 opacity-60"
        style={{ color: 'var(--color-leaf-shadow)' }}
      >
        Branch
      </label>
      <select
        id="branch-select"
        value={current}
        onChange={onChange}
        className="w-full text-sm rounded border px-2 py-1.5 font-mono"
        style={{
          borderColor: 'var(--color-fern)',
          backgroundColor: 'var(--background)',
          color: 'var(--foreground)',
        }}
      >
        {branches.map(b => (
          <option key={b} value={b}>{b}</option>
        ))}
      </select>
    </div>
  )
}

// ── Commit selector ────────────────────────────────────────────────────────

function CommitSelector({
  branch,
  currentCommit,
}: {
  branch: string
  currentCommit: string | null
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [commits, setCommits] = useState<Commit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/commits?branch=${branch}`)
      .then(r => r.json())
      .then((data: Commit[]) => {
        setCommits(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [branch])

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const commit = e.target.value
    const params = new URLSearchParams()
    if (branch !== 'main') params.set('branch', branch)
    if (commit) params.set('commit', commit)
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <div className="mb-4">
      <label
        htmlFor="commit-select"
        className="block text-xs font-mono uppercase mb-1 opacity-60"
        style={{ color: 'var(--color-leaf-shadow)' }}
      >
        Commit
      </label>
      <select
        id="commit-select"
        value={currentCommit ?? ''}
        onChange={onChange}
        disabled={loading}
        className="w-full text-sm rounded border px-2 py-1.5 font-mono"
        style={{
          borderColor: 'var(--color-fern)',
          backgroundColor: 'var(--background)',
          color: 'var(--foreground)',
          opacity: loading ? 0.5 : 1,
        }}
      >
        <option value="">Latest</option>
        {commits.map(c => (
          <option key={c.sha} value={c.sha}>
            {c.shortSha} · {c.date} · {c.message.slice(0, 40)}{c.message.length > 40 ? '…' : ''}
          </option>
        ))}
      </select>
    </div>
  )
}

// ── Nav node ───────────────────────────────────────────────────────────────

function NavNodeItem({
  node,
  currentUrl,
  branch,
  commit,
  depth,
  expandedFolders,
  toggleFolder,
}: {
  node: NavNode
  currentUrl: string
  branch: string
  commit: string | null
  depth: number
  expandedFolders: Set<string>
  toggleFolder: (path: string) => void
}) {
  const href = buildHref(node.urlPath, branch, commit)
  const isActive = currentUrl === node.urlPath
  const indent = depth * 12

  if (node.isFolder && node.children.length === 0) return null

  if (node.isFolder) {
    const isExpanded = expandedFolders.has(node.filePath)
    return (
      <li>
        <button
          onClick={() => toggleFolder(node.filePath)}
          className="flex items-center gap-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide mt-3 w-full text-left hover:opacity-75 transition-opacity"
          style={{ paddingLeft: `${indent}px`, color: 'var(--foreground)', opacity: 0.5 }}
        >
          <span className="text-[10px] w-2.5 shrink-0">{isExpanded ? '▾' : '▸'}</span>
          <span>{node.name}</span>
        </button>
        {isExpanded && (
          <ul>
            {node.children.map(child => (
              <NavNodeItem
                key={child.filePath}
                node={child}
                currentUrl={currentUrl}
                branch={branch}
                commit={commit}
                depth={depth + 1}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
              />
            ))}
          </ul>
        )}
      </li>
    )
  }

  return (
    <li>
      <Link
        href={href}
        className="flex items-center gap-1.5 py-1 text-sm rounded transition-colors duration-150 hover:opacity-100"
        style={{
          paddingLeft: `${indent + 8}px`,
          paddingRight: '8px',
          color: isActive ? LAYER_COLORS[node.layer] : 'var(--foreground)',
          fontWeight: isActive ? 600 : 400,
          opacity: isActive ? 1 : 0.75,
          backgroundColor: isActive ? LAYER_COLORS[node.layer] + '18' : undefined,
        }}
      >
        <span className="truncate">{node.name}</span>
        <LayerBadge layer={node.layer} />
      </Link>
    </li>
  )
}

function hasActive(node: NavNode, currentUrl: string): boolean {
  if (node.urlPath === currentUrl) return true
  return node.children.some(c => hasActive(c, currentUrl))
}

// ── Main export ────────────────────────────────────────────────────────────

function LoreNavInner({
  tree: initialTree,
  branches,
}: {
  tree: TreeItem[]
  branches: string[]
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const branch = searchParams.get('branch') ?? 'main'
  const commit = searchParams.get('commit') ?? null
  const ref = commit ?? branch

  const [tree, setTree] = useState<TreeItem[]>(initialTree)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch(`/api/tree?ref=${ref}`)
      .then(r => r.json())
      .then((data: TreeItem[]) => setTree(data))
      .catch(() => {})
  }, [ref])

  const nodes = buildTree(tree)

  // Auto-expand folders that contain the current page
  useEffect(() => {
    const expanded = new Set<string>()
    function markExpanded(nodeList: NavNode[]) {
      for (const node of nodeList) {
        if (node.isFolder && hasActive(node, pathname)) {
          expanded.add(node.filePath)
          markExpanded(node.children)
        }
      }
    }
    markExpanded(nodes)
    setExpandedFolders(expanded)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, tree])

  function toggleFolder(path: string) {
    setExpandedFolders((prev: Set<string>) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }

  return (
    <nav className="text-sm">
      <BranchSelector branches={branches} current={branch} />
      <CommitSelector branch={branch} currentCommit={commit} />

      <Link
        href={buildHref('/lore', branch, commit)}
        className="block text-xs font-mono uppercase tracking-widest mb-3 transition-opacity hover:opacity-100"
        style={{ color: 'var(--color-cassowary)', opacity: 0.8 }}
      >
        ← Lore Library
      </Link>

      <ul className="space-y-0.5">
        {nodes.map(node => (
          <NavNodeItem
            key={node.filePath}
            node={node}
            currentUrl={pathname}
            branch={branch}
            commit={commit}
            depth={0}
            expandedFolders={expandedFolders}
            toggleFolder={toggleFolder}
          />
        ))}
      </ul>
    </nav>
  )
}

export default function LoreNav({
  tree,
  branches,
}: {
  tree: TreeItem[]
  branches: string[]
}) {
  return (
    <Suspense fallback={null}>
      <LoreNavInner tree={tree} branches={branches} />
    </Suspense>
  )
}
