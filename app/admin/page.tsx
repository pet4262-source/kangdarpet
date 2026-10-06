import { Boxes, Eye, FilePenLine, MessageSquare } from 'lucide-react'
import { AdminShell } from '@/components/admin/admin-shell'
import { requireAdminPage } from '@/lib/admin-auth'
import { readCatalog } from '@/lib/catalog-store'
import { listInquiries } from '@/lib/inquiry-store'

export const dynamic = 'force-dynamic'

export default async function AdminHome() {
  await requireAdminPage()
  const [{ catalog, readOnly }, { inquiries }] = await Promise.all([readCatalog(), listInquiries()])
  const published = catalog.products.filter((product) => product.status === 'published').length
  const cards = [
    { label: 'Published products', value: published, note: `${catalog.products.length - published} drafts`, icon: Eye, href: '/admin/products' },
    { label: 'Catalog products', value: catalog.products.length, note: `Revision ${catalog.revision}`, icon: Boxes, href: '/admin/products' },
    { label: 'Buyer inquiries', value: inquiries.length, note: inquiries[0] ? `Latest: ${inquiries[0].productName}` : 'No buyer messages yet', icon: MessageSquare, href: '/admin/inquiries' },
  ]
  return <AdminShell active="/admin"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-[#e85d00]">Seller workspace</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Business overview</h1><p className="mt-2 text-sm text-slate-500">Manage the wholesale catalog and turn product-page interest into qualified inquiries.</p></div><a href="/admin/products" className="rounded-lg bg-[#ff6a00] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#e85d00]">Add product</a></div>{readOnly && <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Read-only seed mode: configure <code>BLOB_READ_WRITE_TOKEN</code> before saving products or inquiries.</p>}<section className="mt-6 grid gap-4 md:grid-cols-3">{cards.map((card) => { const Icon = card.icon; return <a key={card.label} href={card.href} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><Icon className="size-5 text-[#ff6a00]" /><p className="mt-5 text-3xl font-bold">{card.value}</p><p className="mt-1 font-semibold text-slate-700">{card.label}</p><p className="mt-2 truncate text-xs text-slate-500">{card.note}</p></a> })}</section><section className="mt-6 rounded-xl border border-slate-200 bg-white p-6"><div className="flex items-center gap-2"><FilePenLine className="size-5 text-[#ff6a00]" /><h2 className="font-bold">Operational notes</h2></div><ul className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2"><li>• Product saves create immutable Blob versions and the storefront reads the newest version.</li><li>• Draft products remain invisible on <code>/products</code> until published.</li><li>• Every edit checks a catalog revision to prevent silent overwrites.</li><li>• No cart, checkout, order, or payment capability is present.</li></ul></section></AdminShell>
}
