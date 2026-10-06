import type { Metadata } from 'next'
import { SiteHeader } from '@/components/site-header'
import { Hero } from '@/components/hero'
import { WhyChooseUs } from '@/components/why-choose-us'
import { ProductCategories } from '@/components/product-categories'
import { OemOdm } from '@/components/oem-odm'
import { FactorySection } from '@/components/factory-section'
import { AboutSection } from '@/components/about-section'
import { Testimonials } from '@/components/testimonials'
import { ContactSection } from '@/components/contact-section'
import { SiteFooter } from '@/components/site-footer'
import { readHomepageContent } from '@/lib/homepage'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  alternates: { canonical: '/' },
  openGraph: {
    url: '/',
    title: 'KANGDARPET | Premium Dog Toys Manufacturer in China',
    description: 'OEM & ODM Dog Toy Solutions for Global Brands.',
    type: 'website',
    siteName: 'KANGDARPET',
    images: ['/images/hero.png'],
  },
}

export default async function Home() {
  const content = await readHomepageContent()
  return (
    <>
      <SiteHeader />
      <main>
        <Hero content={content.hero} />
        <WhyChooseUs content={content.why} />
        <ProductCategories content={content.products} />
        <OemOdm content={content.oem} />
        <FactorySection content={content.factory} />
        <AboutSection content={content.about} />
        <Testimonials content={content.testimonials} />
        <ContactSection content={content.contact} />
      </main>
      <SiteFooter />
    </>
  )
}
