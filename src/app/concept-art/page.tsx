import { type SanityDocument } from 'next-sanity'
import { client } from '@/sanity/client'
import Link from 'next/link'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

const CONCEPT_ART_LIST_QUERY = `*[_type == "conceptArt"] | order(_createdAt desc) {
  title, slug, headerImage, _createdAt
}`

const options = { next: { revalidate: 30 } }

// Configure Sanity image builder
const { projectId, dataset } = client.config()
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null

export default async function ConceptArtList() {
  const artworks = await client.fetch<SanityDocument[]>(
    CONCEPT_ART_LIST_QUERY,
    {},
    options
  )

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8 text-[var(--color-cassowary)]">
        Concept Art Gallery
      </h1>
      <ul className="grid md:grid-cols-2 gap-6">
        {artworks.map((art: any) => {
          const thumb = art.headerImage
            ? urlFor(art.headerImage)?.width(600).url()
            : null

          return (
            <li key={art.slug.current} className="doc-list-item">
              <Link
                href={`/concept-art/${art.slug.current}`}
                className="doc-link"
              >
                {thumb && (
                  <img
                    src={thumb}
                    alt={art.title}
                    className="rounded-lg mb-4"
                  />
                )}
                <h2 className="text-2xl font-semibold">{art.title}</h2>
                <p className="text-sm text-[var(--color-bird-blue)]">
                  {new Date(art._createdAt).toLocaleDateString()}
                </p>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
