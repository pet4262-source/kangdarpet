import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CheckCircle2, MessageCircle } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { ProductCard } from '@/components/products/product-card'
import { ProductGallery } from '@/components/products/product-gallery'
import { InquiryForm } from '@/components/products/inquiry-form'
import { company, contactInfo } from '@/lib/site'
import { getPublishedCatalog } from '@/lib/catalog-store'
import { coverImage } from '@/lib/catalog'

export const dynamic = 'force-dynamic'
const services = ['Custom logo & colors', 'Private label packaging', 'Free design support', 'Samples available']

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params; const { catalog } = await getPublishedCatalog(); const product = catalog.products.find((item) => item.slug === slug)
  if (!product) return { robots: { index: false, follow: false } }
  const title = `${product.name} | KANGDARPET Wholesale`
  const description = `${product.description} OEM available, MOQ ${product.moq} pcs.`
  return {
    title,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title, description, type: 'website', siteName: 'KANGDARPET', url: `/products/${product.slug}`, images: [coverImage(product)] },
  }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const { catalog } = await getPublishedCatalog(); const product = catalog.products.find((item) => item.slug === slug)
  if (!product) notFound()
  const category = catalog.categories.find((item) => item.slug === product.category)
  const related = catalog.products.filter((item) => item.category === product.category && item.id !== product.id).slice(0, 4)
  const specs = [{ label: 'Category', value: category?.name ?? product.category }, { label: 'Material', value: product.material || 'Available on request' }, { label: 'Size', value: product.size || 'Custom size' }, { label: 'MOQ', value: `${product.moq.toLocaleString('en-US')} pcs` }, { label: 'Certification', value: company.certifications.join(' / ') }, { label: 'Customization', value: 'OEM & ODM available' }, ...product.attributes.map((attribute) => ({ label: attribute.name, value: attribute.value }))]
  return <><SiteHeader /><main className="mx-auto max-w-7xl px-5 py-10 lg:px-8 md:py-14"><nav aria-label="Breadcrumb" className="text-sm text-muted-foreground"><ol className="flex flex-wrap items-center gap-2"><li><a href="/" className="hover:text-primary">Home</a></li><li aria-hidden="true">/</li><li><a href="/products" className="hover:text-primary">Products</a></li><li aria-hidden="true">/</li><li><a href={`/products#${product.category}`} className="hover:text-primary">{category?.name}</a></li><li aria-hidden="true">/</li><li aria-current="page" className="text-navy">{product.name}</li></ol></nav><div className="mt-8 grid gap-10 lg:grid-cols-2 lg:gap-14"><ProductGallery product={product} /><div className="flex flex-col"><p className="text-sm font-semibold uppercase tracking-widest text-primary">{category?.name}</p><h1 className="mt-2 font-heading text-3xl font-extrabold text-navy md:text-4xl">{product.name}</h1><p className="mt-2 font-mono text-xs text-muted-foreground">SKU: {product.sku}</p><p className="mt-4 text-lg leading-relaxed text-muted-foreground">{product.description}</p><dl className="mt-8 grid grid-cols-2 overflow-hidden rounded-2xl border border-border">{specs.map((spec) => <div key={spec.label} className="border-b border-border p-4 odd:border-r [&:nth-last-child(-n+2)]:border-b-0"><dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{spec.label}</dt><dd className="mt-1 font-semibold text-navy">{spec.value}</dd></div>)}</dl>{product.specifications.length > 0 && <div className="mt-6 rounded-2xl bg-secondary p-4"><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Available options</p>{product.specifications.map((spec) => <div key={spec.name} className="mt-3 flex flex-wrap items-center gap-2"><span className="w-20 text-sm font-semibold text-navy">{spec.name}</span>{spec.options.map((option) => <span key={option} className="rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-navy">{option}</span>)}</div>)}</div>}<ul className="mt-6 grid gap-3 sm:grid-cols-2">{services.map((service) => <li key={service} className="flex items-center gap-2 text-sm text-navy"><CheckCircle2 className="size-4 text-primary" aria-hidden="true" />{service}</li>)}</ul><div className="mt-8 flex flex-wrap gap-3"><a href="#inquiry" className="inline-flex items-center rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25">Request a Quote</a><a href={`${contactInfo.whatsappLink}?text=${encodeURIComponent(`Hello, I'm interested in ${product.name}.`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 font-semibold text-navy transition-colors hover:border-primary hover:text-primary"><MessageCircle className="size-4" aria-hidden="true" />WhatsApp Us</a></div></div></div><section id="inquiry" className="mt-16 grid gap-8 rounded-3xl bg-secondary p-6 lg:grid-cols-[1fr_.9fr] lg:p-10"><div><p className="text-sm font-semibold uppercase tracking-widest text-primary">Factory-direct wholesale</p><h2 className="mt-2 font-heading text-3xl font-extrabold text-navy">Let&apos;s build your next best seller.</h2><p className="mt-4 max-w-xl leading-relaxed text-muted-foreground">Share your expected quantity, customization requirements and destination market. We can advise on materials, packaging, sampling and lead time.</p></div><InquiryForm productSlug={product.slug} productName={product.name} /></section>{related.length > 0 && <section aria-labelledby="related-title" className="mt-20"><h2 id="related-title" className="font-heading text-2xl font-extrabold text-navy">{`More ${category?.name}`}</h2><div className="mt-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div></section>}</main><SiteFooter /></>
}
