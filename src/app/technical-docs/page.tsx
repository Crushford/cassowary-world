import { getContentIndex } from '@/lib/content'
import ContentList from '@/components/ContentList'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

interface TechnicalDoc {
  _id: string
  title: string
  slug: { current: string }
  _createdAt: string
  image?: SanityImageSource
}

export default function TechnicalDocumentIndexPage() {
  const docs = getContentIndex<TechnicalDoc>('technical-docs')
    .sort((a, b) => new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime())

  return (
    <ContentList
      title="Technical Documents"
      items={docs}
      basePath="/technical-docs"
      layout="list"
      showThumbnails={false}
    />
  )
}
