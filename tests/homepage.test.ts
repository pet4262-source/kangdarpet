import { describe, expect, it } from 'vitest'
import baseline from '@/data/homepage-baseline.json'
import { HomepageValidationError, validateHomepageContent } from '@/lib/homepage-schema'

describe('homepage CMS schema', () => {
  it('keeps six category records and their multi-media fields while dropping the legacy catalog', () => {
    const content = validateHomepageContent(baseline)
    expect(content.products.items).toHaveLength(6)
    expect(content.products.items.find((item) => item.slug === 'rope')?.images).toHaveLength(3)
    expect(content).not.toHaveProperty('catalog')
  })

  it('normalizes a legacy category with only a primary image into an editable media list', () => {
    const legacy = structuredClone(baseline)
    delete (legacy.products.items[0] as { images?: string[] }).images
    delete (legacy.products.items[0] as { video?: string }).video
    const content = validateHomepageContent(legacy)
    expect(content.products.items[0].images).toEqual([content.products.items[0].image])
    expect(content.products.items[0].video).toBe('')
  })

  it('rejects unsafe CMS links rather than rendering executable URL schemes', () => {
    const unsafe = structuredClone(baseline)
    unsafe.contact.whatsappLink = 'javascript:alert(1)'
    expect(() => validateHomepageContent(unsafe)).toThrow(HomepageValidationError)
  })
})
