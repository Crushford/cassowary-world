import Link from 'next/link'
import { type SanityDocument } from 'next-sanity'
import Image from 'next/image'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

import { client } from '@/sanity/client'

const { projectId, dataset } = client.config()
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null

// Updated query to fetch technical documents
const TECHNICAL_DOCS_QUERY = `*[
  _type == "technicalDocument"
  && defined(slug.current)
]|order(_createdAt desc)[0...50]{
  _id,
  title,
  slug,
  _createdAt,
  image
}`

const options = { next: { revalidate: 30 } }

export default async function TechnicalDocumentIndexPage() {
  const docs = await client.fetch<SanityDocument[]>(
    TECHNICAL_DOCS_QUERY,
    {},
    options
  )

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-[var(--color-cassowary)]">
          Technical Documents
        </h1>
      </div>
      <ul className="flex flex-col gap-y-4">
        {docs.map(doc => {
          const thumbnailUrl = doc.image
            ? urlFor(doc.image)?.width(120).height(80).url()
            : null

          return (
            <li key={doc._id} className="doc-list-item">
              <Link
                href={`/technical-docs/${doc.slug.current}`}
                className="doc-link"
              >
                <div className="flex gap-4 items-start">
                  {thumbnailUrl && (
                    <div className="relative w-30 h-20 rounded-lg border border-[var(--color-leaf-shadow)] flex-shrink-0">
                      <Image
                        src={thumbnailUrl}
                        alt={doc.title}
                        fill
                        className="object-cover rounded-lg"
                        sizes="120px"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-[var(--color-leaf-shadow)]">
                      {doc.title}
                    </h2>
                    <p className="text-sm text-[var(--color-bird-blue)]">
                      Published: {new Date(doc._createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
