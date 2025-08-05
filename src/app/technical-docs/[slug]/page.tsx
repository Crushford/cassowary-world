import { type SanityDocument } from 'next-sanity'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { client } from '@/sanity/client'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const DOC_QUERY = `*[_type == "technicalDocument" && slug.current == $slug][0]`

const { projectId, dataset } = client.config()
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null

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

  const docImageUrl = doc.image
    ? urlFor(doc.image)?.width(550).height(310).url()
    : null

  return (
    <main className="container mx-auto min-h-screen max-w-3xl p-8 flex flex-col gap-4">
      <Link href="/technical-docs" className="hover:underline">
        ← Back to documents
      </Link>

      {docImageUrl && (
        <img
          src={docImageUrl}
          alt={doc.title}
          className="aspect-video rounded-xl"
          width="550"
          height="310"
        />
      )}

      <h1 className="text-4xl font-bold mb-2">{doc.title}</h1>

      <p className="text-sm text-gray-600">
        Published: {new Date(doc.publishedAt).toLocaleDateString()}
      </p>

      <article className="prose prose-neutral dark:prose-invert max-w-none mt-4">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...props }) => (
              <h1 className="text-3xl font-bold mt-8 mb-4" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="text-2xl font-semibold mt-6 mb-3" {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className="text-xl font-medium mt-4 mb-2" {...props} />
            ),
            p: ({ node, ...props }) => (
              <p className="leading-relaxed mb-4" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc list-inside mb-4" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal list-inside mb-4" {...props} />
            ),
            li: ({ node, ...props }) => <li className="ml-4 mb-1" {...props} />,
            a: ({ node, ...props }) => (
              <a className="text-blue-600 underline" {...props} />
            ),
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto">
                <table
                  className="table-auto border-collapse border border-gray-300 w-full my-4"
                  {...props}
                />
              </div>
            ),
            th: ({ node, ...props }) => (
              <th
                className="border border-gray-300 bg-gray-100 p-2 text-left font-semibold text-gray-900"
                {...props}
              />
            ),
            td: ({ node, ...props }) => (
              <td className="border border-gray-300 p-2 align-top" {...props} />
            ),
            blockquote: ({ node, ...props }) => (
              <blockquote
                className="border-l-4 border-gray-400 pl-4 italic text-gray-700 dark:text-gray-300 my-4"
                {...props}
              />
            ),
            code: ({ inline, className, children, ...props }) => {
              return inline ? (
                <code className="bg-gray-100 px-1 py-0.5 rounded text-sm">
                  {children}
                </code>
              ) : (
                <pre className="bg-gray-800 text-white p-4 rounded overflow-x-auto text-sm my-4">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              )
            }
          }}
        >
          {doc.markdown}
        </ReactMarkdown>
      </article>
    </main>
  )
}
