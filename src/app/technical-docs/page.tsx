import { type SanityDocument } from 'next-sanity'
import { client } from '@/sanity/client'
import ContentList from '@/components/ContentList'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

interface TechnicalDoc extends SanityDocument {
  title: string
  slug: { current: string }
  _createdAt: string
  image?: SanityImageSource
}

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
  const docs = await client.fetch<TechnicalDoc[]>(
    TECHNICAL_DOCS_QUERY,
    {},
    options
  )

  return (
    <ContentList
      title="Technical Documents"
      items={docs}
      basePath="/technical-docs"
      layout="list"
      showThumbnails={false}
    />
  )
}
