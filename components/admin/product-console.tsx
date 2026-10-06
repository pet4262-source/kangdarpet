'use client'

import { ChangeEvent, useEffect, useMemo, useState } from 'react'
import { upload } from '@vercel/blob/client'
import { ChevronDown, GripVertical, ImagePlus, Loader2, Pencil, Plus, Search, Star, Trash2, Upload, X } from 'lucide-react'
import { coverImage, slugify, type CatalogDocument, type Product, type ProductAttribute, type ProductImage, type ProductSpecification } from '@/lib/catalog'

type CatalogResponse = { catalog: CatalogDocument; source: 'blob' | 'seed'; readOnly: boolean }
type EditorProduct = Omit<Product, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }

const emptyProduct = (): EditorProduct => ({ slug: '', sku: '', name: '', category: '', description: '', status: 'draft', moq: 100, material: '', size: '', images: [], coverIndex: 0, specifications: [], attributes: [], video: '' })

function productToEditor(product: Product): EditorProduct {
  return { ...product, images: product.images.map((image) => ({ ...image })), specifications: product.specifications.map((spec) => ({ ...spec, options: [...spec.options] })), attributes: product.attributes.map((attribute) => ({ ...attribute })) }
}

function fieldClass(error?: string) {
  return `mt-1.5 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:ring-4 ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-100' : 'border-slate-300 focus:border-[#ff6a00] focus:ring-orange-100'}`
}

export function ProductConsole() {
  const [state, setState] = useState<CatalogResponse | null>(null)
  const [editing, setEditing] = useState<EditorProduct | null>(null)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [notice, setNotice] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function loadCatalog() {
    setNotice('')
    const response = await fetch('/api/admin/catalog', { cache: 'no-store' })
    if (!response.ok) { setNotice('Could not load the catalog. Sign in again and refresh.'); return }
    setState(await response.json())
  }

  useEffect(() => { void loadCatalog() }, [])

  const filtered = useMemo(() => state?.catalog.products.filter((product) => {
    const haystack = `${product.name} ${product.sku} ${product.slug}`.toLowerCase()
    return (!query || haystack.includes(query.toLowerCase())) && (statusFilter === 'all' || product.status === statusFilter) && (categoryFilter === 'all' || product.category === categoryFilter)
  }) ?? [], [state, query, statusFilter, categoryFilter])

  const counts = useMemo(() => ({ all: state?.catalog.products.length ?? 0, published: state?.catalog.products.filter((item) => item.status === 'published').length ?? 0, draft: state?.catalog.products.filter((item) => item.status === 'draft').length ?? 0 }), [state])

  function beginNew() {
    const category = state?.catalog.categories[0]?.slug || ''
    setEditing({ ...emptyProduct(), category })
    setErrors({}); setNotice('')
  }

  function update(patch: Partial<EditorProduct>) {
    setEditing((current) => current ? { ...current, ...patch } : current)
  }

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || !editing) return
    setUploading(true); setNotice('')
    try {
      const extensions: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' }
      const extension = extensions[file.type]
      if (!extension || file.size > 6 * 1024 * 1024) throw new Error('Use a JPEG, PNG, WebP or AVIF image under 6 MB.')
      const location = await fetch('/api/admin/uploads', { cache: 'no-store' })
      if (!location.ok) throw new Error('Upload access is unavailable. Sign in again and retry.')
      const { prefix } = await location.json() as { prefix: string }
      const blob = await upload(`${prefix}${crypto.randomUUID()}.${extension}`, file, {
        access: 'public',
        handleUploadUrl: '/api/admin/uploads',
      })
      setEditing((current) => current ? { ...current, images: [...current.images, { url: blob.url, alt: current.name || 'Product image' }] } : current)
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Upload failed.') } finally { setUploading(false) }
  }

  async function save() {
    if (!editing || !state) return
    if (state.readOnly) { setNotice('Saving is disabled: Blob storage is not configured. Seed content is read-only.'); return }
    setSaving(true); setErrors({}); setNotice('')
    try {
      const endpoint = editing.id ? `/api/admin/products/${editing.id}` : '/api/admin/products'
      const response = await fetch(endpoint, { method: editing.id ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ expectedRevision: state.catalog.revision, product: editing }) })
      const body = await response.json()
      if (!response.ok) { setErrors(body.fields || {}); throw new Error(body.error || 'Save failed.') }
      setState({ catalog: body.catalog, source: 'blob', readOnly: false })
      setEditing(null); setNotice(editing.status === 'published' ? 'Product published to the storefront.' : 'Draft saved. It is not visible on the storefront.')
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Save failed.') } finally { setSaving(false) }
  }

  async function remove(id: string) {
    if (!state || state.readOnly) return
    const product = state.catalog.products.find((item) => item.id === id)
    if (!product || !window.confirm(`Delete "${product.name}"? This removes it from the public catalog and cannot be undone from this screen.`)) return
    setNotice('')
    const response = await fetch(`/api/admin/products/${id}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ expectedRevision: state.catalog.revision }) })
    const body = await response.json()
    if (!response.ok) { setNotice(body.error || 'Unable to delete product.'); return }
    setState({ catalog: body.catalog, source: 'blob', readOnly: false }); setNotice('Product removed from the catalog.')
  }

  if (!state) return <div className="flex min-h-80 items-center justify-center text-sm text-slate-500"><Loader2 className="mr-2 size-4 animate-spin" />Loading catalog…</div>

  return <div className="space-y-6"><div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end"><div><p className="text-sm font-semibold text-[#e85d00]">Product management</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Wholesale catalog</h1><p className="mt-2 max-w-2xl text-sm text-slate-500">Control product detail, multi-image galleries, SKU, minimum order quantity, variants and publishing status.</p></div><button onClick={beginNew} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#ff6a00] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#e85d00]"><Plus className="size-4" />Add product</button></div>{state.readOnly && <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"><b>Catalog is read-only.</b> Check the Blob connection and configuration before saving. Products are hidden if storage cannot be read safely.</div>}{notice && <p role="status" className={`rounded-lg px-4 py-3 text-sm ${notice.includes('published') || notice.includes('saved') || notice.includes('removed') ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-700'}`}>{notice}</p>}<section className="grid gap-3 sm:grid-cols-3"><Stat label="All products" value={counts.all} active={statusFilter === 'all'} onClick={() => setStatusFilter('all')} /><Stat label="Published" value={counts.published} active={statusFilter === 'published'} onClick={() => setStatusFilter('published')} /><Stat label="Drafts" value={counts.draft} active={statusFilter === 'draft'} onClick={() => setStatusFilter('draft')} /></section><section className="rounded-xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row"><label className="relative flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" /><span className="sr-only">Search products</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search product name, SKU or URL slug" className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#ff6a00]" /></label><label><span className="sr-only">Filter category</span><select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-[#ff6a00]"><option value="all">All categories</option>{state.catalog.categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select></label></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3 font-semibold">Product</th><th className="px-4 py-3 font-semibold">Category / SKU</th><th className="px-4 py-3 font-semibold">MOQ</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-4 py-3 text-right font-semibold">Actions</th></tr></thead><tbody className="divide-y divide-slate-100">{filtered.map((product) => <tr key={product.id} className="hover:bg-slate-50/70"><td className="px-4 py-3"><div className="flex items-center gap-3"><img src={coverImage(product)} alt="" className="size-11 rounded-lg border border-slate-100 object-cover" /><div><p className="max-w-72 truncate font-semibold text-slate-800">{product.name}</p><p className="max-w-72 truncate text-xs text-slate-400">/{product.slug}</p></div></div></td><td className="px-4 py-3"><p className="text-slate-600">{state.catalog.categories.find((item) => item.slug === product.category)?.name || product.category}</p><p className="mt-1 font-mono text-xs text-slate-400">{product.sku}</p></td><td className="px-4 py-3 font-semibold text-slate-700">{product.moq.toLocaleString()} pcs</td><td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${product.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{product.status === 'published' ? 'Published' : 'Draft'}</span></td><td className="px-4 py-3 text-right"><button onClick={() => { setEditing(productToEditor(product)); setErrors({}); setNotice('') }} className="mr-3 inline-flex items-center gap-1 font-semibold text-[#e85d00] hover:text-[#bf4d00]"><Pencil className="size-3.5" />Edit</button><button onClick={() => void remove(product.id)} className="inline-flex items-center gap-1 font-semibold text-slate-400 hover:text-red-600"><Trash2 className="size-3.5" />Delete</button></td></tr>)}{filtered.length === 0 && <tr><td colSpan={5} className="px-4 py-12 text-center text-sm text-slate-500">No products match these filters.</td></tr>}</tbody></table></div></section>{editing && <ProductEditor product={editing} categories={state.catalog.categories} errors={errors} saving={saving} uploading={uploading} readOnly={state.readOnly} onClose={() => setEditing(null)} onChange={update} onUpload={uploadImage} onSave={() => void save()} />}</div>
}

function Stat({ label, value, active, onClick }: { label: string; value: number; active: boolean; onClick: () => void }) {
  return <button onClick={onClick} className={`rounded-xl border p-4 text-left shadow-sm transition ${active ? 'border-orange-200 bg-orange-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}><p className="text-2xl font-bold text-slate-900">{value}</p><p className="mt-1 text-sm font-medium text-slate-500">{label}</p></button>
}

function ProductEditor({ product, categories, errors, saving, uploading, readOnly, onClose, onChange, onUpload, onSave }: { product: EditorProduct; categories: CatalogDocument['categories']; errors: Record<string, string>; saving: boolean; uploading: boolean; readOnly: boolean; onClose: () => void; onChange: (patch: Partial<EditorProduct>) => void; onUpload: (event: ChangeEvent<HTMLInputElement>) => void; onSave: () => void }) {
  const setImages = (images: ProductImage[], coverIndex = product.coverIndex) => onChange({ images, coverIndex: Math.min(coverIndex, Math.max(images.length - 1, 0)) })
  const setSpecs = (specifications: ProductSpecification[]) => onChange({ specifications })
  const setAttributes = (attributes: ProductAttribute[]) => onChange({ attributes })
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/30 p-3 backdrop-blur-sm md:p-6"><div className="mx-auto max-w-5xl rounded-2xl bg-[#f7f8fa] shadow-2xl"><div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 md:px-7"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-[#e85d00]">{product.id ? 'Edit catalog product' : 'New catalog product'}</p><h2 className="mt-1 text-xl font-bold">{product.name || 'Product details'}</h2></div><button onClick={onClose} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"><X className="size-5" /><span className="sr-only">Close editor</span></button></div><div className="grid gap-5 p-5 md:p-7"><section className="rounded-xl border border-slate-200 bg-white p-5"><h3 className="font-bold">Basic information</h3><div className="mt-4 grid gap-4 md:grid-cols-2"><Field label="Product name" error={errors.name}><input value={product.name} onChange={(e) => onChange({ name: e.target.value, slug: product.slug || slugify(e.target.value) })} className={fieldClass(errors.name)} /></Field><Field label="Publish status" error={errors.status}><select value={product.status} onChange={(e) => onChange({ status: e.target.value as Product['status'] })} className={fieldClass(errors.status)}><option value="draft">Draft — hidden from storefront</option><option value="published">Published — visible now</option></select></Field><Field label="URL slug" error={errors.slug}><input value={product.slug} onChange={(e) => onChange({ slug: slugify(e.target.value) })} className={`${fieldClass(errors.slug)} font-mono`} /></Field><Field label="Seller SKU" error={errors.sku}><input value={product.sku} onChange={(e) => onChange({ sku: e.target.value.toUpperCase() })} placeholder="KDP-0049" className={`${fieldClass(errors.sku)} font-mono`} /></Field><Field label="Category" error={errors.category}><select value={product.category} onChange={(e) => onChange({ category: e.target.value })} className={fieldClass(errors.category)}>{categories.map((category) => <option key={category.slug} value={category.slug}>{category.name}</option>)}</select></Field><Field label="Minimum order quantity (pcs)" error={errors.moq}><input type="number" min="1" value={product.moq} onChange={(e) => onChange({ moq: Number(e.target.value) })} className={fieldClass(errors.moq)} /></Field><Field label="Material"><input value={product.material} onChange={(e) => onChange({ material: e.target.value })} placeholder="Natural rubber" className={fieldClass()} /></Field><Field label="Size"><input value={product.size} onChange={(e) => onChange({ size: e.target.value })} placeholder="20 cm" className={fieldClass()} /></Field></div><Field label="Product description" error={errors.description}><textarea rows={4} value={product.description} onChange={(e) => onChange({ description: e.target.value })} className={fieldClass(errors.description)} /></Field><Field label="Video URL (optional)" error={errors.video}><input value={product.video || ''} onChange={(e) => onChange({ video: e.target.value })} placeholder="https://…" className={fieldClass(errors.video)} /></Field></section><section className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-bold">Product images</h3><p className="mt-1 text-xs text-slate-500">First image or starred image becomes the storefront cover. JPEG, PNG, WebP or AVIF; 6 MB maximum.</p></div><label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#ff6a00] px-3 py-2 text-sm font-bold text-[#e85d00] hover:bg-orange-50"><Upload className="size-4" />{uploading ? 'Uploading…' : 'Upload image'}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={uploading || readOnly} onChange={onUpload} className="sr-only" /></label></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{product.images.map((image, index) => <div key={`${image.url}-${index}`} className={`relative overflow-hidden rounded-lg border bg-white ${product.coverIndex === index ? 'border-[#ff6a00] ring-2 ring-orange-100' : 'border-slate-200'}`}><img src={image.url} alt={image.alt || ''} className="aspect-square w-full object-cover" /><div className="flex items-center justify-between p-2"><button onClick={() => setImages(product.images, index)} className={`inline-flex items-center gap-1 text-xs font-bold ${product.coverIndex === index ? 'text-[#e85d00]' : 'text-slate-500 hover:text-[#e85d00]'}`}><Star className={`size-3.5 ${product.coverIndex === index ? 'fill-current' : ''}`} />Cover</button><div className="flex items-center"><button disabled={index === 0} onClick={() => { const images = [...product.images]; [images[index - 1], images[index]] = [images[index], images[index - 1]]; setImages(images, product.coverIndex === index ? index - 1 : product.coverIndex === index - 1 ? index : product.coverIndex) }} className="p-1 text-slate-400 disabled:opacity-30"><GripVertical className="size-3.5" /></button><button onClick={() => setImages(product.images.filter((_, itemIndex) => itemIndex !== index), product.coverIndex > index ? product.coverIndex - 1 : product.coverIndex)} className="p-1 text-slate-400 hover:text-red-600"><Trash2 className="size-3.5" /></button></div></div></div>)}{product.images.length === 0 && <div className="col-span-full rounded-lg border border-dashed border-slate-300 p-7 text-center text-sm text-slate-500"><ImagePlus className="mx-auto size-5 text-slate-400" /> <p className="mt-2">Upload product images before publishing.</p></div>}</div></section><Repeater title="Specifications / variants" hint="For example: Color — red, blue, green; Size — S, M, L." rows={product.specifications} onAdd={() => setSpecs([...product.specifications, { name: '', options: [] }])} render={(row, index) => <div className="grid gap-3 md:grid-cols-[1fr_2fr_auto]"><input value={row.name} placeholder="Option name" onChange={(e) => { const rows = [...product.specifications]; rows[index] = { ...row, name: e.target.value }; setSpecs(rows) }} className={fieldClass()} /><input value={row.options.join(', ')} placeholder="Options, comma separated" onChange={(e) => { const rows = [...product.specifications]; rows[index] = { ...row, options: e.target.value.split(',').map((value) => value.trim()).filter(Boolean) }; setSpecs(rows) }} className={fieldClass()} /><Remove onClick={() => setSpecs(product.specifications.filter((_, itemIndex) => itemIndex !== index))} /></div>} /><Repeater title="Custom attributes" hint="Add buyer-facing details such as feature, age group, packaging or safety standard." rows={product.attributes} onAdd={() => setAttributes([...product.attributes, { name: '', value: '' }])} render={(row, index) => <div className="grid gap-3 md:grid-cols-[1fr_2fr_auto]"><input value={row.name} placeholder="Attribute" onChange={(e) => { const rows = [...product.attributes]; rows[index] = { ...row, name: e.target.value }; setAttributes(rows) }} className={fieldClass()} /><input value={row.value} placeholder="Value" onChange={(e) => { const rows = [...product.attributes]; rows[index] = { ...row, value: e.target.value }; setAttributes(rows) }} className={fieldClass()} /><Remove onClick={() => setAttributes(product.attributes.filter((_, itemIndex) => itemIndex !== index))} /></div>} /></div><div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-4 md:px-7"><p className="text-xs text-slate-500">Drafts never appear on the public catalog. Published saves are immediately visible.</p><div className="flex gap-3"><button onClick={onClose} className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button><button disabled={saving || readOnly} onClick={onSave} className="inline-flex items-center gap-2 rounded-lg bg-[#ff6a00] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#e85d00] disabled:opacity-60">{saving && <Loader2 className="size-4 animate-spin" />}{product.status === 'published' ? 'Save & publish' : 'Save draft'}<ChevronDown className="size-3.5" /></button></div></div></div></div>
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) { return <label className="mt-4 block text-sm font-semibold text-slate-700"><span>{label}</span>{children}{error && <span className="mt-1 block text-xs font-medium text-red-600">{error}</span>}</label> }
function Remove({ onClick }: { onClick: () => void }) { return <button type="button" onClick={onClick} className="mt-1.5 inline-flex h-9 items-center justify-center rounded-lg border border-slate-200 px-2 text-slate-400 hover:border-red-200 hover:text-red-600"><Trash2 className="size-4" /><span className="sr-only">Remove row</span></button> }
function Repeater<T>({ title, hint, rows, onAdd, render }: { title: string; hint: string; rows: T[]; onAdd: () => void; render: (row: T, index: number) => React.ReactNode }) { return <section className="rounded-xl border border-slate-200 bg-white p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-bold">{title}</h3><p className="mt-1 text-xs text-slate-500">{hint}</p></div><button type="button" onClick={onAdd} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"><Plus className="size-3.5" />Add row</button></div><div className="mt-3 space-y-2">{rows.map((row, index) => <div key={index}>{render(row, index)}</div>)}{rows.length === 0 && <p className="rounded-lg bg-slate-50 px-3 py-3 text-xs text-slate-500">No entries added yet.</p>}</div></section> }
