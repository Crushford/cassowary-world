import { getContentDoc } from '@/lib/content'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import ImageGallery from '@/components/ImageGallery'

interface ConceptArtImage {
  image: string | null
  caption?: string
  tags?: string[]
}

interface ConceptArtDocument {
  _id: string
  title: string
  slug: { current: string }
  headerImage?: string | null
  images?: ConceptArtImage[]
  description?: string
  _createdAt: string
}

export default async function ConceptArtPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const doc = getContentDoc<ConceptArtDocument>('concept-art', slug)

  if (!doc) notFound()

  return (
    <div className="p-8 flex flex-col gap-4">
      <Link href="/concept-art" className="back-link">
        ← Back to gallery
      </Link>

      {doc.headerImage && (
        <div className="relative w-full aspect-video rounded-xl border border-[var(--color-leaf-shadow)]">
          <Image
            src={doc.headerImage}
            alt={doc.title}
            fill
            className="object-cover rounded-xl"
            sizes="(max-width: 768px) 80vw, (max-width: 1024px) 80vw, 800px"
          />
        </div>
      )}

      <h1 className="text-4xl font-bold mb-2 text-[var(--color-cassowary)]">
        {doc.title}
      </h1>

      <p className="text-sm text-[var(--color-bird-blue)]">
        Created: {new Date(doc._createdAt).toLocaleDateString()}
      </p>

      {doc.images && doc.images.length > 0 && (
        <section className="mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-[var(--color-cassowary)]">
            Gallery
          </h2>
          <ImageGallery
            images={doc.images
              .filter(entry => entry.image)
              .map((entry, index) => ({
                url: entry.image!,
                alt: entry.caption || 'Concept Art',
                id: `${doc._id}-${index}`
              }))}
          />

          <div className="mt-6 space-y-4">
            {doc.images.map((entry, i) => (
              <div key={i} className="card">
                {entry.caption && (
                  <p className="text-sm text-[var(--foreground)] mb-2">
                    <strong>Note:</strong> {entry.caption}
                  </p>
                )}
                {entry.tags && entry.tags.length > 0 && (
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
