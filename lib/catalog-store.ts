import 'server-only'

import { del, list, put } from '@vercel/blob'
import { randomUUID } from 'node:crypto'
import {
  createSeedCatalog,
  isCatalogDocument,
  type CatalogDocument,
  type Product,
  type ProductInput,
  ProductValidationError,
  validateProductInput,
} from '@/lib/catalog'

const DATA_ROOT = process.env.VERCEL_ENV === 'production' ? 'kangdarpet' : 'kangdarpet/preview'
const CATALOG_PREFIX = `${DATA_ROOT}/catalog/versions/`
const LOCK_PREFIX = `${DATA_ROOT}/catalog/locks/`
const MAX_LIST_PAGES = 20

export class StorageUnavailableError extends Error {}
export class CatalogConflictError extends Error {}
export class NotFoundError extends Error {}

export type CatalogRead = { catalog: CatalogDocument; source: 'blob' | 'seed'; readOnly: boolean }

function hasBlobToken() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

async function allBlobs(prefix: string) {
  const blobs: Awaited<ReturnType<typeof list>>['blobs'] = []
  let cursor: string | undefined
  for (let page = 0; page < MAX_LIST_PAGES; page += 1) {
    const result = await list({ prefix, cursor })
    blobs.push(...result.blobs)
    if (!result.hasMore || !result.cursor) break
    if (page === MAX_LIST_PAGES - 1) {
      throw new StorageUnavailableError('Catalog version history exceeds the safe listing limit.')
    }
    cursor = result.cursor
  }
  return blobs
}

async function latestDocument(): Promise<{ catalog: CatalogDocument; pathname: string } | null> {
  const candidates = (await allBlobs(CATALOG_PREFIX))
    .filter((blob) => blob.pathname.endsWith('.json'))
    .sort((left, right) => right.pathname.localeCompare(left.pathname))
  const candidate = candidates[0]
  if (!candidate) return null
  const response = await fetch(candidate.url, { cache: 'no-store' })
  if (!response.ok) throw new StorageUnavailableError('Latest catalog version is unavailable.')
  const payload: unknown = await response.json()
  if (!isCatalogDocument(payload)) throw new StorageUnavailableError('Latest catalog version is invalid.')
  return { catalog: payload, pathname: candidate.pathname }
}

export async function readCatalog(): Promise<CatalogRead> {
  if (!hasBlobToken()) {
    const seed = createSeedCatalog()
    return {
      catalog: process.env.VERCEL_ENV === 'production' ? { ...seed, products: [] } : seed,
      source: 'seed',
      readOnly: true,
    }
  }
  try {
    const latest = await latestDocument()
    return latest
      ? { catalog: latest.catalog, source: 'blob', readOnly: false }
      : { catalog: createSeedCatalog(), source: 'seed', readOnly: false }
  } catch {
    // Do not resurrect products that an administrator may have moved to draft.
    // Without the store we cannot distinguish the original seed from newer publication status.
    return { catalog: { ...createSeedCatalog(), products: [] }, source: 'seed', readOnly: true }
  }
}

async function acquireRevisionLock(revision: number) {
  const pathname = `${LOCK_PREFIX}revision-${revision}.lock`
  try {
    await put(pathname, JSON.stringify({ revision, createdAt: new Date().toISOString() }), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json',
      allowOverwrite: false,
    })
    return pathname
  } catch {
    try {
      const existing = await list({ prefix: pathname })
      if (existing.blobs.some((blob) => blob.pathname === pathname)) {
        throw new CatalogConflictError('Another catalog update is in progress. Refresh and try again.')
      }
    } catch (error) {
      if (error instanceof CatalogConflictError) throw error
    }
    throw new StorageUnavailableError('Catalog storage is temporarily unavailable. Try again later.')
  }
}

async function persist(expectedRevision: number, mutate: (current: CatalogDocument) => CatalogDocument) {
  if (!hasBlobToken()) {
    throw new StorageUnavailableError('Persistent storage is not configured. The seed catalog is read-only.')
  }
  const lock = await acquireRevisionLock(expectedRevision)
  try {
    const currentRead = await readCatalog()
    if (currentRead.readOnly) throw new StorageUnavailableError('Catalog storage cannot be read safely. Try again later.')
    const current = currentRead.catalog
    if (current.revision !== expectedRevision) {
      throw new CatalogConflictError('This catalog changed in another session. Refresh before saving.')
    }
    const next = mutate(current)
    const saved: CatalogDocument = { ...next, schemaVersion: 1, revision: current.revision + 1, updatedAt: new Date().toISOString() }
    const pathname = `${CATALOG_PREFIX}${Date.now()}-r${String(saved.revision).padStart(12, '0')}-${randomUUID()}.json`
    await put(pathname, JSON.stringify(saved), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json; charset=utf-8',
      cacheControlMaxAge: 60,
    })
    return saved
  } finally {
    await del(lock).catch(() => undefined)
  }
}

function enforceUnique(product: ProductInput, products: Product[], exceptId?: string) {
  if (products.some((item) => item.id !== exceptId && item.slug === product.slug)) {
    throw new ProductValidationError({ slug: 'This URL slug is already used by another product.' })
  }
  if (products.some((item) => item.id !== exceptId && item.sku.toLowerCase() === product.sku.toLowerCase())) {
    throw new ProductValidationError({ sku: 'This SKU is already used by another product.' })
  }
}

export async function createProduct(expectedRevision: number, raw: unknown) {
  return persist(expectedRevision, (current) => {
    const product = validateProductInput(raw, current.categories)
    enforceUnique(product, current.products)
    const now = new Date().toISOString()
    const newProduct: Product = { ...product, id: randomUUID(), createdAt: now, updatedAt: now }
    return { ...current, products: [newProduct, ...current.products] }
  })
}

export async function updateProduct(id: string, expectedRevision: number, raw: unknown) {
  return persist(expectedRevision, (current) => {
    const index = current.products.findIndex((product) => product.id === id)
    if (index === -1) throw new NotFoundError('Product not found.')
    const input = validateProductInput(raw, current.categories)
    enforceUnique(input, current.products, id)
    const existing = current.products[index]
    const updated: Product = { ...existing, ...input, updatedAt: new Date().toISOString() }
    const products = [...current.products]
    products[index] = updated
    return { ...current, products }
  })
}

export async function deleteProduct(id: string, expectedRevision: number) {
  return persist(expectedRevision, (current) => {
    if (!current.products.some((product) => product.id === id)) throw new NotFoundError('Product not found.')
    return { ...current, products: current.products.filter((product) => product.id !== id) }
  })
}

export async function getPublishedCatalog() {
  const result = await readCatalog()
  if (result.readOnly && (hasBlobToken() || process.env.VERCEL_ENV === 'production')) {
    throw new StorageUnavailableError('Product catalog storage is temporarily unavailable.')
  }
  return { ...result, catalog: { ...result.catalog, products: result.catalog.products.filter((product) => product.status === 'published') } }
}
