'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LockKeyhole, Store } from 'lucide-react'

export default function AdminLogin() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true); setMessage('')
    try {
      const response = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || 'Unable to sign in.')
      router.replace('/admin'); router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to sign in.')
    } finally { setLoading(false) }
  }

  return <main className="flex min-h-screen items-center justify-center bg-[#f5f7fa] p-5"><form onSubmit={login} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-900/5"><div className="flex size-11 items-center justify-center rounded-xl bg-[#ff6a00] text-white"><Store className="size-5" /></div><p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-[#e85d00]">KANGDARPET Seller Center</p><h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">Administrator sign in</h1><p className="mt-2 text-sm leading-relaxed text-slate-500">Use the administrator password configured in Vercel. This login creates a signed, HttpOnly session cookie.</p><label className="mt-7 block text-sm font-semibold text-slate-700">Password<input autoFocus required type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-3 outline-none transition focus:border-[#ff6a00] focus:ring-4 focus:ring-orange-100" /></label>{message && <p role="alert" className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{message}</p>}<button disabled={loading} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#ff6a00] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#e85d00] disabled:opacity-60"><LockKeyhole className="size-4" />{loading ? 'Signing in…' : 'Sign in securely'}</button></form></main>
}
