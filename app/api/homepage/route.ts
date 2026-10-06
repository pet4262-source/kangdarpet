import { NextResponse } from 'next/server'
import { isAdmin, requireSameOrigin } from '@/lib/admin-auth'
import { HomepageStorageUnavailableError, readHomepageContent, writeHomepageContent } from '@/lib/homepage'
import { HomepageValidationError } from '@/lib/homepage-schema'

export const dynamic = 'force-dynamic'

const noStore = { 'Cache-Control': 'no-store' }

/** Public, cache-bypassed homepage content for the storefront and previews. */
export async function GET() {
  return NextResponse.json(await readHomepageContent(), { headers: noStore })
}

/** Homepage content is admin-only; product catalog data is not accepted or saved here. */
export async function PUT(request: Request) {
  if (!requireSameOrigin(request)) return NextResponse.json({ error: 'Cross-site homepage changes are not allowed.' }, { status: 403, headers: noStore })
  if (!(await isAdmin())) return NextResponse.json({ error: 'Authentication required.' }, { status: 401, headers: noStore })

  try {
    const content = await writeHomepageContent(await request.json())
    return NextResponse.json({ ok: true, content }, { headers: noStore })
  } catch (error) {
    if (error instanceof HomepageValidationError) {
      return NextResponse.json({ error: error.message, fields: error.fields }, { status: 422, headers: noStore })
    }
    if (error instanceof HomepageStorageUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 503, headers: noStore })
    }
    return NextResponse.json({ error: 'Unable to save homepage content.' }, { status: 400, headers: noStore })
  }
}
