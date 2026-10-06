import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import { isAdmin, requireSameOrigin } from '@/lib/admin-auth'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_BYTES = 6 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif']
const DATA_ROOT = process.env.VERCEL_ENV === 'production' ? 'kangdarpet' : 'kangdarpet/preview'
const PRODUCT_IMAGE_PREFIX = `${DATA_ROOT}/product-images/`
const HOMEPAGE_IMAGE_PREFIX = `${DATA_ROOT}/homepage-images/`
const UUID = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
const IMAGE_PATH = new RegExp(`^${DATA_ROOT}/(?:product-images|homepage-images)/${UUID}\\.(jpg|png|webp|avif)$`)

export async function GET(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  const kind = new URL(request.url).searchParams.get('kind')
  if (kind && kind !== 'homepage') return NextResponse.json({ error: 'Invalid image kind.' }, { status: 400 })
  return NextResponse.json(
    { prefix: kind === 'homepage' ? HOMEPAGE_IMAGE_PREFIX : PRODUCT_IMAGE_PREFIX },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'Upload storage is not configured.' }, { status: 503 })
  }
  try {
    const body = (await request.json()) as HandleUploadBody
    // Completion callbacks are signed and verified by handleUpload below. They
    // do not originate in a browser and therefore legitimately have no Origin.
    if (body.type === 'blob.generate-client-token') {
      if (!requireSameOrigin(request)) return NextResponse.json({ error: 'Cross-site upload token requests are not allowed.' }, { status: 403 })
      if (!(await isAdmin())) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }
    const response = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        if (!requireSameOrigin(request)) throw new Error('Cross-site upload token requests are not allowed.')
        if (!(await isAdmin())) throw new Error('Authentication required.')
        if (!IMAGE_PATH.test(pathname)) throw new Error('Invalid image path.')
        return {
          allowedContentTypes: ALLOWED_TYPES,
          maximumSizeInBytes: MAX_BYTES,
          addRandomSuffix: false,
          cacheControlMaxAge: 31536000,
          validUntil: Date.now() + 5 * 60 * 1000,
        }
      },
      // The SDK authenticates the completion webhook; product data is saved separately.
      onUploadCompleted: async () => {},
    })
    return NextResponse.json(response)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to upload image.' }, { status: 400 })
  }
}
