import { type SanityDocument } from 'next-sanity'
import { client } from '@/sanity/client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'

const SPEECH_QUERY = `*[_type == "speech" && slug.current == $slug][0]`

const options = { next: { revalidate: 30 } }

export default async function SpeechPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const doc = await client.fetch<SanityDocument>(
    SPEECH_QUERY,
    await params,
    options
  )

  return (
    <div className="p-8 flex flex-col gap-4">
      <Link href="/speeches" className="back-link">
        ← Back to speeches
      </Link>

      <h1 className="text-4xl font-bold mb-2 text-[var(--color-cassowary)]">
        {doc.title}
      </h1>

      <p className="text-sm text-[var(--color-bird-blue)]">
        Delivered: {new Date(doc._createdAt).toLocaleDateString()}
      </p>

      <article className="prose max-w-none mt-4">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {doc.markdown}
        </ReactMarkdown>
      </article>
    </div>
  )
}
