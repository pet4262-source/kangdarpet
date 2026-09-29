import { Star } from 'lucide-react'
import { SectionHeading } from './section-heading'

const testimonials = [
  {
    quote:
      'KANGDARPET developed our entire plush line from scratch. Quality is consistent across every shipment and communication is always fast.',
    name: 'Emily Carter',
    role: 'Product Manager, PawNest — USA',
  },
  {
    quote:
      'Their rubber chew toys passed all our EU safety tests on the first try. The small MOQ helped us launch new designs with low risk.',
    name: 'Lukas Weber',
    role: 'Founder, Hundewelt — Germany',
  },
  {
    quote:
      'Great packaging design support and on-time delivery. We have worked together for six years and keep expanding our range.',
    name: 'Sophie Martin',
    role: 'Buyer, Chien & Co — France',
  },
]

export function Testimonials() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
      <SectionHeading eyebrow="Testimonials" title="What our global clients say" />
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <figure
            key={t.name}
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
