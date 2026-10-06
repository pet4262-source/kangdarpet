import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

const blob = vi.hoisted(() => ({
  del: vi.fn(),
  list: vi.fn(),
  put: vi.fn(),
}))

vi.mock('@vercel/blob', () => blob)
vi.mock('@/lib/catalog-store', () => ({
  readCatalog: vi.fn(async () => ({
    catalog: { products: [{ slug: 'test-product', status: 'published', name: 'Test Product' }] },
  })),
}))

import { createInquiry, InquiryRateLimitError, listInquiries } from '@/lib/inquiry-store'

const testKey = Buffer.alloc(32, 7).toString('base64url')

function validInquiry() {
  return {
    productSlug: 'test-product',
    name: 'Test Buyer',
    email: 'buyer@example.test',
    message: 'We need a wholesale quote for this product.',
    startedAt: Date.now() - 3_000,
  }
}

beforeEach(() => {
  process.env.BLOB_READ_WRITE_TOKEN = 'test-blob-token'
  process.env.INQUIRY_ENCRYPTION_KEY = testKey
  blob.del.mockReset()
  blob.list.mockReset()
  blob.put.mockReset()
})

afterEach(() => {
  // These test-only values are not copied from the environment and are never persisted.
  delete process.env.BLOB_READ_WRITE_TOKEN
  delete process.env.INQUIRY_ENCRYPTION_KEY
})

describe('inquiry storage security', () => {
  it('reports unavailable rather than silently returning an empty list without the independent key', async () => {
    delete process.env.INQUIRY_ENCRYPTION_KEY
    const result = await listInquiries()
    expect(result).toMatchObject({ inquiries: [], readOnly: true, error: 'Inquiry encryption is not configured.' })
    expect(blob.list).not.toHaveBeenCalled()
  })

  it('releases its unique rate-limit slot when the inquiry record write fails', async () => {
    blob.put.mockImplementation(async (pathname: string) => {
      if (pathname.includes('/rate-limits/')) return { url: 'https://blob.example.test/rate-limit.lock' }
      throw new Error('record write failed')
    })
    blob.del.mockResolvedValue(undefined)

    await expect(createInquiry(validInquiry(), 'fingerprint')).rejects.toThrow('record write failed')
    expect(blob.del).toHaveBeenCalledWith('https://blob.example.test/rate-limit.lock')
  })

  it('uses three unique persistent slots per fingerprint and rejects the fourth submission', async () => {
    const paths = new Set<string>()
    blob.put.mockImplementation(async (pathname: string) => {
      if (pathname.includes('/rate-limits/')) {
        if (paths.has(pathname)) throw new Error('already exists')
        paths.add(pathname)
        return { url: `https://blob.example.test/${paths.size}.lock` }
      }
      return { url: 'https://blob.example.test/inquiry.json' }
    })

    await createInquiry(validInquiry(), 'fingerprint')
    await createInquiry(validInquiry(), 'fingerprint')
    await createInquiry(validInquiry(), 'fingerprint')
    await expect(createInquiry(validInquiry(), 'fingerprint')).rejects.toBeInstanceOf(InquiryRateLimitError)
  })
})
