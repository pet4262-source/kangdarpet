import type { Metadata } from 'next'
import { CheckCircle2 } from 'lucide-react'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { CategorySection } from '@/components/products/category-section'
import { company } from '@/lib/site'
import { getPublishedCatalog } from '@/lib/catalog-store'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Products | KANGDARPET Wholesale Dog Toys',
  description: 'Browse KANGDARPET wholesale dog toys with OEM, ODM, custom attributes, variants and MOQ details.',
  alternates: { canonical: '/products' },
  openGraph: {
    type: 'website', url: '/products', siteName: 'KANGDARPET',
    title: 'KANGDARPET Wholesale Dog Toys',
    description: 'Explore factory-direct dog toys for global brands.',
    images: ['/images/hero.png'],
  },
}
const highlights = ['OEM & ODM on every item', 'Custom logo & packaging', `${company.certifications.join(' / ')} compliant`]

export default async function ProductsPage() {
  const { catalog } = await getPublishedCatalog()
  return <><SiteHeader /><main><section className="bg-navy py-16 text-white md:py-20"><div className="mx-auto max-w-7xl px-5 lg:px-8"><nav aria-label="Breadcrumb" className="text-sm text-white/60"><ol className="flex items-center gap-2"><li><a href="/" className="hover:text-white">Home</a></li><li aria-hidden="true">/</li><li aria-current="page" className="text-white">Products</li></ol></nav><h1 className="mt-4 max-w-3xl font-heading text-4xl font-extrabold leading-tight text-balance md:text-5xl">Wholesale Dog Toy Catalog</h1><p className="mt-4 max-w-2xl text-lg leading-relaxed text-white/75">{`${catalog.products.length} factory-direct products across ${catalog.categories.length} categories. Every item can be customized with your brand, colors and packaging.`}</p><ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">{highlights.map((item) => <li key={item} className="flex items-center gap-2 text-sm font-medium text-white/90"><CheckCircle2 className="size-4 text-primary" aria-hidden="true" />{item}</li>)}</ul></div></section><nav aria-label="Product categories" className="sticky top-[73px] z-40 border-b border-border bg-background/95 backdrop-blur-md"><ul className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-5 py-3 lg:px-8">{catalog.categories.map((category) => <li key={category.slug} className="shrink-0"><a href={`#${category.slug}`} className="block rounded-full border border-border px-4 py-2 text-sm font-medium text-navy transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground">{category.name}</a></li>)}</ul></nav><div className="mx-auto max-w-7xl px-5 lg:px-8">{catalog.categories.map((category, index) => <CategorySection key={category.slug} category={category} index={index} items={catalog.products.filter((product) => product.category === category.slug)} />)}</div><section className="bg-secondary py-16"><div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-5 md:flex-row md:items-center md:justify-between lg:px-8"><div><h2 className="font-heading text-2xl font-extrabold text-navy md:text-3xl">Can&apos;t find what you need?</h2><p className="mt-2 max-w-xl text-muted-foreground">Send us your design, sample or idea. Our ODM team will develop a custom dog toy for your brand.</p></div><a href="/#contact" className="inline-flex shrink-0 items-center rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-primary/25">Request a Custom Quote</a></div></section></main><SiteFooter /></>
}
