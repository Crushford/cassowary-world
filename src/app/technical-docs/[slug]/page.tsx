import { getContentDoc } from '@/lib/content'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { notFound } from 'next/navigation'

interface TechnicalDoc {
  _id: string
  title: string
  _createdAt: string
  markdown?: string
}

export default async function TechnicalDocumentPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const doc = getContentDoc<TechnicalDoc>('technical-docs', slug)

  if (!doc) notFound()

  return (
    <div className="p-1 flex flex-col gap-4">
      <article className="prose">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {doc.markdown}
        </ReactMarkdown>
      </article>
    </div>
  )
}
