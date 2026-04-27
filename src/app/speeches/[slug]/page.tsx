import { getContentDoc } from '@/lib/content'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface Speech {
  _id: string
  title: string
  _createdAt: string
  markdown?: string
}

export default async function SpeechPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const doc = getContentDoc<Speech>('speeches', slug)

  if (!doc) notFound()

  return (
    <div className="p-8 flex flex-col gap-4">
      <Link href="/speeches" className="back-link">
        ← Back to speeches
      </Link>

      <h1 className="text-4xl font-bold mb-2 text-[var(--color-cassowary)]">
        {doc.title}
      </h1>

      <p className="text-sm text-[var(--color-bird-blue)]">
        Delivered: {new Date(doc._createdAt).toLocaleDateString()}
      </p>

      <article className="prose max-w-none mt-4">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {doc.markdown}
        </ReactMarkdown>
      </article>
    </div>
  )
}
