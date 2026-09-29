import { Factory, Palette, ShieldCheck, Truck } from 'lucide-react'
import { SectionHeading } from './section-heading'

const reasons = [
  {
    icon: Factory,
    title: '12+ Years Manufacturing Experience',
    text: 'Professional manufacturer specializing in dog toys with stable production capacity and strict quality control.',
  },
  {
    icon: ShieldCheck,
    title: 'Certified Safe Materials',
    text: 'Made with pet-safe, non-toxic materials. Products can meet CE, EN71 and other international testing requirements.',
  },
  {
    icon: Truck,
    title: 'Fast OEM & Worldwide Delivery',
    text: 'Sample development in 7–10 days, reliable production schedule and global export experience.',
  },
  {
    icon: Palette,
    title: 'OEM & ODM Customization',
    text: 'Custom logo, packaging, colors, materials and exclusive product development for your brand.',
  },
]

export function WhyChooseUs() {
  return (
    <section id="why-us" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
      <SectionHeading
        eyebrow="Why Choose Us"
        title="Why Global Pet Brands Choose KANGDARPET"
        description="We provide OEM & ODM manufacturing services for pet brands, wholesalers and distributors worldwide."
      />

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {reasons.map(({ icon: Icon, title, text }) => (
          <article
            key={title}
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
        ))}
      </div>
    </section>
  )
}