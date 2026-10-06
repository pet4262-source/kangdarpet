import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'
import { readCatalog } from '@/lib/catalog-store'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  const result = await readCatalog()
  return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store, max-age=0' } })
}
