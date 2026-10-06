import { NextResponse } from 'next/server'
import { getPublishedCatalog, StorageUnavailableError } from '@/lib/catalog-store'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const result = await getPublishedCatalog()
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store, max-age=0' } })
  } catch (error) {
    if (error instanceof StorageUnavailableError) {
      return NextResponse.json({ error: error.message }, { status: 503, headers: { 'Cache-Control': 'no-store' } })
    }
    throw error
  }
}
