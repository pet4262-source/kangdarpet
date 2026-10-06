import { CheckCircle2 } from 'lucide-react'
import type { HomepageAbout } from '@/lib/homepage-types'

export function AboutSection({ content }: { content: HomepageAbout }) {
  return (
    <section id="about" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
            <img src={content.image} alt={content.title} className="size-full object-cover" />
          </div>
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-primary">
            {content.eyebrow}
          </p>
          <h2 className="mt-3 text-balance font-heading text-3xl font-extrabold text-navy md:text-4xl lg:text-5xl">
            {content.title}
          </h2>
          <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
            {content.description}
          </p>

          <ul className="mt-8 flex flex-col gap-4">
            {content.highlights.map((item, index) => (
              <li key={`${item}-${index}`} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <span className="leading-relaxed text-foreground">{item}</span>
              </li>
            ))}
          </ul>
          <a
            href="#contact"
            className="mt-10 inline-flex h-12 items-center rounded-full bg-navy px-7 font-semibold text-white transition-colors hover:bg-primary"
          >
            {content.cta}
          </a>
        </div>
      </div>
    </section>
  )
}
