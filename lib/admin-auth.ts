import 'server-only'

import { createHmac, createHash, timingSafeEqual } from 'node:crypto'
import { cookies, headers } from 'next/headers'

const COOKIE_NAME = 'kangdarpet_admin_session'
const SESSION_MS = 12 * 60 * 60 * 1000

type SessionPayload = { role: 'admin'; exp: number; nonce: string }

function base64url(value: string) {
  return Buffer.from(value).toString('base64url')
}

function sign(payload: string) {
  const secret = process.env.ADMIN_PASSWORD
  if (!secret) return ''
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

function safeEqual(left: string, right: string) {
  const leftHash = createHash('sha256').update(left).digest()
  const rightHash = createHash('sha256').update(right).digest()
  return timingSafeEqual(leftHash, rightHash)
}

function firstForwardedValue(value: string | null) {
  return value?.split(',')[0]?.trim() || null
}

function expectedRequestOrigin(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const protocol = firstForwardedValue(request.headers.get('x-forwarded-proto')) || requestUrl.protocol.replace(/:$/, '')
    const host = firstForwardedValue(request.headers.get('x-forwarded-host')) || request.headers.get('host') || requestUrl.host
    if (!host || (protocol !== 'http' && protocol !== 'https')) return null
    const expected = new URL(`${protocol}://${host}`)
    return expected.username || expected.password || expected.pathname !== '/' || expected.search || expected.hash ? null : expected.origin
  } catch {
    return null
  }
}

/**
 * Rejects missing, cross-site, and malformed Origin headers before a browser
 * request can change administrator state. This intentionally applies even to
 * CORS-simple requests such as cross-site text/plain POSTs.
 */
export function requireSameOrigin(request: Request) {
  const origin = request.headers.get('origin')
  const expected = expectedRequestOrigin(request)
  if (!origin || !expected) return false
  try {
    const parsed = new URL(origin)
    return parsed.origin === origin && parsed.origin === expected && !parsed.username && !parsed.password && !parsed.pathname.replace('/', '') && !parsed.search && !parsed.hash
  } catch {
    return false
  }
}

export function verifyAdminPassword(password: unknown) {
  const expected = process.env.ADMIN_PASSWORD
  if (typeof password !== 'string' || !expected) return false
  return safeEqual(password, expected)
}

function decodeSession(value: string | undefined): SessionPayload | null {
  if (!value || !process.env.ADMIN_PASSWORD) return null
  const [encoded, signature] = value.split('.')
  if (!encoded || !signature || !safeEqual(signature, sign(encoded))) return null
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SessionPayload
    return payload.role === 'admin' && Number.isFinite(payload.exp) && payload.exp > Date.now() ? payload : null
  } catch {
    return null
  }
}

async function cookieOptions() {
  const requestHeaders = await headers()
  const secure = process.env.NODE_ENV === 'production' || requestHeaders.get('x-forwarded-proto') === 'https'
  return {
    httpOnly: true,
    secure,
    sameSite: (secure ? 'none' : 'lax') as 'none' | 'lax',
    path: '/',
    maxAge: Math.floor(SESSION_MS / 1000),
  }
}

export async function createAdminSession() {
  const payload: SessionPayload = { role: 'admin', exp: Date.now() + SESSION_MS, nonce: crypto.randomUUID() }
  const encoded = base64url(JSON.stringify(payload))
  ;(await cookies()).set(COOKIE_NAME, `${encoded}.${sign(encoded)}`, await cookieOptions())
}

export async function clearAdminSession() {
  const options = await cookieOptions()
  ;(await cookies()).set(COOKIE_NAME, '', { ...options, maxAge: 0 })
}

export async function isAdmin() {
  return Boolean(decodeSession((await cookies()).get(COOKIE_NAME)?.value))
}

export async function requireAdminPage() {
  const { redirect } = await import('next/navigation')
  if (!(await isAdmin())) redirect('/admin/login')
}
