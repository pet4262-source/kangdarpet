import { Star } from 'lucide-react'
import { SectionHeading } from './section-heading'
import type { HomepageTestimonials } from '@/lib/homepage-types'

export function Testimonials({ content }: { content: HomepageTestimonials }) {
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
      <SectionHeading eyebrow={content.eyebrow} title={content.title} />
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {content.items.map((t, index) => (
          <figure
            key={`${t.name}-${index}`}
            className="flex flex-col rounded-3xl bg-secondary p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
          >
            <div className="flex gap-1 text-primary" aria-label="5 out of 5 stars">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-current" aria-hidden="true" />
              ))}
            </div>
            <blockquote className="mt-5 flex-1 leading-relaxed text-navy">
              <p>{`"${t.quote}"`}</p>
            </blockquote>
            <figcaption className="mt-8 flex items-center gap-3">
              <span
                className="flex size-11 items-center justify-center rounded-full bg-primary font-heading font-bold text-primary-foreground"
                aria-hidden="true"
              >
                {t.name.charAt(0)}
              </span>
              <span>
                <span className="block font-semibold text-navy">{t.name}</span>
                <span className="block text-sm text-muted-foreground">{t.role}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
