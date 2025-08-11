'use client'

import { useEffect } from 'react'

export default function SidebarAutoHide({
  targetId = 'sidebar',
  topPx = 250 // show if any of the first 250px are visible
}: {
  targetId?: string
  topPx?: number
}) {
  useEffect(() => {
    const el = document.getElementById(targetId) as HTMLDetailsElement | null
    if (!el) return

    const onScroll = () => {
      const y = window.scrollY
      // If we've scrolled less than topPx, the top part is still in view
      el.open = y < topPx
    }

    // Initial check
    onScroll()

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [targetId, topPx])

  return null
}
