import { NextResponse } from 'next/server'
import { isAdmin } from '@/lib/admin-auth'
import { listInquiries } from '@/lib/inquiry-store'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
  const result = await listInquiries()
  return NextResponse.json(result, { status: result.readOnly ? 503 : 200, headers: { 'Cache-Control': 'no-store' } })
}
