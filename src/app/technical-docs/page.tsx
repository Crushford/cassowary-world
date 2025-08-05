import Link from 'next/link'
import { type SanityDocument } from 'next-sanity'

import { client } from '@/sanity/client'

// Updated query to fetch technical documents
const TECHNICAL_DOCS_QUERY = `*[
  _type == "technicalDocument"
  && defined(slug.current)
]|order(_createdAt desc)[0...50]{
  _id,
  title,
  slug,
  _createdAt
}`

const options = { next: { revalidate: 30 } }

export default async function TechnicalDocumentIndexPage() {
  const docs = await client.fetch<SanityDocument[]>(
    TECHNICAL_DOCS_QUERY,
    {},
    options
  )

  return (
    <main className="container mx-auto min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8 text-[var(--color-cassowary)]">
        Technical Documents
      </h1>
      <ul className="flex flex-col gap-y-4">
        {docs.map(doc => (
          <li key={doc._id} className="doc-list-item">
            <Link
              href={`/technical-docs/${doc.slug.current}`}
              className="doc-link"
            >
              <h2 className="text-xl font-semibold text-[var(--color-leaf-shadow)]">
                {doc.title}
              </h2>
              <p className="text-sm text-[var(--color-bird-blue)]">
                Published: {new Date(doc._createdAt).toLocaleDateString()}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
