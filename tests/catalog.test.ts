import { describe, expect, it } from 'vitest'
import { coverImage, createSeedCatalog, ProductValidationError, validateProductInput } from '@/lib/catalog'

describe('catalog seed migration', () => {
  it('preserves the 48 supplied products as published records with IDs and unique SKU/slug values', () => {
    const catalog = createSeedCatalog()
    expect(catalog.products).toHaveLength(48)
    expect(catalog.categories).toHaveLength(6)
    expect(catalog.products.every((product) => product.status === 'published' && product.id && product.slug && product.sku)).toBe(true)
    expect(new Set(catalog.products.map((product) => product.slug)).size).toBe(48)
    expect(new Set(catalog.products.map((product) => product.sku)).size).toBe(48)
  })

  it('normalizes a valid product and uses its configured cover image', () => {
    const catalog = createSeedCatalog()
    const input = validateProductInput({ name: 'New Rope Ball', slug: 'New Rope Ball', sku: 'kdp-new-1', category: 'rope', description: 'A durable rope ball for wholesale dog toy buyers.', moq: '100', status: 'draft', material: 'Cotton', size: '8 cm', images: [{ url: 'https://example.test/a.webp' }], coverIndex: 0, specifications: [{ name: 'Color', options: ['Blue', 'Green'] }], attributes: [{ name: 'Packaging', value: 'Hang tag' }] }, catalog.categories)
    expect(input).toMatchObject({ slug: 'new-rope-ball', sku: 'KDP-NEW-1', moq: 100, status: 'draft' })
    expect(coverImage({ ...input, id: 'test', createdAt: '', updatedAt: '' })).toBe('https://example.test/a.webp')
  })

  it('rejects invalid SKU, MOQ, category, and thin descriptions', () => {
    const catalog = createSeedCatalog()
    try {
      validateProductInput({ name: 'A', slug: 'Bad Slug!', sku: 'x', category: 'not-real', description: 'short', moq: 0, status: 'published' }, catalog.categories)
      throw new Error('Expected validation to throw')
    } catch (error) {
      expect(error).toBeInstanceOf(ProductValidationError)
      expect((error as ProductValidationError).fields).toMatchObject({ name: expect.any(String), sku: expect.any(String), category: expect.any(String), description: expect.any(String), moq: expect.any(String) })
    }
  })
})
