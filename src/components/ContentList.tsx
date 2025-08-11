import Link from 'next/link'
import Image from 'next/image'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'
import { client } from '@/sanity/client'

// Configure Sanity image builder
const { projectId, dataset } = client.config()
const urlFor = (source: SanityImageSource) =>
  projectId && dataset
    ? imageUrlBuilder({ projectId, dataset }).image(source)
    : null

// Base interface for content items
interface BaseContentItem {
  _id: string
  title: string
  slug: { current: string }
  _createdAt: string
}

// Extended interfaces for different content types
interface TechnicalDocItem extends BaseContentItem {
  image?: SanityImageSource
}

interface SpeechItem extends BaseContentItem {
  // No additional fields needed
}

interface ConceptArtItem extends BaseContentItem {
  headerImage?: SanityImageSource
}

type ContentItem = TechnicalDocItem | SpeechItem | ConceptArtItem

interface ContentListProps {
  title: string
  items: ContentItem[]
  basePath: string
  layout?: 'list' | 'grid'
  showThumbnails?: boolean
  thumbnailField?: 'image' | 'headerImage'
  thumbnailSize?: { width: number; height: number }
}

export default function ContentList({
  title,
  items,
  basePath,
  layout = 'list',
  showThumbnails = false,
  thumbnailField = 'image',
  thumbnailSize = { width: 120, height: 80 }
}: ContentListProps) {
  const getThumbnailUrl = (item: ContentItem) => {
    if (!showThumbnails) return null

    const imageSource =
      thumbnailField === 'image'
        ? (item as TechnicalDocItem).image
        : (item as ConceptArtItem).headerImage

    return imageSource
      ? urlFor(imageSource)
          ?.width(thumbnailSize.width)
          .height(thumbnailSize.height)
          .url()
      : null
  }

  const containerClasses =
    layout === 'grid' ? 'grid md:grid-cols-2 gap-6' : 'flex flex-col gap-y-4'

  const itemClasses = layout === 'grid' ? 'doc-list-item' : 'doc-list-item'

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold mb-8 text-[var(--color-cassowary)]">
        {title}
      </h1>
      <ul className={containerClasses}>
        {items.map(item => {
          const thumbnailUrl = getThumbnailUrl(item)

          if (layout === 'grid') {
            return (
              <li key={item._id} className="doc-list-item">
                <Link
                  href={`${basePath}/${item.slug.current}`}
                  className="doc-link"
                >
                  {showThumbnails && thumbnailUrl && (
                    <div className="relative w-full aspect-[4/3] mb-4">
                      <Image
                        src={thumbnailUrl}
                        alt={item.title}
                        fill
                        className="object-cover rounded-lg"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  )}
                  <h2 className="text-2xl font-semibold">{item.title}</h2>
                  <p className="text-sm text-[var(--color-bird-blue)]">
                    {new Date(item._createdAt).toLocaleDateString()}
                  </p>
                </Link>
              </li>
            )
          }

          return (
            <li key={item._id} className="doc-list-item">
              <Link
                href={`${basePath}/${item.slug.current}`}
                className="doc-link"
              >
                <div className="flex gap-4 items-start">
                  {showThumbnails && thumbnailUrl && (
                    <div className="relative rounded-lg border border-[var(--color-leaf-shadow)] flex-shrink-0">
                      <Image
                        src={thumbnailUrl}
                        alt={item.title}
                        fill
                        className="rounded-lg"
                        sizes={`${thumbnailSize.width}px`}
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-[var(--color-leaf-shadow)]">
                      {item.title}
                    </h2>
                    <p className="text-sm text-[var(--color-bird-blue)]">
                      Published:{' '}
                      {new Date(item._createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
