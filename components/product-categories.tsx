import { ArrowUpRight } from 'lucide-react'
import { SectionHeading } from './section-heading'
import type { HomepageProducts } from '@/lib/homepage-types'

export function ProductCategories({ content }: { content: HomepageProducts }) {
  return (
    <section id="products" className="bg-secondary py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading eyebrow={content.eyebrow} title={content.title} description={content.description} />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {content.items.map((category) => (
          <article key={category.slug} className="group overflow-hidden rounded-3xl bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
            <div className="relative aspect-[4/3]">
              <img
                src={category.image}
                alt={`KANGDARPET ${category.name}`}
                className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between gap-4"><div><h3 className="text-xl font-bold text-navy">{category.name}</h3><p className="mt-2 text-muted-foreground">{category.text}</p></div><a href={`/products#${category.slug}`} aria-label={`View ${category.name} products`} className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary"><ArrowUpRight className="size-5" /></a></div>
              {(category.images.length > 1 || category.video) && <details className="mt-4 rounded-xl bg-secondary/70 p-3"><summary className="cursor-pointer text-sm font-semibold text-navy">View category media ({category.images.length} images{category.video ? ' + video' : ''})</summary><div className="mt-3 grid grid-cols-2 gap-2">{category.images.slice(1).map((image, index) => <img key={`${image}-${index}`} src={image} alt={`${category.name} media ${index + 2}`} className="aspect-[4/3] w-full rounded-lg object-cover" />)}{category.video && <video controls preload="metadata" className="col-span-2 aspect-video w-full rounded-lg bg-navy" src={category.video}>Your browser does not support this category video.</video>}</div></details>}
            </div>
          </article>
        ))}
        </div>
      </div>
    </section>
  )
}
