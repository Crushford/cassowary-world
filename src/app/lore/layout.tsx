import { getTree, getBranchesWithStatus } from '@/lib/github'
import LoreSidebarPanel from '@/components/LoreSidebarPanel'

export default async function LoreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [tree, branches] = await Promise.all([getTree(), getBranchesWithStatus()])

  return (
    <div className="flex flex-col lg:flex-row gap-0 lg:gap-8 py-6 min-h-screen">
      <LoreSidebarPanel tree={tree} branches={branches} />

      {/* Content */}
      <div className="flex-1 min-w-0 pt-4 lg:pt-0">
        {children}
      </div>
    </div>
  )
}
