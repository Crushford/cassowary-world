import { getContentIndex } from '@/lib/content'
import ContentList from '@/components/ContentList'

interface ConceptArtListItem {
  _id: string
  title: string
  slug: { current: string }
  headerImage?: string | null
  _createdAt: string
}

export default function ConceptArtList() {
  const artworks = getContentIndex<ConceptArtListItem>('concept-art')
    .sort((a, b) => new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime())

  return (
    <ContentList
      title="Concept Art Gallery"
      items={artworks}
      basePath="/concept-art"
      layout="grid"
      showThumbnails={true}
      thumbnailField="headerImage"
      thumbnailSize={{ width: 600, height: 450 }}
    />
  )
}
