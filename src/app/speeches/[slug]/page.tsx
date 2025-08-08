import { type SanityDocument } from 'next-sanity'
import { client } from '@/sanity/client'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import Image from 'next/image'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

const SPEECH_QUERY = `*[_type == "speech" && slug.current == $slug][0]`

const options = { next: { revalidate: 30 } }

// Configure Sanity image builder
const { projectId, dataset } = client.config()
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null

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

  const docImageUrl = doc.image
    ? urlFor(doc.image)?.width(550).height(310).url()
    : null

  return (
    <div className="p-8 flex flex-col gap-4">
      <Link href="/speeches" className="back-link">
        ← Back to speeches
      </Link>

      {docImageUrl && (
        <div className="relative w-full aspect-video rounded-xl border border-[var(--color-leaf-shadow)]">
          <Image
            src={docImageUrl}
            alt={doc.title}
            fill
            className="object-cover rounded-xl"
            sizes="(max-width: 768px) 100vw, 800px"
          />
        </div>
      )}

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
