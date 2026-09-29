import Image from 'next/image'

const categories = [
  {
    slug: 'dog-toys',
    name: 'Dog Toys',
    image: '/images/dog-toys.png',
    text: "High-quality dog toys designed for training, interaction and daily play.",
  },
  {
    slug: 'interactive',
    name: 'Interactive Dog Toys',
    image: '/images/interactive.png',
    text: "Interactive toys that stimulate your dog's intelligence.",
  },
  {
    slug: 'tough',
    name: 'Tough Dog Toys',
    image: '/images/tough.png',
    text: "Durable bite toys designed for strong dogs and professional training.",
  },
]


export function ProductCategories() {
  return (
    <section className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
      <div className="grid gap-8 md:grid-cols-3">
        {categories.map((category) => (
          <div
            key={category.slug}
            className="overflow-hidden rounded-3xl bg-card shadow-lg"
          >
            <div className="relative aspect-[4/3]">
              <Image
                src={category.image}
                alt={category.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="p-6">
              <h3 className="text-xl font-bold text-navy">
                {category.name}
              </h3>

              <p className="mt-3 text-muted-foreground">
                {category.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
