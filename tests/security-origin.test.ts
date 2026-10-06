import { describe, expect, it, vi } from 'vitest'

vi.mock('server-only', () => ({}))

import { POST as submitInquiry } from '@/app/api/inquiries/route'
import { POST as login } from '@/app/api/admin/login/route'
import { requireSameOrigin } from '@/lib/admin-auth'

function request(url: string, headers: Record<string, string>) {
  return new Request(url, { method: 'POST', headers, body: '{}' })
}

describe('same-origin mutation protection', () => {
  it('accepts a same-origin local HTTP request', () => {
    expect(requireSameOrigin(request('http://localhost:3000/api/admin/login', { origin: 'http://localhost:3000' }))).toBe(true)
  })

  it('accepts a forwarded HTTPS preview origin', () => {
    expect(requireSameOrigin(request('http://internal-handler/api/admin/login', {
      origin: 'https://preview.example.test',
      'x-forwarded-host': 'preview.example.test',
      'x-forwarded-proto': 'https',
    }))).toBe(true)
  })

  it('rejects a malicious Origin even when the requested host is valid', () => {
    expect(requireSameOrigin(request('https://admin.example.test/api/admin/login', { origin: 'https://attacker.example' }))).toBe(false)
  })

  it('rejects a missing Origin for browser mutation endpoints', () => {
    expect(requireSameOrigin(request('https://admin.example.test/api/admin/login', {}))).toBe(false)
  })

  it('rejects a cross-site CORS-simple text/plain inquiry before storage work', async () => {
    const response = await submitInquiry(new Request('https://store.example.test/api/inquiries', {
      method: 'POST',
      headers: { origin: 'https://attacker.example', 'content-type': 'text/plain' },
      body: '{}',
    }))
    expect(response.status).toBe(403)
  })

  it('rejects a malicious login Origin before authentication processing', async () => {
    const response = await login(request('https://admin.example.test/api/admin/login', { origin: 'https://attacker.example' }))
    expect(response.status).toBe(403)
  })
})
