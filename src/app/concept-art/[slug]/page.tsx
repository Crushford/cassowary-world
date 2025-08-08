import { type SanityDocument } from 'next-sanity'
import { client } from '@/sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

const CONCEPT_ART_QUERY = `*[_type == "conceptArt" && slug.current == $slug][0]`
const options = { next: { revalidate: 30 } }

// Configure Sanity image builder
const { projectId, dataset } = client.config()
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null

export default async function ConceptArtPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const doc = await client.fetch<SanityDocument>(
    CONCEPT_ART_QUERY,
    await params,
    options
  )

  const headerUrl = doc.headerImage
    ? urlFor(doc.headerImage)?.width(550).height(310).url()
    : null

  return (
    <main className="container mx-auto min-h-screen p-8 flex flex-col gap-4">
      <Link href="/concept-art" className="back-link">
        ← Back to gallery
      </Link>

      {headerUrl && (
        <img
          src={headerUrl}
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
        Created: {new Date(doc._createdAt).toLocaleDateString()}
      </p>

      {doc.images?.length > 0 && (
        <section className="grid md:grid-cols-2 gap-6 mt-8">
          {doc.images.map((entry: any, i: number) => (
            <div key={i} className="card">
              {entry.image && (
                <img
                  src={urlFor(entry.image)?.width(600).url()}
                  alt={entry.caption || `Concept Art ${i + 1}`}
                  className="rounded-lg mb-3"
                />
              )}
              {entry.caption && (
                <p className="text-sm text-[var(--foreground)] mb-2">
                  <strong>Note:</strong> {entry.caption}
                </p>
              )}
              {entry.tags?.length > 0 && (
                <p className="text-xs text-[var(--color-bird-blue)] italic">
                  Tags: {entry.tags.join(', ')}
                </p>
              )}
            </div>
          ))}
        </section>
      )}

      {doc.description && (
        <article className="prose max-w-none mt-8">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {doc.description}
          </ReactMarkdown>
        </article>
      )}
    </main>
  )
}
