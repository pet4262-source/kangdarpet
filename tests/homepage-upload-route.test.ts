import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const auth = vi.hoisted(() => ({
  isAdmin: vi.fn(),
  requireSameOrigin: vi.fn(),
}))
const blob = vi.hoisted(() => ({ handleUpload: vi.fn() }))

vi.mock('@/lib/admin-auth', () => auth)
vi.mock('@vercel/blob/client', () => blob)

const originalEnv = {
  VERCEL_ENV: process.env.VERCEL_ENV,
  BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN,
}

beforeEach(() => {
  vi.resetModules()
  auth.isAdmin.mockReset().mockResolvedValue(true)
  auth.requireSameOrigin.mockReset().mockReturnValue(true)
  blob.handleUpload.mockReset().mockImplementation(async (options: {
    body: { payload?: { pathname?: string } }
    onBeforeGenerateToken: (pathname: string) => Promise<unknown>
  }) => {
    const permission = await options.onBeforeGenerateToken(options.body.payload?.pathname ?? '')
    return { clientToken: 'mock-only-token', permission }
  })
  process.env.VERCEL_ENV = 'preview'
  process.env.BLOB_READ_WRITE_TOKEN = 'mock-only-blob-token'
})

afterEach(() => {
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) delete process.env[key as keyof typeof originalEnv]
    else process.env[key as keyof typeof originalEnv] = value
  }
})

function request(pathname: string) {
  return new Request('https://preview.example.test/api/admin/uploads', {
    method: 'POST',
    headers: { Origin: 'https://preview.example.test', 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'blob.generate-client-token', payload: { pathname } }),
  })
}

const uuid = '123e4567-e89b-42d3-a456-426614174000'

describe('authenticated homepage image uploads', () => {
  it('returns separate preview prefixes and preserves the existing product prefix', async () => {
    const { GET } = await import('@/app/api/admin/uploads/route')
    const homepage = await GET(new Request('https://preview.example.test/api/admin/uploads?kind=homepage'))
    const products = await GET(new Request('https://preview.example.test/api/admin/uploads'))
    expect((await homepage.json()).prefix).toBe('kangdarpet/preview/homepage-images/')
    expect((await products.json()).prefix).toBe('kangdarpet/preview/product-images/')
    expect(homepage.headers.get('Cache-Control')).toBe('no-store')
  })

  it('rejects unauthenticated prefix requests and unknown image kinds', async () => {
    const { GET } = await import('@/app/api/admin/uploads/route')
    auth.isAdmin.mockResolvedValueOnce(false)
    expect((await GET(new Request('https://preview.example.test/api/admin/uploads?kind=homepage'))).status).toBe(401)
    expect((await GET(new Request('https://preview.example.test/api/admin/uploads?kind=unknown'))).status).toBe(400)
  })

  it('authorizes only UUID image paths inside this environment and approved types', async () => {
    const { POST } = await import('@/app/api/admin/uploads/route')
    const homepage = await POST(request(`kangdarpet/preview/homepage-images/${uuid}.jpg`))
    const products = await POST(request(`kangdarpet/preview/product-images/${uuid}.webp`))
    expect(homepage.status).toBe(200)
    expect(products.status).toBe(200)
    const result = await homepage.json()
    expect(result.permission.maximumSizeInBytes).toBe(6 * 1024 * 1024)
    expect(result.permission.allowedContentTypes).toEqual(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
    expect((await POST(request(`kangdarpet/homepage-images/${uuid}.jpg`))).status).toBe(400)
    expect((await POST(request('kangdarpet/preview/homepage-images/../../secret.jpg'))).status).toBe(400)
  })

  it('keeps the token path behind admin and same-origin checks', async () => {
    const { POST } = await import('@/app/api/admin/uploads/route')
    auth.requireSameOrigin.mockReturnValueOnce(false)
    expect((await POST(request(`kangdarpet/preview/homepage-images/${uuid}.png`))).status).toBe(403)
    auth.isAdmin.mockResolvedValueOnce(false)
    expect((await POST(request(`kangdarpet/preview/homepage-images/${uuid}.png`))).status).toBe(401)
    expect(blob.handleUpload).not.toHaveBeenCalled()
  })

  it('uses production prefixes only when VERCEL_ENV is production', async () => {
    process.env.VERCEL_ENV = 'production'
    const { GET, POST } = await import('@/app/api/admin/uploads/route')
    const response = await GET(new Request('https://www.kangdarpet.com/api/admin/uploads?kind=homepage'))
    expect((await response.json()).prefix).toBe('kangdarpet/homepage-images/')
    expect((await POST(request(`kangdarpet/homepage-images/${uuid}.avif`))).status).toBe(200)
    expect((await POST(request(`kangdarpet/preview/homepage-images/${uuid}.avif`))).status).toBe(400)
  })
})
