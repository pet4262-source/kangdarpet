import { NextResponse } from 'next/server'
import { requireSameOrigin } from '@/lib/admin-auth'
import { createInquiry, fingerprintInquiryIp, InquiryRateLimitError, InquiryStorageUnavailableError, InquiryValidationError } from '@/lib/inquiry-store'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  // A same-site form always supplies Origin. Rejecting missing Origin also
  // blocks cross-site CORS-simple text/plain submissions before storage work.
  if (!requireSameOrigin(request)) return NextResponse.json({ error: 'Cross-site inquiry submissions are not allowed.' }, { status: 403 })
  try {
    const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const ipHash = fingerprintInquiryIp(forwarded)
    await createInquiry(await request.json(), ipHash)
    return NextResponse.json({ ok: true }, { status: 201, headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    if (error instanceof InquiryValidationError) return NextResponse.json({ error: error.message, fields: error.fields }, { status: 422 })
    if (error instanceof InquiryRateLimitError) return NextResponse.json({ error: error.message }, { status: 429, headers: { 'Cache-Control': 'no-store', 'Retry-After': '600' } })
    if (error instanceof InquiryStorageUnavailableError) return NextResponse.json({ error: 'Inquiry service is temporarily unavailable.' }, { status: 503 })
    return NextResponse.json({ error: 'We could not send your inquiry. Please try again later.' }, { status: 503 })
  }
}
