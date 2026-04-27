'use client'

import Link from 'next/link'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import {
  type TreeItem,
  type LayerType,
  getLayer,
  filePathToUrl,
  LAYER_LABELS,
  LAYER_COLORS,
  markdownFiles,
} from '@/lib/github'

// ── Types ──────────────────────────────────────────────────────────────────

type NavNode = {
  name: string
  filePath: string // full repo path, e.g. 'lore/agriculture/orchard-lineage-management.md'
  urlPath: string  // site URL, e.g. '/lore/lore/agriculture/orchard-lineage-management'
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
      // Root-level file
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

    // Ensure all ancestor folders exist
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

    // Add the file itself
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
    .replace(/^\d+-/, '')        // strip leading number prefix (00-, 01-, etc.)
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
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
    const url = branch === 'main' ? pathname : `${pathname}?branch=${branch}`
    router.push(url)
  }

  return (
    <div className="mb-4">
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

// ── Nav node ───────────────────────────────────────────────────────────────

function NavNodeItem({
  node,
  currentUrl,
  branch,
  depth,
}: {
  node: NavNode
  currentUrl: string
  branch: string
  depth: number
}) {
  const href = branch === 'main' ? node.urlPath : `${node.urlPath}?branch=${branch}`
  const isActive = currentUrl === node.urlPath
  const indent = depth * 12

  if (node.isFolder && node.children.length === 0) return null

  if (node.isFolder) {
    const hasActiveChild = node.children.some(c => hasActive(c, currentUrl))
    return (
      <li>
        <div
          className="flex items-center gap-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide opacity-50 mt-3"
          style={{ paddingLeft: `${indent}px`, color: 'var(--foreground)' }}
        >
          <span>{node.name}</span>
          {hasActiveChild && <span style={{ color: 'var(--color-fern)' }}>▸</span>}
        </div>
        <ul>
          {node.children.map(child => (
            <NavNodeItem
              key={child.filePath}
              node={child}
              currentUrl={currentUrl}
              branch={branch}
              depth={depth + 1}
            />
          ))}
        </ul>
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
  tree,
  branches,
}: {
  tree: TreeItem[]
  branches: string[]
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const branch = searchParams.get('branch') ?? 'main'
  const nodes = buildTree(tree)

  return (
    <nav className="text-sm">
      <BranchSelector branches={branches} current={branch} />

      <Link
        href={branch === 'main' ? '/lore' : `/lore?branch=${branch}`}
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
            depth={0}
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
