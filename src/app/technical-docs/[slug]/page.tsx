import { type SanityDocument } from 'next-sanity'
import { client } from '@/sanity/client'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const DOC_QUERY = `*[_type == "technicalDocument" && slug.current == $slug][0]`

const options = { next: { revalidate: 30 } }

export default async function TechnicalDocumentPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const doc = await client.fetch<SanityDocument>(
    DOC_QUERY,
    await params,
    options
  )

  return (
    <div className="p-4 lg:p-8 flex flex-col gap-4">
      <Link href="/technical-docs" className="back-link">
        ← Back to documents
      </Link>

      <h1 className="text-4xl font-bold mb-2 text-[var(--color-cassowary)]">
        {doc.title}
      </h1>

      <p className="text-sm text-[var(--color-bird-blue)]">
        Published: {new Date(doc._createdAt).toLocaleDateString()}
      </p>

      <article className="prose max-w-none mt-4 px-0 lg:px-8">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {doc.markdown}
        </ReactMarkdown>
      </article>
    </div>
  )
}
