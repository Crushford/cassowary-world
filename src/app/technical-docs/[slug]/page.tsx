import { type SanityDocument } from 'next-sanity'
import { client } from '@/sanity/client'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const DOC_QUERY = `*[_type == "technicalDocument" && slug.current == $slug][0]`

const options = { next: { revalidate: 30 } }

export default async function TechnicalDocumentPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const doc = await client.fetch<SanityDocument>(
    DOC_QUERY,
    await params,
    options
  )

  return (
    <div className="p-1  flex flex-col gap-4">
      <article className="prose">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {doc.markdown}
        </ReactMarkdown>
      </article>
    </div>
  )
}
