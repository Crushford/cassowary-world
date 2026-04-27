import { getTree, getBranches } from '@/lib/github'
import LoreNav from '@/components/LoreNav'

export default async function LoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [tree, branches] = await Promise.all([getTree(), getBranches()])

  return (
    <div className="flex gap-8 py-6 min-h-screen">
      {/* Sidebar */}
      <aside
        className="hidden lg:block w-56 xl:w-64 shrink-0 sticky top-6 self-start max-h-[calc(100vh-3rem)] overflow-y-auto"
        style={{ borderRight: '1px solid var(--color-fern)', paddingRight: '1.5rem' }}
      >
        <LoreNav tree={tree} branches={branches} />
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  )
}
