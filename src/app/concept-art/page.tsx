import { type SanityDocument } from 'next-sanity'
import { client } from '@/sanity/client'
import ContentList from '@/components/ContentList'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

interface ConceptArtListItem extends SanityDocument {
  title: string
  slug: { current: string }
  headerImage?: SanityImageSource
  _createdAt: string
}

const CONCEPT_ART_LIST_QUERY = `*[_type == "conceptArt"] | order(_createdAt desc) {
  title, slug, headerImage, _createdAt
}`

const options = { next: { revalidate: 30 } }

export default async function ConceptArtList() {
  const artworks = await client.fetch<ConceptArtListItem[]>(
    CONCEPT_ART_LIST_QUERY,
    {},
    options
  )

  return (
    <ContentList
      title="Concept Art Gallery"
      items={artworks}
      basePath="/concept-art"
      layout="grid"
      showThumbnails={true}
      thumbnailField="headerImage"
      thumbnailSize={{ width: 600, height: 450 }}
    />
  )
}
