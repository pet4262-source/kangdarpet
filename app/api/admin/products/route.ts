import { NextResponse } from 'next/server'
import { isAdmin, requireSameOrigin } from '@/lib/admin-auth'
import { CatalogConflictError, createProduct, StorageUnavailableError } from '@/lib/catalog-store'
import { ProductValidationError } from '@/lib/catalog'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  if (!requireSameOrigin(request)) return NextResponse.json({ error: 'Cross-site product changes are not allowed.' }, { status: 403 })
  if (!(await isAdmin())) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  try {
    const body = await request.json()
    const catalog = await createProduct(Number(body.expectedRevision), body.product)
    return NextResponse.json({ catalog }, { status: 201, headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    if (error instanceof ProductValidationError) return NextResponse.json({ error: error.message, fields: error.fields }, { status: 422 })
    if (error instanceof CatalogConflictError) return NextResponse.json({ error: error.message }, { status: 409 })
    if (error instanceof StorageUnavailableError) return NextResponse.json({ error: error.message }, { status: 503 })
    return NextResponse.json({ error: 'Unable to create the product.' }, { status: 400 })
  }
}
