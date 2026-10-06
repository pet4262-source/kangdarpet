import Link from 'next/link'
import { Boxes, FileText, LayoutDashboard, MessageSquare, Store } from 'lucide-react'
import { LogoutButton } from '@/components/admin/logout-button'

const nav = [
  { href: '/admin', label: 'Business overview', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Boxes },
  { href: '/admin/inquiries', label: 'Inquiries', icon: MessageSquare },
  { href: '/admin/homepage', label: 'Homepage CMS', icon: FileText },
]

export function AdminShell({ children, active }: { children: React.ReactNode; active: string }) {
  return (
    <div className="min-h-screen bg-[#f5f7fa] text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white">
          <div className="flex h-15 items-center justify-between px-4 lg:px-7">
            <Link href="/admin" className="flex items-center gap-3 font-bold tracking-tight text-slate-900">
              <span className="flex size-8 items-center justify-center rounded-lg bg-[#ff6a00] text-white"><Store className="size-4" /></span>
              <span>KANGDARPET <span className="font-medium text-slate-400">Seller Center</span></span>
            </Link>
            <div className="flex items-center gap-4"><a className="text-sm font-medium text-slate-500 hover:text-[#ff6a00]" href="/products" target="_blank">View storefront</a><LogoutButton /></div>
          </div>
        </header>
        <nav aria-label="Admin navigation" className="border-b border-slate-200 bg-white px-3 py-2 lg:hidden">
          <div className="flex gap-1 overflow-x-auto pb-0.5">
            {nav.map((item) => {
              const Icon = item.icon
              const selected = active === item.href
              return <Link key={item.href} href={item.href} className={`inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition ${selected ? 'bg-orange-50 text-[#e85d00]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}><Icon className="size-4" />{item.label}</Link>
            })}
          </div>
        </nav>
        <div className="mx-auto flex max-w-[1600px]">
          <aside className="hidden min-h-[calc(100vh-60px)] w-60 shrink-0 border-r border-slate-200 bg-white p-3 lg:block">
            <p className="px-3 pb-2 pt-3 text-[11px] font-bold uppercase tracking-[.16em] text-slate-400">Operations</p>
          <nav className="space-y-1">{nav.map((item) => {
            const Icon = item.icon
            const selected = active === item.href
            return <Link key={item.href} href={item.href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${selected ? 'bg-orange-50 text-[#e85d00]' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}><Icon className="size-4" />{item.label}</Link>
          })}</nav>
          <div className="mt-8 rounded-xl bg-slate-900 p-4 text-white"><p className="text-xs font-bold uppercase tracking-widest text-orange-300">B2B only</p><p className="mt-2 text-xs leading-relaxed text-slate-300">Catalog, buyer inquiries and homepage content. Cart, orders and payments are intentionally not enabled.</p></div>
        </aside>
        <main className="min-w-0 flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
