import { getContentIndex } from '@/lib/content'
import ContentList from '@/components/ContentList'
import Link from 'next/link'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

interface SecretTechnicalDoc {
  _id: string
  title: string
  slug: { current: string }
  _createdAt: string
  image?: SanityImageSource
}

export default function SecretTechnicalDocumentIndexPage() {
  const docs = getContentIndex<SecretTechnicalDoc>('secret-technical-docs')
    .sort((a, b) => new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime())

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
