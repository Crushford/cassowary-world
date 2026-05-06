'use client'

import Link from 'next/link'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import {
  type TreeItem,
  type LayerType,
  type Commit,
  type BranchStatus,
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

function BranchSelector({
  branches,
  current,
  showMerged,
  onToggleMerged,
}: {
  branches: BranchStatus[]
  current: string
  showMerged: boolean
  onToggleMerged: () => void
}) {
  const router = useRouter()
  const pathname = usePathname()

  const visible = showMerged ? branches : branches.filter(b => b.isActive)

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const branch = e.target.value
    const url = branch === 'main' ? pathname : `${pathname}?branch=${branch}`
    router.push(url)
  }

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between mb-1">
        <label
          htmlFor="branch-select"
          className="text-[10px] font-mono uppercase opacity-60"
          style={{ color: 'var(--color-leaf-shadow)' }}
        >
          Branch
        </label>
        <label className="flex items-center gap-1 text-[10px] opacity-50 cursor-pointer hover:opacity-80 select-none">
          <input
            type="checkbox"
            checked={showMerged}
            onChange={onToggleMerged}
            className="w-2.5 h-2.5 cursor-pointer"
          />
          show merged
        </label>
      </div>
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
        {visible.map(b => (
          <option key={b.name} value={b.name}>{b.name}</option>
        ))}
      </select>
    </div>
  )
}

// ── Commit timeline ────────────────────────────────────────────────────────

function CommitTimeline({
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

  function selectCommit(sha: string | null) {
    const params = new URLSearchParams()
    if (branch !== 'main') params.set('branch', branch)
    if (sha) params.set('commit', sha)
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  return (
    <div className="relative pb-1" style={{ minHeight: '2rem' }}>
      {/* Vertical spine */}
      <div
        className="absolute top-2 bottom-0"
        style={{
          left: '5px',
          width: '1px',
          backgroundColor: 'var(--color-fern)',
          opacity: 0.3,
        }}
      />

      {/* Latest (head) entry */}
      {(() => {
        const isSelected = currentCommit === null
        return (
          <button
            onClick={() => selectCommit(null)}
            className="relative flex items-center gap-2.5 w-full text-left py-1 rounded transition-opacity hover:opacity-100"
            style={{ opacity: isSelected ? 1 : 0.6 }}
          >
            <span
              className="relative z-10 shrink-0 w-2.5 h-2.5 rounded-full border-2 transition-colors"
              style={{
                backgroundColor: isSelected ? 'var(--color-cassowary)' : 'var(--background)',
                borderColor: isSelected ? 'var(--color-cassowary)' : 'var(--color-fern)',
              }}
            />
            <span
              className="text-xs font-semibold"
              style={{ color: isSelected ? 'var(--color-cassowary)' : 'var(--foreground)' }}
            >
              Latest
            </span>
          </button>
        )
      })()}

      {loading && (
        <div className="pl-5 py-1 text-[10px] opacity-40" style={{ color: 'var(--foreground)' }}>
          Loading…
        </div>
      )}

      {commits.map(c => {
        const isSelected = currentCommit === c.sha
        return (
          <button
            key={c.sha}
            onClick={() => selectCommit(c.sha)}
            className="relative flex items-start gap-2.5 w-full text-left py-1 rounded transition-opacity hover:opacity-100"
            style={{ opacity: isSelected ? 1 : 0.55 }}
          >
            <span
              className="relative z-10 mt-1 shrink-0 w-2.5 h-2.5 rounded-full border-2 transition-colors"
              style={{
                backgroundColor: isSelected ? 'var(--color-cassowary)' : 'var(--background)',
                borderColor: isSelected ? 'var(--color-cassowary)' : 'var(--color-fern)',
              }}
            />
            <span className="min-w-0">
              <span
                className="block text-[10px] font-mono"
                style={{ color: 'var(--color-leaf-shadow)', opacity: 0.7 }}
              >
                {c.shortSha} · {c.date}
              </span>
              <span
                className="block text-xs truncate"
                style={{ color: isSelected ? 'var(--color-cassowary)' : 'var(--foreground)' }}
              >
                {c.message}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ── History panel ──────────────────────────────────────────────────────────

function HistoryPanel({
  branches,
  branch,
  commit,
}: {
  branches: BranchStatus[]
  branch: string
  commit: string | null
}) {
  const [isOpen, setIsOpen] = useState(true)
  const [showMerged, setShowMerged] = useState(false)

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen((o: boolean) => !o)}
        className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest w-full text-left py-1 hover:opacity-100 transition-opacity"
        style={{ color: 'var(--color-cassowary)', opacity: 0.75 }}
      >
        <span className="text-[10px]">{isOpen ? '▾' : '▸'}</span>
        History
      </button>

      {isOpen && (
        <div className="mt-2">
          <BranchSelector
            branches={branches}
            current={branch}
            showMerged={showMerged}
            onToggleMerged={() => setShowMerged((v: boolean) => !v)}
          />
          <CommitTimeline branch={branch} currentCommit={commit} />
        </div>
      )}
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
  branches: BranchStatus[]
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
      <HistoryPanel branches={branches} branch={branch} commit={commit} />

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
  branches: BranchStatus[]
}) {
  return (
    <Suspense fallback={null}>
      <LoreNavInner tree={tree} branches={branches} />
    </Suspense>
  )
}
