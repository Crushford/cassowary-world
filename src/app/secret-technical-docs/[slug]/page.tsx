import { getContentDoc } from '@/lib/content'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { notFound } from 'next/navigation'
import Link from 'next/link'

interface SecretDoc {
  _id: string
  title: string
  _createdAt: string
  markdown?: string
}

export default async function SecretTechnicalDocumentPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const doc = getContentDoc<SecretDoc>('secret-technical-docs', slug)

  if (!doc || !doc.markdown) notFound()

  return (
    <div className="p-8 flex flex-col gap-4">
      <Link href="/secret-technical-docs" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
        ← Back to secret documents
      </Link>

      <h1 className="text-4xl font-bold mb-2 text-[var(--color-cassowary)]">
        {doc.title}
      </h1>

      <p className="text-sm text-[var(--color-bird-blue)]">
        Published: {new Date(doc._createdAt).toLocaleDateString()}
      </p>

      <article className="prose max-w-none mt-4">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {doc.markdown}
        </ReactMarkdown>
      </article>
    </div>
  )
}
