'use client'

import { useState, useEffect } from 'react'
import { type TreeItem } from '@/lib/github'
import LoreNav from './LoreNav'

export default function LoreSidebarPanel({
  tree,
  branches,
}: {
  tree: TreeItem[]
  branches: string[]
}) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (window.innerWidth >= 1024) setIsOpen(true)
  }, [])

  return (
    <aside
      className="w-full lg:w-56 xl:w-64 shrink-0 lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pr-6"
      style={{ borderRight: isOpen ? '1px solid var(--color-fern)' : undefined } as React.CSSProperties}
    >
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen((o: boolean) => !o)}
        className="w-full flex items-center justify-between py-2 px-1 text-sm font-mono uppercase tracking-widest hover:opacity-100 transition-opacity"
        style={{ color: 'var(--color-cassowary)', opacity: 0.75 }}
        aria-expanded={isOpen}
        aria-controls="lore-nav-panel"
      >
        <span>File Tree</span>
        <span className="text-xs">{isOpen ? '▴' : '▾'}</span>
      </button>

      <div
        id="lore-nav-panel"
        className={isOpen ? 'block' : 'hidden'}
        style={{ borderTop: '1px solid var(--color-fern)', paddingTop: '0.75rem' }}
      >
        <LoreNav tree={tree} branches={branches} />
      </div>
    </aside>
  )
}
