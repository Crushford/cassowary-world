import { type SanityDocument } from 'next-sanity'
import { client } from '@/sanity/client'
import Link from 'next/link'

const SPEECHES_LIST_QUERY = `*[_type == "speech"] | order(_createdAt desc) {
  title, slug, _createdAt
}`

const options = { next: { revalidate: 30 } }

export default async function SpeechesList() {
  const speeches = await client.fetch<SanityDocument[]>(
    SPEECHES_LIST_QUERY,
    {},
    options
  )

  return (
    <main className="container mx-auto min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8 text-[var(--color-cassowary)]">
        Speeches
      </h1>
      <ul className="space-y-4">
        {speeches.map(speech => (
          <li key={speech.slug.current} className="doc-list-item">
            <Link
              className="doc-link"
              href={`/speeches/${speech.slug.current}`}
            >
              <h2 className="text-2xl font-semibold">{speech.title}</h2>
              <p className="text-sm text-[var(--color-bird-blue)]">
                {new Date(speech._createdAt).toLocaleDateString()}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
