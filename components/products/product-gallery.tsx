'use client'

import { useState } from 'react'
import { coverImage, type Product } from '@/lib/catalog'

export function ProductGallery({ product }: { product: Product }) {
  const images = product.images.length
    ? product.images
    : [{ url: coverImage(product), alt: product.name }]
  const [active, setActive] = useState(Math.min(product.coverIndex, images.length - 1))

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-secondary">
        <img
          src={images[active]?.url}
          alt={images[active]?.alt || product.name}
          className="h-full w-full object-cover"
        />
        <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
          OEM Available
        </span>
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {images.map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`View image ${index + 1} of ${product.name}`}
              className={`size-18 shrink-0 overflow-hidden rounded-xl border-2 ${active === index ? 'border-primary' : 'border-transparent'}`}
            >
              <img src={image.url} alt={image.alt || `${product.name} ${index + 1}`} className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
      {product.video && (
        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-secondary">
          <p className="px-4 py-3 text-sm font-semibold text-navy">Product video</p>
          <video src={product.video} controls playsInline preload="metadata" poster={coverImage(product)} className="aspect-video w-full bg-black" />
        </div>
      )}
    </div>
  )
}
