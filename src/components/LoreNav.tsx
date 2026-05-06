'use client'

import Link from 'next/link'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useEffect, useRef, useState } from 'react'
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

// ── Commit scrubber ────────────────────────────────────────────────────────

const N_BARS = 28

function CommitScrubber({
  branch,
  currentCommit,
}: {
  branch: string
  currentCommit: string | null
}) {
  const router = useRouter()
  const pathname = usePathname()
  const trackRef = useRef<HTMLDivElement>(null)
  const [commits, setCommits] = useState<Commit[]>([])
  const [loading, setLoading] = useState(true)
  const [dragPos, setDragPos] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/commits?branch=${branch}&per_page=100`)
      .then(r => r.json())
      .then((data: Commit[]) => { setCommits(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [branch])

  // Chronological order (oldest → newest)
  const chronological = [...commits].reverse()

  const minMs = chronological.length > 0 ? new Date(chronological[0].date).getTime() : Date.now()
  const maxMs = Date.now()
  const range = Math.max(maxMs - minMs, 1)

  function dateToPos(dateStr: string): number {
    return (new Date(dateStr).getTime() - minMs) / range
  }

  // Waveform: N_BARS buckets across the time range
  const bars: { count: number }[] = Array.from({ length: N_BARS }, () => ({ count: 0 }))
  for (const c of chronological) {
    const idx = Math.min(N_BARS - 1, Math.floor(dateToPos(c.date) * N_BARS))
    bars[idx].count++
  }
  const maxBarCount = Math.max(...bars.map(b => b.count), 1)

  // Map a 0–1 position to the nearest commit SHA (null = latest)
  function posToCommit(pos: number): string | null {
    if (pos > 0.98 || chronological.length === 0) return null
    let nearest = chronological[0]
    let minDist = Infinity
    for (const c of chronological) {
      const dist = Math.abs(dateToPos(c.date) - pos)
      if (dist < minDist) { minDist = dist; nearest = c }
    }
    return nearest.sha
  }

  // Current thumb position (0 = oldest, 1 = latest)
  const currentPos = (() => {
    if (currentCommit === null) return 1
    const c = commits.find(c => c.sha === currentCommit)
    return c ? dateToPos(c.date) : 1
  })()

  const displayPos = dragPos ?? currentPos
  const isLatest = currentCommit === null

  // Commit shown in the label (preview while dragging, selected otherwise)
  const labelSha = dragPos !== null ? posToCommit(dragPos) : currentCommit
  const labelCommit = labelSha ? commits.find(c => c.sha === labelSha) ?? null : null

  function getTrackPos(clientX: number): number {
    if (!trackRef.current) return 1
    const rect = trackRef.current.getBoundingClientRect()
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
  }

  function navigate(sha: string | null) {
    const params = new URLSearchParams()
    if (branch !== 'main') params.set('branch', branch)
    if (sha) params.set('commit', sha)
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId)
    setIsDragging(true)
    setDragPos(getTrackPos(e.clientX))
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging) return
    setDragPos(getTrackPos(e.clientX))
  }

  function onPointerUp(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging) return
    setIsDragging(false)
    const pos = getTrackPos(e.clientX)
    setDragPos(null)
    navigate(posToCommit(pos))
  }

  function onPointerCancel() {
    setIsDragging(false)
    setDragPos(null)
  }

  return (
    <div className="pb-3">
      {/* Scrubber track */}
      <div
        ref={trackRef}
        className="relative cursor-ew-resize"
        style={{ height: '60px', touchAction: 'none', userSelect: 'none' } as React.CSSProperties}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerCancel}
      >
        {/* Baseline */}
        <div
          className="absolute inset-x-0"
          style={{ bottom: '16px', height: '1px', backgroundColor: 'var(--color-fern)', opacity: 0.2 }}
        />

        {/* Waveform bars */}
        <div
          className="absolute inset-x-0 flex items-end"
          style={{ bottom: '17px', height: '36px', gap: '1px' }}
        >
          {!loading && bars.map((bar, i) => {
            const barMidPos = (i + 0.5) / N_BARS
            const filled = barMidPos <= displayPos
            const height = bar.count > 0
              ? Math.max(5, Math.round((bar.count / maxBarCount) * 32))
              : 2
            return (
              <div
                key={i}
                className="flex-1 rounded-t-sm"
                style={{
                  height: `${height}px`,
                  backgroundColor: filled ? 'var(--color-cassowary)' : 'var(--color-fern)',
                  opacity: filled ? (bar.count > 0 ? 0.8 : 0.15) : (bar.count > 0 ? 0.35 : 0.1),
                  alignSelf: 'flex-end',
                  transition: isDragging ? 'none' : 'background-color 0.15s, opacity 0.15s',
                }}
              />
            )
          })}
        </div>

        {/* Thumb line */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            top: 0,
            bottom: '12px',
            left: `calc(${displayPos * 100}% - 1px)`,
            width: '2px',
            backgroundColor: 'var(--color-cassowary)',
            transition: isDragging ? 'none' : 'left 0.12s ease',
          }}
        />

        {/* Thumb handle */}
        <div
          className="absolute w-3.5 h-3.5 rounded-full border-2 pointer-events-none"
          style={{
            bottom: '8px',
            left: `calc(${displayPos * 100}% - 7px)`,
            backgroundColor: isDragging ? 'var(--color-cassowary)' : 'var(--background)',
            borderColor: 'var(--color-cassowary)',
            transition: isDragging ? 'none' : 'left 0.12s ease',
          }}
        />
      </div>

      {/* Label */}
      <div
        className="flex items-center justify-between text-[10px] font-mono mt-0.5"
        style={{ color: 'var(--foreground)' }}
      >
        <span className="truncate opacity-60">
          {loading
            ? 'Loading…'
            : labelCommit
              ? `${labelCommit.date} · ${labelCommit.message.slice(0, 26)}${labelCommit.message.length > 26 ? '…' : ''}`
              : 'Latest'
          }
        </span>
        {!isLatest && (
          <button
            onClick={() => navigate(null)}
            className="shrink-0 ml-2 opacity-40 hover:opacity-80 transition-opacity"
            style={{ color: 'var(--color-cassowary)' }}
          >
            ↩ now
          </button>
        )}
      </div>
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
          <CommitScrubber branch={branch} currentCommit={commit} />
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
