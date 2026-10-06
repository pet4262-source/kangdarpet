'use client'

import { useRouter } from 'next/navigation'

export function LogoutButton() {
  const router = useRouter()
  return <button type="button" onClick={async () => { await fetch('/api/admin/logout', { method: 'POST' }); router.replace('/admin/login'); router.refresh() }} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600 hover:border-slate-300 hover:bg-slate-50">Sign out</button>
}
