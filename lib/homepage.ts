import 'server-only'

import { list, put } from '@vercel/blob'
import { randomUUID } from 'node:crypto'
import homepageBaseline from '@/data/homepage-baseline.json'
import { HomepageValidationError, validateHomepageContent } from '@/lib/homepage-schema'
import type { HomepageContent } from '@/lib/homepage-types'

export type { HomepageContent } from '@/lib/homepage-types'
export { HomepageValidationError } from '@/lib/homepage-schema'

const PRODUCTION_HOMEPAGE_PREFIX = 'cms/homepage-'
const PREVIEW_HOMEPAGE_PREFIX = 'cms-preview/homepage-'

export class HomepageStorageUnavailableError extends Error {}

/** Sanitized public baseline, including no legacy `catalog` key. */
export const defaultHomepage: HomepageContent = validateHomepageContent(homepageBaseline)

export function homepageStorageConfigured() {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN)
}

function cloneBaseline() {
  return structuredClone(defaultHomepage)
}

function isProduction() {
  return process.env.VERCEL_ENV === 'production'
}

function writePrefix() {
  return isProduction() ? PRODUCTION_HOMEPAGE_PREFIX : PREVIEW_HOMEPAGE_PREFIX
}

function versionTimestamp(pathname: string, prefix: string) {
  const match = pathname.slice(prefix.length).match(/^(\d{10,})(?:-[a-z0-9-]+)?\.json$/i)
  return match ? Number(match[1]) : Number.NEGATIVE_INFINITY
}

async function readLatestVersion(prefix: string): Promise<HomepageContent | null> {
  const result = await list({ prefix })
  const latest = result.blobs
    .filter((blob) => Number.isFinite(versionTimestamp(blob.pathname, prefix)))
    .sort((left, right) => versionTimestamp(right.pathname, prefix) - versionTimestamp(left.pathname, prefix))[0]

  if (!latest) return null
  const response = await fetch(latest.url, { cache: 'no-store' })
  if (!response.ok) return null
  return validateHomepageContent(await response.json())
}

/**
 * Production reads the timestamp-newest production version. Preview/local
 * reads its own newest version first, then uses production only as a display
 * seed. This keeps preview saves from changing the live homepage.
 */
export async function readHomepageContent(): Promise<HomepageContent> {
  if (!homepageStorageConfigured()) return cloneBaseline()

  try {
    const environmentVersion = await readLatestVersion(writePrefix())
    if (environmentVersion) return environmentVersion
    if (!isProduction()) {
      const productionVersion = await readLatestVersion(PRODUCTION_HOMEPAGE_PREFIX)
      if (productionVersion) return productionVersion
    }
  } catch {
    // The public homepage stays available from the checked-in public baseline.
  }
  return cloneBaseline()
}

/**
 * Persists a unique immutable version only. Production uses cms/homepage-*;
 * preview/local uses cms-preview/homepage-* and cannot modify live content.
 */
export async function writeHomepageContent(raw: unknown): Promise<HomepageContent> {
  if (!homepageStorageConfigured()) {
    throw new HomepageStorageUnavailableError('Persistent homepage storage is not configured. The public baseline is read-only.')
  }

  const content = validateHomepageContent(raw)
  const pathname = `${writePrefix()}${Date.now()}-${randomUUID()}.json`
  try {
    await put(pathname, JSON.stringify(content), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json; charset=utf-8',
      cacheControlMaxAge: 60,
    })
  } catch {
    throw new HomepageStorageUnavailableError('Homepage storage is temporarily unavailable. No content was saved.')
  }
  return content
}
