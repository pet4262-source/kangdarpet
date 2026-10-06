import { NextResponse } from 'next/server'
import { clearAdminSession, requireSameOrigin } from '@/lib/admin-auth'

export async function POST(request: Request) {
  if (!requireSameOrigin(request)) return NextResponse.json({ error: 'Cross-site logout requests are not allowed.' }, { status: 403 })
  await clearAdminSession()
  return NextResponse.json({ ok: true })
}
