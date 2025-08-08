import { type SanityDocument } from 'next-sanity'
import { client } from '@/sanity/client'
import imageUrlBuilder from '@sanity/image-url'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import Image from 'next/image'
import ImageGallery from '@/components/ImageGallery'
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
    <div className="p-8 flex flex-col gap-4">
      <Link href="/concept-art" className="back-link">
        ← Back to gallery
      </Link>

      {headerUrl && (
        <div className="relative w-full aspect-video rounded-xl border border-[var(--color-leaf-shadow)]">
          <Image
            src={headerUrl}
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
        Created: {new Date(doc._createdAt).toLocaleDateString()}
      </p>

      {doc.images?.length > 0 && (
        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-[var(--color-cassowary)]">
            Gallery
          </h2>
          <ImageGallery
            images={doc.images.map((entry: any) => ({
              url: urlFor(entry.image)?.width(800).url() || '',
              alt: entry.caption || 'Concept Art',
              width: entry.image?.asset?.metadata?.dimensions?.width,
              height: entry.image?.asset?.metadata?.dimensions?.height
            }))}
          />

          {/* Display captions and tags below the gallery */}
          <div className="mt-6 space-y-4">
            {doc.images.map((entry: any, i: number) => (
              <div key={i} className="card">
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
          </div>
        </section>
      )}

      {doc.description && (
        <article className="prose max-w-none mt-8">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {doc.description}
          </ReactMarkdown>
        </article>
      )}
    </div>
  )
}
