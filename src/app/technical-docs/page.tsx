import Link from 'next/link'
import { type SanityDocument } from 'next-sanity'

import { client } from '@/sanity/client'

// Updated query to fetch technical documents
const TECHNICAL_DOCS_QUERY = `*[
  _type == "technicalDocument"
  && defined(slug.current)
]|order(publishedAt desc)[0...50]{
  _id,
  title,
  slug,
  publishedAt
}`

const options = { next: { revalidate: 30 } }

export default async function TechnicalDocumentIndexPage() {
  const docs = await client.fetch<SanityDocument[]>(
    TECHNICAL_DOCS_QUERY,
    {},
    options
  )

  return (
    <main className="container mx-auto min-h-screen max-w-3xl p-8">
      <h1 className="text-4xl font-bold mb-8">Technical Documents</h1>
      <ul className="flex flex-col gap-y-4">
        {docs.map(doc => (
          <li className="hover:underline" key={doc._id}>
            <Link href={`/technical-docs/${doc.slug.current}`}>
              <h2 className="text-xl font-semibold">{doc.title}</h2>
              <p className="text-sm text-gray-500">
                Published: {new Date(doc.publishedAt).toLocaleDateString()}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
