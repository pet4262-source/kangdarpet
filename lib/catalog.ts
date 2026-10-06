import baseline from '@/data/homepage-baseline.json'

export type ProductStatus = 'draft' | 'published'

export type CatalogCategory = {
  slug: string
  name: string
  description: string
  image?: string
}

export type ProductImage = {
  url: string
  alt?: string
}

export type ProductSpecification = {
  name: string
  options: string[]
}

export type ProductAttribute = {
  name: string
  value: string
}

export type Product = {
  id: string
  slug: string
  sku: string
  name: string
  category: string
  description: string
  status: ProductStatus
  moq: number
  material: string
  size: string
  images: ProductImage[]
  coverIndex: number
  specifications: ProductSpecification[]
  attributes: ProductAttribute[]
  video?: string
  createdAt: string
  updatedAt: string
}

export type CatalogDocument = {
  schemaVersion: 1
  revision: number
  updatedAt: string
  categories: CatalogCategory[]
  products: Product[]
}

export type ProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>

export class ProductValidationError extends Error {
  constructor(public readonly fields: Record<string, string>) {
    super('Please correct the highlighted product fields.')
  }
}

const productSeed = baseline.catalog.items
const categorySeed = baseline.products.items

function cleanText(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96)
}

function normalizeImages(value: unknown): ProductImage[] {
  if (!Array.isArray(value)) return []
  return value
    .map((image) => {
      if (typeof image === 'string') return { url: image.trim() }
      if (image && typeof image === 'object' && 'url' in image) {
        const record = image as { url?: unknown; alt?: unknown }
        return { url: cleanText(record.url, 2048), alt: cleanText(record.alt, 160) || undefined }
      }
      return null
    })
    .filter((image): image is ProductImage => Boolean(image?.url))
    .slice(0, 12)
}

function normalizePairs(value: unknown, kind: 'attribute' | 'specification') {
  if (!Array.isArray(value)) return []
  if (kind === 'attribute') {
    return value
      .map((pair) => {
        const item = pair as { name?: unknown; value?: unknown }
        return { name: cleanText(item?.name, 80), value: cleanText(item?.value, 300) }
      })
      .filter((pair) => pair.name && pair.value)
      .slice(0, 20)
  }
  return value
    .map((spec) => {
      const item = spec as { name?: unknown; options?: unknown }
      const options = Array.isArray(item?.options)
        ? item.options.map((option) => cleanText(option, 80)).filter(Boolean).slice(0, 20)
        : []
      return { name: cleanText(item?.name, 80), options }
    })
    .filter((spec) => spec.name && spec.options.length)
    .slice(0, 12)
}

export function createSeedCatalog(): CatalogDocument {
  const createdAt = '2026-01-01T00:00:00.000Z'
  return {
    schemaVersion: 1,
    revision: 0,
    updatedAt: createdAt,
    categories: categorySeed.map((category) => ({
      slug: category.slug,
      name: category.name,
      description: category.text,
      image: category.image,
    })),
    products: productSeed.map((item, index) => ({
      id: `seed-${String(index + 1).padStart(3, '0')}`,
      slug: item.slug,
      sku: item.sku || `KDP-${String(index + 1).padStart(4, '0')}`,
      name: item.name,
      category: item.category,
      description: item.description,
      status: 'published',
      moq: Number(item.moq) || 1,
      material: item.material || '',
      size: item.size || '',
      images: normalizeImages(item.images),
      coverIndex: 0,
      specifications: [],
      attributes: normalizePairs(item.attributes, 'attribute') as ProductAttribute[],
      video: item.video || undefined,
      createdAt,
      updatedAt: createdAt,
    })),
  }
}

export function coverImage(product: Product) {
  return product.images[product.coverIndex]?.url || product.images[0]?.url || '/product-placeholder.svg'
}

function safeImageUrl(value: string) {
  if (value.startsWith('/') && !value.startsWith('//') && !value.includes('\\')) return true
  try {
    const url = new URL(value)
    return url.protocol === 'https:'
  } catch {
    return false
  }
}

export function validateProductInput(raw: unknown, categories: CatalogCategory[]): ProductInput {
  const item = (raw ?? {}) as Record<string, unknown>
  const name = cleanText(item.name, 160)
  const slug = slugify(cleanText(item.slug, 160) || name)
  const sku = cleanText(item.sku, 80).toUpperCase()
  const category = cleanText(item.category, 80)
  const description = cleanText(item.description, 4000)
  const material = cleanText(item.material, 300)
  const size = cleanText(item.size, 200)
  const moq = Number(item.moq)
  const status = item.status === 'draft' ? 'draft' : item.status === 'published' ? 'published' : null
  const images = normalizeImages(item.images)
  const coverIndex = Math.max(0, Math.min(Number(item.coverIndex) || 0, Math.max(images.length - 1, 0)))
  const specifications = normalizePairs(item.specifications, 'specification') as ProductSpecification[]
  const attributes = normalizePairs(item.attributes, 'attribute') as ProductAttribute[]
  const video = cleanText(item.video, 2048) || undefined
  const fields: Record<string, string> = {}

  if (name.length < 2) fields.name = 'Enter a product name of at least 2 characters.'
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) fields.slug = 'Use lowercase letters, numbers and hyphens only.'
  if (!/^[A-Z0-9][A-Z0-9_-]{1,79}$/.test(sku)) fields.sku = 'SKU must use 2–80 uppercase letters, numbers, hyphens or underscores.'
  if (!categories.some((entry) => entry.slug === category)) fields.category = 'Select a valid catalog category.'
  if (description.length < 10) fields.description = 'Describe the product in at least 10 characters.'
  if (!Number.isInteger(moq) || moq < 1 || moq > 10_000_000) fields.moq = 'MOQ must be a whole number between 1 and 10,000,000.'
  if (!status) fields.status = 'Choose Draft or Published.'
  if (Array.isArray(item.images) && item.images.length > 12) fields.images = 'A product supports up to 12 images.'
  if (status === 'published' && images.length === 0) fields.images = 'Upload at least one image before publishing.'
  if (images.some((image) => !safeImageUrl(image.url))) fields.images = 'Use an HTTPS image URL or a site-relative image path.'
  if (video && !/^https?:\/\//i.test(video)) fields.video = 'Video must be a full http(s) URL.'
  if (Object.keys(fields).length) throw new ProductValidationError(fields)

  return { slug, sku, name, category, description, material, size, moq, status: status as ProductStatus, images, coverIndex, specifications, attributes, video }
}

export function isCatalogDocument(value: unknown): value is CatalogDocument {
  const catalog = value as Partial<CatalogDocument>
  return Boolean(
    catalog &&
      catalog.schemaVersion === 1 &&
      typeof catalog.revision === 'number' &&
      Array.isArray(catalog.categories) &&
      Array.isArray(catalog.products),
  )
}
