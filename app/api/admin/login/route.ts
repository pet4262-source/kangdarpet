import { NextResponse } from 'next/server'
import { createAdminSession, requireSameOrigin, verifyAdminPassword } from '@/lib/admin-auth'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  if (!requireSameOrigin(request)) return NextResponse.json({ error: 'Cross-site login requests are not allowed.' }, { status: 403 })
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Administrator login is not configured.' }, { status: 503 })
  }
  try {
    const { password } = await request.json()
    if (!verifyAdminPassword(password)) {
      return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })
    }
    await createAdminSession()
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Unable to process the login request.' }, { status: 400 })
  }
}
