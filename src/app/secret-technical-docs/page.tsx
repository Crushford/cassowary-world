import { type SanityDocument } from 'next-sanity'
import { client } from '@/sanity/client'
import ContentList from '@/components/ContentList'
import Link from 'next/link'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

interface SecretTechnicalDoc extends SanityDocument {
  title: string
  slug: { current: string }
  _createdAt: string
  image?: SanityImageSource
}

// Updated query to fetch secret technical documents
const SECRET_TECHNICAL_DOCS_QUERY = `*[
  _type == "secretTechnicalDocument"
  && defined(slug.current)
]|order(_createdAt desc)[0...50]{
  _id,
  title,
  slug,
  _createdAt,
  image
}`

const options = { next: { revalidate: 30 } }

export default async function SecretTechnicalDocumentIndexPage() {
  const docs = await client.fetch<SecretTechnicalDoc[]>(
    SECRET_TECHNICAL_DOCS_QUERY,
    {},
    options
  ) || []

  return (
    <>
      <div className="p-8 pb-0">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-4xl font-bold text-[var(--color-cassowary)]">
            Secret Technical Documents
          </h1>
          <Link
            href="/secret-technical-docs/compiled"
            className="text-blue-600 hover:text-blue-800 font-semibold"
          >
            View Compiled →
          </Link>
        </div>
      </div>
      <ContentList
        title=""
        items={docs}
        basePath="/secret-technical-docs"
        layout="list"
        showThumbnails={false}
      />
    </>
  )
}

