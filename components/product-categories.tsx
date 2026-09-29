import Image from 'next/image'
import { ArrowUpRight } from 'lucide-react'
import { SectionHeading } from './section-heading'
const categories = [
  {
    slug: 'plush',
    name: 'Plush Dog Toys',
    image: '/images/plush.png',
    text: 'Soft plush toys with squeakers for interactive play.',
  },
  {
    slug: 'rubber',
    name: 'Rubber Dog Toys',
    image: '/images/rubber.png',
    text: 'Durable rubber toys designed for aggressive chewers.',
  },
  {
    slug: 'rope',
    name: 'Rope Dog Toys',
    image: '/images/rope.png',
    text: 'Cotton rope toys for tug-of-war and dental cleaning.',
  },
  {
    slug: 'interactive',
    name: 'Interactive Dog Toys',
    image: '/images/interactive.png',
    text: 'Interactive toys that stimulate your dog's intelligence.',
  },
  {
    slug: 'tough',
    name: 'Tough Chew Toys',
    image: '/images/tough.png',
    text: 'Heavy-duty toys built for strong chewing dogs.',
  },
  {
    slug: 'oem',
    name: 'OEM & ODM Service',
    image: '/images/oem.png',
    text: 'Private label and custom manufacturing for global pet brands.',
  },
]
export function ProductCategories() {
  return (
    <section id="products" className="bg-secondary py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading
          eyebrow="Product Categories"
          title="Dog toys for every breed and play style"
          description="Explore our core product lines, all available for wholesale, private label and custom development."
        />
        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <a
              key={cat.name}
              href={`/products#${cat.slug}`}
              className="group overflow-hidden rounded-3xl bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={cat.image}
                  alt={`KANGDARPET ${cat.name}`}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex items-start justify-between gap-4 p-6">
                <div>
                  <h3 className="text-xl font-bold text-navy">{cat.name}</h3>
                  <p className="mt-2 text-muted-foreground">{cat.text}</p>
                </div>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <ArrowUpRight className="size-5" aria-hidden="true" />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
