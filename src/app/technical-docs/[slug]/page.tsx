import { type SanityDocument } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { client } from '@/sanity/client'
import Link from 'next/link'
import Image from 'next/image'
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
    <div className="p-4 lg:p-8 flex flex-col gap-4">
      <Link href="/technical-docs" className="back-link">
        ← Back to documents
      </Link>

      {docImageUrl && (
        <div className="relative w-full aspect-video rounded-xl border border-[var(--color-leaf-shadow)]">
          <Image
            src={docImageUrl}
            alt={doc.title}
            fill
            className="object-cover rounded-xl"
            sizes="(max-width: 768px) 100vw, 800px"
          />
        </div>
      )}

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
