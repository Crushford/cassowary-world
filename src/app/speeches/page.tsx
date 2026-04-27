import { getContentIndex } from '@/lib/content'
import ContentList from '@/components/ContentList'

interface Speech {
  _id: string
  title: string
  slug: { current: string }
  _createdAt: string
}

export default function SpeechesList() {
  const speeches = getContentIndex<Speech>('speeches')
    .sort((a, b) => new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime())

  return (
    <ContentList
      title="Speeches"
      items={speeches}
      basePath="/speeches"
      layout="list"
      showThumbnails={false}
    />
  )
}
