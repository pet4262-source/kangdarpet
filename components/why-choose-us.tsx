import { Factory, Palette, ShieldCheck, Truck } from 'lucide-react'
import { SectionHeading } from './section-heading'
import type { HomepageWhy } from '@/lib/homepage-types'

const icons = [Factory, ShieldCheck, Truck, Palette]

export function WhyChooseUs({ content }: { content: HomepageWhy }) {
  return (
    <section id="why-us" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
      <SectionHeading
        eyebrow={content.eyebrow}
        title={content.title}
        description={content.description}
      />

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {content.items.map(({ title, text }, index) => {
          const Icon = icons[index % icons.length]
          return (
          <article
            key={`${title}-${index}`}
            className="group rounded-3xl border border-border bg-card p-8 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10"
          >
            <span className="flex size-14 items-center justify-center rounded-2xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <Icon className="size-7" aria-hidden="true" />
            </span>

            <h3 className="mt-6 text-xl font-bold text-navy">
              {title}
            </h3>

            <p className="mt-3 leading-relaxed text-muted-foreground">
              {text}
            </p>
          </article>
          )
        })}
      </div>
    </section>
  )
}
