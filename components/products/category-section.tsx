import { getProductsByCategory, type Category } from '@/lib/products'
import { ProductCard } from './product-card'

export function CategorySection({ category, index }: { category: Category; index: number }) {
  const items = getProductsByCategory(category.slug)

  return (
    <section
      id={category.slug}
      aria-labelledby={`${category.slug}-title`}
      className="scroll-mt-40 border-b border-border py-16 last:border-b-0"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-primary">
            {`Category ${String(index + 1).padStart(2, '0')}`}
          </p>
          <h2 id={`${category.slug}-title`} className="mt-2 font-heading text-3xl font-extrabold text-navy">
            {category.name}
          </h2>
          <p className="mt-2 max-w-2xl text-muted-foreground">{category.description}</p>
        </div>
        <p className="text-sm text-muted-foreground">{`${items.length} products`}</p>
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {items.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </div>
    </section>
  )
}
