import { getContentIndex } from '@/lib/content'
import Link from 'next/link'
import Image from 'next/image'
import imageUrlBuilder from '@sanity/image-url'
import type { SanityImageSource } from '@sanity/image-url/lib/types/types'

const urlFor = (source: SanityImageSource) =>
  imageUrlBuilder({ projectId: 'm6hc4vjm', dataset: 'production' }).image(source)

interface TechnicalDoc {
  _id: string
  title: string
  slug: { current: string }
  _createdAt: string
  image?: SanityImageSource
  headerImage?: SanityImageSource
  markdown?: string
}

interface Speech {
  _id: string
  title: string
  slug: { current: string }
  _createdAt: string
  headerImage?: SanityImageSource
  markdown?: string
}

interface ConceptArt {
  _id: string
  title: string
  slug: { current: string }
  images?: Array<{
    image: SanityImageSource
    caption?: string
    tags?: string[]
  }>
  _createdAt: string
  description?: string
}

type ContentItemWithType =
  | (TechnicalDoc & { type: 'technical'; category: string })
  | (Speech & { type: 'speech'; category: string })
  | (ConceptArt & { type: 'concept-art'; category: string })

export default function HomePage() {
  const technicalDocs = getContentIndex<TechnicalDoc>('technical-docs')
    .sort((a, b) => new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime())
    .slice(0, 3)

  const speeches = getContentIndex<Speech>('speeches')
    .sort((a, b) => new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime())
    .slice(0, 2)

  const conceptArt = getContentIndex<ConceptArt>('concept-art')
    .sort((a, b) => new Date(b._createdAt).getTime() - new Date(a._createdAt).getTime())
    .slice(0, 2)

  const allContent: ContentItemWithType[] = [
    ...technicalDocs.map(doc => ({ ...doc, type: 'technical' as const, category: 'TECHNICAL' })),
    ...speeches.map(speech => ({ ...speech, type: 'speech' as const, category: 'SPEECHES' })),
    ...conceptArt.map(art => ({ ...art, type: 'concept-art' as const, category: 'CONCEPT ART' }))
  ].sort(() => Math.random() - 0.5)

  const [featuredArticle, ...remainingArticles] = allContent

  const getImageUrl = (item: ContentItemWithType) => {
    if (item.type === 'concept-art' && item.images && item.images.length > 0) {
      return urlFor(item.images[0].image).width(800).height(600).url()
    }
    if ('headerImage' in item && item.headerImage) {
      return urlFor(item.headerImage).width(800).height(600).url()
    }
    if (item.type === 'technical' && item.image) {
      return urlFor(item.image).width(800).height(600).url()
    }
    return null
  }

  const getDescription = (item: ContentItemWithType) => {
    if (item.type === 'concept-art' && item.description) return item.description
    if ('markdown' in item && item.markdown) {
      const lines = item.markdown.split('\n').filter((line: string) => line.trim())
      return lines.slice(0, 2).join(' ')
    }
    return null
  }

  const getPath = (item: ContentItemWithType) => {
    switch (item.type) {
      case 'technical': return `/technical-docs/${item.slug.current}`
      case 'speech': return `/speeches/${item.slug.current}`
      case 'concept-art': return `/concept-art/${item.slug.current}`
    }
  }

  return (
    <div className="py-8">
      {featuredArticle && (
        <div className="mb-8">
          <Link href={getPath(featuredArticle)} className="block group">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden">
                {getImageUrl(featuredArticle) ? (
                  <Image
                    src={getImageUrl(featuredArticle)!}
                    alt={featuredArticle.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[var(--color-cassowary)] to-[var(--color-bird-blue)] flex items-center justify-center">
                    <span className="text-white text-4xl">🎨</span>
                  </div>
                )}
              </div>
              <div>
                <span className="inline-block px-3 py-1 bg-[var(--color-cassowary)] text-white text-sm font-medium rounded-full mb-3">
                  {featuredArticle.category}
                </span>
                <h2 className="text-3xl font-bold mb-4 text-[var(--color-cassowary)] group-hover:text-[var(--color-bird-blue)] transition-colors">
                  {featuredArticle.title}
                </h2>
                {getDescription(featuredArticle) && (
                  <p className="text-lg text-[var(--foreground)] leading-relaxed">
                    {getDescription(featuredArticle)}
                  </p>
                )}
                <p className="text-sm text-[var(--color-bird-blue)] mt-4">
                  {new Date(featuredArticle._createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </Link>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {remainingArticles.map(article => (
          <Link key={article._id} href={getPath(article)} className="block group">
            <article className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300">
              <div className="relative aspect-[3/2]">
                {getImageUrl(article) ? (
                  <Image
                    src={getImageUrl(article)!}
                    alt={article.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[var(--color-cassowary)] to-[var(--color-bird-blue)] flex items-center justify-center">
                    <span className="text-white text-2xl">
                      {article.type === 'speech' ? '🎤' : article.type === 'technical' ? '🔧' : '🎨'}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <span className="inline-block px-2 py-1 bg-[var(--color-cassowary)] text-white text-xs font-medium rounded-full mb-2">
                  {article.category}
                </span>
                <h3 className="font-semibold text-lg mb-2 text-[var(--color-cassowary)] group-hover:text-[var(--color-bird-blue)] transition-colors line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-[var(--color-bird-blue)]">
                  {new Date(article._createdAt).toLocaleDateString()}
                </p>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  )
}
