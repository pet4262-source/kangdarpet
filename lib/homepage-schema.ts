import type { HomepageCategory, HomepageContent } from '@/lib/homepage-types'

const MAX_TEXT_LENGTH = 10_000
const MAX_ITEMS = 24

export class HomepageValidationError extends Error {
  constructor(public readonly fields: Record<string, string>) {
    super('Homepage content is invalid.')
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function fail(field: string, message: string): never {
  throw new HomepageValidationError({ [field]: message })
}

function object(value: unknown, field: string) {
  if (!isRecord(value)) fail(field, 'This section is required.')
  return value
}

function text(value: unknown, field: string, options: { required?: boolean } = {}) {
  if (typeof value !== 'string') fail(field, 'Must be text.')
  const normalized = value.trim()
  if (options.required && !normalized) fail(field, 'Is required.')
  if (normalized.length > MAX_TEXT_LENGTH) fail(field, `Must be ${MAX_TEXT_LENGTH} characters or fewer.`)
  return normalized
}

function mediaUrl(value: unknown, field: string, allowEmpty = false) {
  const normalized = text(value, field, { required: !allowEmpty })
  if (!normalized && allowEmpty) return ''
  if (normalized.startsWith('/') && !normalized.startsWith('//')) return normalized
  try {
    const url = new URL(normalized)
    if (url.protocol === 'http:' || url.protocol === 'https:') return url.toString()
  } catch {
    // Validation error below.
  }
  fail(field, 'Must be an absolute HTTP(S) URL or a site-relative path.')
}

function href(value: unknown, field: string) {
  const normalized = text(value, field)
  if (!normalized) return ''
  try {
    const url = new URL(normalized)
    if (url.protocol === 'http:' || url.protocol === 'https:' || url.protocol === 'mailto:') return url.toString()
  } catch {
    // Validation error below.
  }
  fail(field, 'Must be an HTTP(S) or mailto URL.')
}

function list(value: unknown, field: string, min = 0) {
  if (!Array.isArray(value) || value.length < min || value.length > MAX_ITEMS) {
    fail(field, `Must contain between ${min} and ${MAX_ITEMS} items.`)
  }
  return value
}

function uniqueMedia(items: string[]) {
  return [...new Set(items)]
}

function category(value: unknown, field: string): HomepageCategory {
  const raw = object(value, field)
  const image = mediaUrl(raw.image, `${field}.image`)
  const sourceImages = raw.images === undefined ? [image] : list(raw.images, `${field}.images`, 1).map((item, index) => mediaUrl(item, `${field}.images.${index}`))
  const images = uniqueMedia([image, ...sourceImages])
  return {
    slug: text(raw.slug, `${field}.slug`, { required: true }),
    name: text(raw.name, `${field}.name`, { required: true }),
    text: text(raw.text, `${field}.text`, { required: true }),
    image,
    images,
    video: mediaUrl(raw.video ?? '', `${field}.video`, true),
  }
}

/**
 * Produces a safe, homepage-only document. Unknown legacy keys (including
 * `catalog`) are deliberately not returned, so CMS saves cannot fork the B2B
 * catalog maintained by lib/catalog-store.ts.
 */
export function validateHomepageContent(value: unknown): HomepageContent {
  const raw = object(value, 'homepage')
  const hero = object(raw.hero, 'hero')
  const why = object(raw.why, 'why')
  const products = object(raw.products, 'products')
  const oem = object(raw.oem, 'oem')
  const factory = object(raw.factory, 'factory')
  const about = object(raw.about, 'about')
  const testimonials = object(raw.testimonials, 'testimonials')
  const contact = object(raw.contact, 'contact')

  const categoryItems = list(products.items, 'products.items', 1).map((item, index) => category(item, `products.items.${index}`))
  const slugs = new Set<string>()
  for (const item of categoryItems) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.slug)) fail('products.items', 'Category slugs must be lowercase URL slugs.')
    if (slugs.has(item.slug)) fail('products.items', 'Category slugs must be unique.')
    slugs.add(item.slug)
  }

  return {
    hero: {
      eyebrow: text(hero.eyebrow, 'hero.eyebrow'),
      title: text(hero.title, 'hero.title', { required: true }),
      subtitle: text(hero.subtitle, 'hero.subtitle'),
      primaryCta: text(hero.primaryCta, 'hero.primaryCta'),
      secondaryCta: text(hero.secondaryCta, 'hero.secondaryCta'),
      image: mediaUrl(hero.image, 'hero.image'),
    },
    why: {
      eyebrow: text(why.eyebrow, 'why.eyebrow'),
      title: text(why.title, 'why.title', { required: true }),
      description: text(why.description, 'why.description'),
      items: list(why.items, 'why.items', 1).map((item, index) => {
        const reason = object(item, `why.items.${index}`)
        return { title: text(reason.title, `why.items.${index}.title`, { required: true }), text: text(reason.text, `why.items.${index}.text`, { required: true }) }
      }),
    },
    products: {
      eyebrow: text(products.eyebrow, 'products.eyebrow'),
      title: text(products.title, 'products.title', { required: true }),
      description: text(products.description, 'products.description'),
      items: categoryItems,
    },
    oem: {
      eyebrow: text(oem.eyebrow, 'oem.eyebrow'),
      title: text(oem.title, 'oem.title', { required: true }),
      description: text(oem.description, 'oem.description'),
      image: mediaUrl(oem.image, 'oem.image'),
      statValue: text(oem.statValue, 'oem.statValue'),
      statLabel: text(oem.statLabel, 'oem.statLabel'),
      cta: text(oem.cta, 'oem.cta'),
      services: list(oem.services, 'oem.services', 1).map((item, index) => {
        const service = object(item, `oem.services.${index}`)
        return { title: text(service.title, `oem.services.${index}.title`, { required: true }), text: text(service.text, `oem.services.${index}.text`, { required: true }) }
      }),
    },
    factory: {
      eyebrow: text(factory.eyebrow, 'factory.eyebrow'),
      title: text(factory.title, 'factory.title', { required: true }),
      description: text(factory.description, 'factory.description'),
      image: mediaUrl(factory.image, 'factory.image'),
      stats: list(factory.stats, 'factory.stats', 1).map((item, index) => {
        const stat = object(item, `factory.stats.${index}`)
        return { value: text(stat.value, `factory.stats.${index}.value`, { required: true }), label: text(stat.label, `factory.stats.${index}.label`, { required: true }) }
      }),
    },
    about: {
      eyebrow: text(about.eyebrow, 'about.eyebrow'),
      title: text(about.title, 'about.title', { required: true }),
      description: text(about.description, 'about.description'),
      image: mediaUrl(about.image, 'about.image'),
      cta: text(about.cta, 'about.cta'),
      highlights: list(about.highlights, 'about.highlights', 1).map((item, index) => text(item, `about.highlights.${index}`, { required: true })),
    },
    testimonials: {
      eyebrow: text(testimonials.eyebrow, 'testimonials.eyebrow'),
      title: text(testimonials.title, 'testimonials.title', { required: true }),
      items: list(testimonials.items, 'testimonials.items', 1).map((item, index) => {
        const testimonial = object(item, `testimonials.items.${index}`)
        return {
          quote: text(testimonial.quote, `testimonials.items.${index}.quote`, { required: true }),
          name: text(testimonial.name, `testimonials.items.${index}.name`, { required: true }),
          role: text(testimonial.role, `testimonials.items.${index}.role`, { required: true }),
        }
      }),
    },
    contact: {
      eyebrow: text(contact.eyebrow, 'contact.eyebrow'),
      title: text(contact.title, 'contact.title', { required: true }),
      description: text(contact.description, 'contact.description'),
      email: text(contact.email, 'contact.email', { required: true }),
      whatsapp: text(contact.whatsapp, 'contact.whatsapp'),
      whatsappLink: href(contact.whatsappLink, 'contact.whatsappLink'),
      address: text(contact.address, 'contact.address'),
    },
  }
}
