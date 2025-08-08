import { type SanityDocument } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { client } from '@/sanity/client'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const DOC_QUERY = `*[_type == "technicalDocument" && slug.current == $slug][0]`

const { projectId, dataset } = client.config()
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null

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

  const docImageUrl = doc.image
    ? urlFor(doc.image)?.width(550).height(310).url()
    : null

  return (
    <main className="container mx-auto  p-8 flex flex-col gap-4">
      <Link href="/technical-docs" className="back-link">
        ← Back to documents
      </Link>

      {docImageUrl && (
        <img
          src={docImageUrl}
          alt={doc.title}
          className="aspect-video rounded-xl border border-[var(--color-leaf-shadow)]"
          width="550"
          height="310"
        />
      )}

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
    </main>
  )
}
