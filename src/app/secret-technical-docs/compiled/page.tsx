import { type SanityDocument } from 'next-sanity'
import { client } from '@/sanity/client'
import Link from 'next/link'
import CopyButton from '@/components/CopyButton'

// Query to fetch all secret technical documents with their content
const ALL_SECRET_TECHNICAL_DOCS_QUERY = `*[
  _type == "secretTechnicalDocument"
  && defined(slug.current)
]|order(_createdAt asc){
  _id,
  title,
  slug,
  _createdAt,
  markdown
}`

const options = { next: { revalidate: 30 } }

export default async function CompiledSecretTechnicalDocsPage() {
  const docs = await client.fetch<SanityDocument[]>(
    ALL_SECRET_TECHNICAL_DOCS_QUERY,
    {},
    options
  )

  // Compile all documents into a single text
  const compiledContent = docs
    .map(doc => {
      const date = new Date(doc._createdAt).toLocaleDateString()
      return `# ${doc.title}\n\n**Type:** Secret Technical Document\n**Published:** ${date}\n**Document ID:** ${doc._id}\n\n${doc.markdown}\n\n---\n\n`
    })
    .join('')

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex gap-4 mb-4">
          <Link
            href="/secret-technical-docs"
            className="text-blue-600 hover:text-blue-800 inline-block"
          >
            ← Back to secret documents
          </Link>
          <span className="text-gray-400">|</span>
          <Link
            href="/technical-docs/compiled"
            className="text-blue-600 hover:text-blue-800 inline-block"
          >
            View All Compiled Docs →
          </Link>
        </div>
        <h1 className="text-4xl font-bold mb-4 text-[var(--color-cassowary)]">
          Compiled Secret Technical Documents
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          All secret technical documents compiled for LLM context. Use the copy
          button below to copy all content.
        </p>

        <div className="flex gap-4 mb-6">
          <CopyButton
            content={compiledContent}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          />
          <div className="text-sm text-gray-500 flex items-center">
            {docs.length} documents • {compiledContent.length} characters
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Compiled Content
          </h2>
          <div className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleString()}
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
          <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono leading-relaxed">
            {compiledContent}
          </pre>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-800">
          Document Summary
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {docs.map(doc => (
            <div
              key={doc._id}
              className="bg-amber-50 border border-amber-400 rounded-lg p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold text-gray-800">{doc.title}</h4>
                <span className="px-2 py-0.5 text-xs font-semibold bg-amber-400 text-amber-900 rounded">
                  SECRET
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-2">
                Published: {new Date(doc._createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500">
                {doc.markdown?.length || 0} characters
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

