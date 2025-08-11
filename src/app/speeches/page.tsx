import { type SanityDocument } from 'next-sanity'
import { client } from '@/sanity/client'
import ContentList from '@/components/ContentList'

interface Speech extends SanityDocument {
  title: string
  slug: { current: string }
  _createdAt: string
}

const SPEECHES_LIST_QUERY = `*[_type == "speech"] | order(_createdAt desc) {
  title, slug, _createdAt
}`

const options = { next: { revalidate: 30 } }

export default async function SpeechesList() {
  const speeches = await client.fetch<Speech[]>(
    SPEECHES_LIST_QUERY,
    {},
    options
  )

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
