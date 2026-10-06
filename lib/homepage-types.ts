export type HomepageHero = {
  eyebrow: string
  title: string
  subtitle: string
  primaryCta: string
  secondaryCta: string
  image: string
}

export type HomepageWhy = {
  eyebrow: string
  title: string
  description: string
  items: { title: string; text: string }[]
}

export type HomepageCategory = {
  slug: string
  name: string
  text: string
  image: string
  images: string[]
  video: string
}

export type HomepageProducts = {
  eyebrow: string
  title: string
  description: string
  items: HomepageCategory[]
}

export type HomepageOem = {
  eyebrow: string
  title: string
  description: string
  image: string
  statValue: string
  statLabel: string
  cta: string
  services: { title: string; text: string }[]
}

export type HomepageFactory = {
  eyebrow: string
  title: string
  description: string
  image: string
  stats: { value: string; label: string }[]
}

export type HomepageAbout = {
  eyebrow: string
  title: string
  description: string
  image: string
  cta: string
  highlights: string[]
}

export type HomepageTestimonials = {
  eyebrow: string
  title: string
  items: { quote: string; name: string; role: string }[]
}

export type HomepageContact = {
  eyebrow: string
  title: string
  description: string
  email: string
  whatsapp: string
  whatsappLink: string
  address: string
}

/** Homepage-only content. Product catalog records are intentionally excluded. */
export type HomepageContent = {
  hero: HomepageHero
  why: HomepageWhy
  products: HomepageProducts
  oem: HomepageOem
  factory: HomepageFactory
  about: HomepageAbout
  testimonials: HomepageTestimonials
  contact: HomepageContact
}
