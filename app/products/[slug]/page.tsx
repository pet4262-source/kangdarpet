import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { CheckCircle2, MessageCircle } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ProductCard } from '@/components/products/product-card'
import { getCategory, getProduct, getProductsByCategory, products } from '@/lib/products'
import { company, contactInfo } from '@/lib/site'

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) return {}
  return {
    title: `${product.name} | KANGDARPET Wholesale`,
    description: `${product.description} OEM available, MOQ ${product.moq} pcs.`,
  }
}

const services = ['Custom logo & colors', 'Private label packaging', 'Free design support', 'Samples available']

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = getProduct(slug)
  if (!product) notFound()

  const category = getCategory(product.category)
  const related = getProductsByCategory(product.category)
    .filter((item) => item.slug !== product.slug)
    .slice(0, 4)

  const specs = [
    { label: 'Category', value: category?.name ?? '' },
    { label: 'Material', value: product.material },
    { label: 'Size', value: product.size },
    { label: 'MOQ', value: `${product.moq.toLocaleString('en-US')} pcs` },
    { label: 'Certification', value: company.certifications.join(' / ') },
    { label: 'Customization', value: 'OEM & ODM available' },
  ]

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8 md:py-14">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <a href="/" className="hover:text-primary">
                Home
              </a>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <a href="/products" className="hover:text-primary">
                Products
              </a>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <a href={`/products#${product.category}`} className="hover:text-primary">
                {category?.name}
              </a>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-navy">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-secondary">
            <Image
              src={product.image || '/placeholder.svg'}
              alt={product.name}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-sm font-semibold text-primary-foreground">
              OEM Available
            </span>
          </div>

          <div className="flex flex-col">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">{category?.name}</p>
            <h1 className="mt-2 font-heading text-3xl font-extrabold text-navy md:text-4xl">{product.name}</h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{product.description}</p>

            <dl className="mt-8 grid grid-cols-2 overflow-hidden rounded-2xl border border-border">
              {specs.map((spec) => (
                <div key={spec.label} className="border-b border-border p-4 odd:border-r [&:nth-last-child(-n+2)]:border-b-0">
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{spec.label}</dt>
                  <dd className="mt-1 font-semibold text-navy">{spec.value}</dd>
                </div>
              ))}
            </dl>

            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {services.map((service) => (
                <li key={service} className="flex items-center gap-2 text-sm text-navy">
                  <CheckCircle2 className="size-4 text-primary" aria-hidden="true" />
                  {service}
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/#contact"
                className="inline-flex items-center rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25"
              >
                Request a Quote
              </a>
              <a
                href={`${contactInfo.whatsappLink}?text=${encodeURIComponent(`Hello, I'm interested in ${product.name}.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 font-semibold text-navy transition-colors hover:border-primary hover:text-primary"
              >
                <MessageCircle className="size-4" aria-hidden="true" />
                WhatsApp Us
              </a>
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section aria-labelledby="related-title" className="mt-20">
            <h2 id="related-title" className="font-heading text-2xl font-extrabold text-navy">
              {`More ${category?.name}`}
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.slug} product={item} />
              ))}
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </>
  )
}
