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

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <WhyChooseUs />
        <ProductCategories />
        <OemOdm />
        <FactorySection />
        <AboutSection />
        <Testimonials />
        <ContactSection />
      </main>
      <SiteFooter />
    </>
  )
}
