'use client'

import Image from 'next/image'
import LightGallery from 'lightgallery/react'
import 'lightgallery/css/lightgallery.css'
import 'lightgallery/css/lg-thumbnail.css'
import 'lightgallery/css/lg-zoom.css'

import lgThumbnail from 'lightgallery/plugins/thumbnail'
import lgZoom from 'lightgallery/plugins/zoom'

interface SanityImage {
  url: string
  alt?: string
  width?: number
  height?: number
}

export default function ImageGallery({ images }: { images: SanityImage[] }) {
  return (
    <LightGallery
      speed={500}
      plugins={[lgThumbnail, lgZoom]}
      elementClassNames="grid grid-cols-2 md:grid-cols-3 gap-4"
    >
      {images.map((image, index) => (
        <a
          key={index}
          href={image.url}
          className="overflow-hidden rounded-lg group relative block"
        >
          <div className="relative w-full aspect-[3/2]">
            <Image
              src={image.url}
              alt={image.alt || ''}
              fill
              className="object-contain transition-transform group-hover:scale-105 rounded-lg"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
        </a>
      ))}
    </LightGallery>
  )
}
