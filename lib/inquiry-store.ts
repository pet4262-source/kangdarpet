import 'server-only'

import { del, list, put } from '@vercel/blob'
import { createCipheriv, createDecipheriv, createHmac, randomBytes, randomUUID } from 'node:crypto'
import { readCatalog } from '@/lib/catalog-store'

const INQUIRY_PREFIX = process.env.VERCEL_ENV === 'production'
  ? 'kangdarpet/inquiries/records/'
  : 'kangdarpet/preview/inquiries/records/'
const INQUIRY_RATE_LIMIT_PREFIX = process.env.VERCEL_ENV === 'production'
  ? 'kangdarpet/inquiries/rate-limits/'
  : 'kangdarpet/preview/inquiries/rate-limits/'
const MAX_INQUIRIES = 500
const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000
const ENCRYPTION_VERSION = 1
const INQUIRY_KEY_ID = 'inquiry-aes-gcm-v1'

export type Inquiry = {
  id: string
  productSlug: string
  productName: string
  name: string
  email: string
  company?: string
  phone?: string
  country?: string
  message: string
  createdAt: string
  ipHash?: string
}

export class InquiryValidationError extends Error {
  constructor(public readonly fields: Record<string, string>) {
    super('Please correct the inquiry form.')
  }
}

export class InquiryStorageUnavailableError extends Error {}

export class InquiryRateLimitError extends Error {
  constructor() {
    super('Too many inquiries from this network. Please try again later.')
  }
}

function text(value: unknown, max: number) {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

type EncryptedInquiry = {
  version: typeof ENCRYPTION_VERSION
  keyId: typeof INQUIRY_KEY_ID
  iv: string
  tag: string
  ciphertext: string
}

function inquiryKey() {
  const encoded = process.env.INQUIRY_ENCRYPTION_KEY
  if (!encoded || !/^[A-Za-z0-9_-]+$/.test(encoded)) throw new InquiryStorageUnavailableError('Inquiry encryption is not configured.')
  const key = Buffer.from(encoded, 'base64url')
  if (key.length !== 32 || key.toString('base64url') !== encoded) throw new InquiryStorageUnavailableError('Inquiry encryption key is invalid.')
  return key
}

function ensureInquiryStorage() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) throw new InquiryStorageUnavailableError('Inquiry storage is not configured.')
  inquiryKey()
}

function encryptInquiry(inquiry: Inquiry): EncryptedInquiry {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', inquiryKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(JSON.stringify(inquiry), 'utf8'), cipher.final()])
  return { version: ENCRYPTION_VERSION, keyId: INQUIRY_KEY_ID, iv: iv.toString('base64url'), tag: cipher.getAuthTag().toString('base64url'), ciphertext: ciphertext.toString('base64url') }
}

type DecryptionResult = { inquiry: Inquiry } | { error: string }

function decryptInquiry(value: unknown): DecryptionResult {
  try {
    const encrypted = value as Partial<EncryptedInquiry>
    if (encrypted.version !== ENCRYPTION_VERSION || encrypted.keyId !== INQUIRY_KEY_ID || !encrypted.iv || !encrypted.tag || !encrypted.ciphertext) {
      return { error: 'Inquiry records use an unsupported encryption version or key ID.' }
    }
    const decipher = createDecipheriv('aes-256-gcm', inquiryKey(), Buffer.from(encrypted.iv, 'base64url'))
    decipher.setAuthTag(Buffer.from(encrypted.tag, 'base64url'))
    const plaintext = Buffer.concat([decipher.update(Buffer.from(encrypted.ciphertext, 'base64url')), decipher.final()]).toString('utf8')
    const inquiry = JSON.parse(plaintext) as Inquiry
    return inquiry.id && inquiry.email && inquiry.productSlug ? { inquiry } : { error: 'An inquiry record is malformed.' }
  } catch {
    return { error: 'Inquiry records cannot be decrypted with the configured key.' }
  }
}

/** A keyed, non-reversible fingerprint; no administrator credential is used. */
export function fingerprintInquiryIp(ipAddress: string) {
  return createHmac('sha256', inquiryKey()).update(`kangdarpet-inquiry-rate-limit-v1\0${ipAddress}`).digest('base64url').slice(0, 32)
}

function isOccupiedLock(error: unknown) {
  const status = typeof error === 'object' && error ? (error as { status?: unknown; statusCode?: unknown }).status ?? (error as { statusCode?: unknown }).statusCode : undefined
  const message = error instanceof Error ? error.message.toLowerCase() : ''
  return status === 409 || status === 412 || message.includes('already exists') || message.includes('already exist')
}

async function reserveInquiryRateLimit(ipHash: string) {
  const windowStart = Math.floor(Date.now() / RATE_LIMIT_WINDOW_MS) * RATE_LIMIT_WINDOW_MS
  for (let slot = 0; slot < RATE_LIMIT_MAX; slot += 1) {
    try {
      const lock = await put(`${INQUIRY_RATE_LIMIT_PREFIX}${ipHash}/${windowStart}-${slot}.lock`, JSON.stringify({ windowStart, slot }), {
        // This project uses a public Blob store; the path is a keyed fingerprint, not a raw IP.
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: false,
        contentType: 'application/json; charset=utf-8',
        cacheControlMaxAge: 60,
      })
      return lock.url
    } catch (error) {
      if (isOccupiedLock(error)) continue
      throw new InquiryStorageUnavailableError('Inquiry rate limiting is unavailable.')
    }
  }
  throw new InquiryRateLimitError()
}

export async function createInquiry(raw: unknown, ipHash?: string) {
  ensureInquiryStorage()
  const data = (raw ?? {}) as Record<string, unknown>
  const productSlug = text(data.productSlug, 100)
  const name = text(data.name, 120)
  const email = text(data.email, 160).toLowerCase()
  const company = text(data.company, 160) || undefined
  const phone = text(data.phone, 80) || undefined
  const country = text(data.country, 100) || undefined
  const message = text(data.message, 3000)
  const startedAt = Number(data.startedAt)
  const honeypot = text(data.website, 200)
  const fields: Record<string, string> = {}
  if (honeypot) fields.form = 'Unable to submit this inquiry.'
  if (!Number.isFinite(startedAt) || Date.now() - startedAt < 2500 || Date.now() - startedAt > 24 * 60 * 60 * 1000) fields.form = 'Please take a moment to complete the form.'
  if (!productSlug) fields.product = 'Product selection is missing.'
  if (name.length < 2) fields.name = 'Enter your full name.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fields.email = 'Enter a valid business email.'
  if (message.length < 15) fields.message = 'Tell us what you need in at least 15 characters.'
  if (Object.keys(fields).length) throw new InquiryValidationError(fields)

  const catalog = await readCatalog()
  const product = catalog.catalog.products.find((item) => item.slug === productSlug && item.status === 'published')
  if (!product) throw new InquiryValidationError({ product: 'This product is no longer available.' })

  const inquiry: Inquiry = {
    id: randomUUID(),
    productSlug,
    productName: product.name,
    name,
    email,
    company,
    phone,
    country,
    message,
    createdAt: new Date().toISOString(),
    ipHash,
  }
  const rateLimitLock = await reserveInquiryRateLimit(ipHash || fingerprintInquiryIp('unknown'))
  try {
    await put(`${INQUIRY_PREFIX}${Date.now()}-${inquiry.id}.json`, JSON.stringify(encryptInquiry(inquiry)), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json; charset=utf-8',
      cacheControlMaxAge: 60,
    })
  } catch (error) {
    // Do not consume a request slot when persistence fails before any inquiry is written.
    await del(rateLimitLock).catch(() => undefined)
    throw error
  }
  return inquiry
}

export type InquiryListResult = { inquiries: Inquiry[]; readOnly: boolean; error?: string }

function unavailable(error: string): InquiryListResult {
  return { inquiries: [], readOnly: true, error }
}

export async function listInquiries(): Promise<InquiryListResult> {
  try {
    ensureInquiryStorage()
  } catch (error) {
    return unavailable(error instanceof Error ? error.message : 'Inquiry storage is unavailable.')
  }
  try {
    const blobs: Awaited<ReturnType<typeof list>>['blobs'] = []
    let cursor: string | undefined
    for (let page = 0; page < 20; page += 1) {
      const result = await list({ prefix: INQUIRY_PREFIX, limit: MAX_INQUIRIES, cursor })
      blobs.push(...result.blobs)
      if (!result.hasMore) break
      if (!result.cursor || page === 19) return unavailable('Inquiry history exceeds the safe listing limit; archive older records before continuing.')
      cursor = result.cursor
    }
    const records: DecryptionResult[] = []
    for (let offset = 0; offset < blobs.length; offset += 50) {
      const batch = await Promise.all(blobs.slice(offset, offset + 50).map(async (blob): Promise<DecryptionResult> => {
        try {
          const result = await fetch(blob.url, { cache: 'no-store' })
          return result.ok ? decryptInquiry(await result.json()) : { error: 'An inquiry record could not be read.' }
        } catch {
          return { error: 'An inquiry record could not be read.' }
        }
      }))
      records.push(...batch)
    }
    const inquiries: Inquiry[] = []
    for (const record of records) {
      if ('error' in record) return unavailable(record.error)
      inquiries.push(record.inquiry)
    }
    return { inquiries: inquiries.sort((a, b) => b.createdAt.localeCompare(a.createdAt)), readOnly: false }
  } catch {
    return unavailable('Inquiry storage is unavailable.')
  }
}
