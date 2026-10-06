import { NextResponse } from 'next/server'
import { isAdmin, requireSameOrigin } from '@/lib/admin-auth'
import { CatalogConflictError, deleteProduct, NotFoundError, StorageUnavailableError, updateProduct } from '@/lib/catalog-store'
import { ProductValidationError } from '@/lib/catalog'

export const dynamic = 'force-dynamic'

type Context = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Context) {
  if (!requireSameOrigin(request)) return NextResponse.json({ error: 'Cross-site product changes are not allowed.' }, { status: 403 })
  if (!(await isAdmin())) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  try {
    const body = await request.json()
    const { id } = await params
    const catalog = await updateProduct(id, Number(body.expectedRevision), body.product)
    return NextResponse.json({ catalog }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    if (error instanceof ProductValidationError) return NextResponse.json({ error: error.message, fields: error.fields }, { status: 422 })
    if (error instanceof CatalogConflictError) return NextResponse.json({ error: error.message }, { status: 409 })
    if (error instanceof NotFoundError) return NextResponse.json({ error: error.message }, { status: 404 })
    if (error instanceof StorageUnavailableError) return NextResponse.json({ error: error.message }, { status: 503 })
    return NextResponse.json({ error: 'Unable to update the product.' }, { status: 400 })
  }
}

export async function DELETE(request: Request, { params }: Context) {
  if (!requireSameOrigin(request)) return NextResponse.json({ error: 'Cross-site product changes are not allowed.' }, { status: 403 })
  if (!(await isAdmin())) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  try {
    const { expectedRevision } = await request.json()
    const { id } = await params
    const catalog = await deleteProduct(id, Number(expectedRevision))
    return NextResponse.json({ catalog }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    if (error instanceof CatalogConflictError) return NextResponse.json({ error: error.message }, { status: 409 })
    if (error instanceof NotFoundError) return NextResponse.json({ error: error.message }, { status: 404 })
    if (error instanceof StorageUnavailableError) return NextResponse.json({ error: error.message }, { status: 503 })
    return NextResponse.json({ error: 'Unable to delete the product.' }, { status: 400 })
  }
}
