import { getContentIndex } from '@/lib/content'
import ContentList from '@/components/ContentList'

interface TechnicalDoc {
  _id: string
  title: string
  slug: { current: string }
  _createdAt: string
  image?: string | null
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
