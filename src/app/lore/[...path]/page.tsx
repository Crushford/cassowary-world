import {
  getFileContent,
  getLayer,
  LAYER_LABELS,
  LAYER_COLORS,
  urlSegmentsToFilePath,
} from '@/lib/github'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { notFound } from 'next/navigation'

export const revalidate = 3600

export default async function LorePage({
  params,
  searchParams,
}: {
  params: Promise<{ path: string[] }>
  searchParams: Promise<{ branch?: string; commit?: string }>
}) {
  const { path: segments } = await params
  const { branch = 'main', commit } = await searchParams
  const ref = commit ?? branch

  const { primary, fallback } = urlSegmentsToFilePath(segments)

  // Try the direct file first, then fall back to folder README
  let content = await getFileContent(primary, ref)
  let resolvedPath = primary

  if (!content) {
    content = await getFileContent(fallback, ref)
    resolvedPath = fallback
  }

  if (!content) notFound()

  const layer = getLayer(resolvedPath)

  return (
    <div className="max-w-3xl">
      <div className="mb-4 flex items-center gap-2">
        <span
          className="text-xs font-mono uppercase px-2 py-0.5 rounded"
          style={{
            backgroundColor: LAYER_COLORS[layer] + '22',
            color: LAYER_COLORS[layer],
          }}
        >
          {LAYER_LABELS[layer]}
        </span>
        {branch !== 'main' && (
          <span className="text-xs font-mono opacity-50">branch: {branch}</span>
        )}
        {commit && (
          <span className="text-xs font-mono opacity-50">@ {commit.slice(0, 7)}</span>
        )}
        <span className="text-xs font-mono opacity-30">{resolvedPath}</span>
      </div>

      <article className="prose">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
      </article>
    </div>
  )
}
