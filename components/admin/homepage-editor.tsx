'use client'

import Link from 'next/link'
import { type ChangeEvent, useState } from 'react'
import { upload } from '@vercel/blob/client'
import { Check, Eye, FileImage, ImagePlus, Loader2, Save, TriangleAlert, Upload } from 'lucide-react'
import type { HomepageCategory, HomepageContent } from '@/lib/homepage-types'

type SectionKey = 'hero' | 'why' | 'products' | 'oem' | 'factory' | 'about' | 'testimonials' | 'contact'
type Status = 'idle' | 'saving' | 'saved' | 'error'
type UploadLocation = { prefix?: string; error?: string }

const sections: { key: SectionKey; label: string }[] = [
  { key: 'hero', label: 'Hero 主视觉' },
  { key: 'why', label: '品牌卖点' },
  { key: 'products', label: '产品分类与媒体' },
  { key: 'oem', label: 'OEM & ODM' },
  { key: 'factory', label: '工厂数据' },
  { key: 'about', label: '关于我们' },
  { key: 'testimonials', label: '客户评价' },
  { key: 'contact', label: '联系方式' },
]

const imageExtensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
}
const maxImageBytes = 6 * 1024 * 1024

function Field({ label, value, onChange, textarea = false, type = 'text', disabled = false }: { label: string; value: string; onChange: (value: string) => void; textarea?: boolean; type?: 'text' | 'url' | 'email'; disabled?: boolean }) {
  const className = 'mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#ff6a00] focus:ring-4 focus:ring-orange-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500'
  return <label className="block text-sm font-semibold text-slate-700"><span>{label}</span>{textarea ? <textarea rows={4} className={className} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} /> : <input type={type} className={className} value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} />}</label>
}

function replaceAt<T>(items: T[], index: number, item: T) {
  return items.map((current, currentIndex) => currentIndex === index ? item : current)
}

function HomepageImageUploadButton({ disabled, onUploaded, onUploadStateChange, label = '从电脑上传', successMessage = '图片已上传并生成公开链接；点击“保存首页”后才会出现在首页。' }: { disabled: boolean; onUploaded: (url: string) => void; onUploadStateChange: (uploading: boolean) => void; label?: string; successMessage?: string }) {
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState(false)

  async function uploadImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file || disabled || uploading) return

    setUploading(true)
    onUploadStateChange(true)
    setMessage('')
    setError(false)

    try {
      const extension = imageExtensions[file.type]
      if (!extension || file.size > maxImageBytes) throw new Error('仅支持 JPEG、PNG、WebP 或 AVIF 图片，且文件不能超过 6 MB。')

      const location = await fetch('/api/admin/uploads?kind=homepage', { cache: 'no-store' })
      const payload = await location.json().catch(() => null) as UploadLocation | null
      if (!location.ok || !payload?.prefix) throw new Error(payload?.error || '上传权限暂不可用，请重新登录后重试。')

      const blob = await upload(`${payload.prefix}${crypto.randomUUID()}.${extension}`, file, {
        access: 'public',
        handleUploadUrl: '/api/admin/uploads',
      })
      onUploaded(blob.url)
      setMessage(successMessage)
    } catch (uploadError) {
      setError(true)
      setMessage(uploadError instanceof Error ? uploadError.message : '图片上传失败，请稍后重试。')
    } finally {
      setUploading(false)
      onUploadStateChange(false)
    }
  }

  return <div className="min-w-0"><label className={`inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-xs font-bold text-[#e85d00] transition hover:bg-orange-100 ${disabled || uploading ? 'cursor-not-allowed opacity-50' : ''}`}><Upload className="size-4" />{uploading ? '上传中…' : label}<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" disabled={disabled || uploading} onChange={uploadImage} className="sr-only" /></label>{message && <p role="status" className={`mt-2 text-xs leading-relaxed ${error ? 'text-red-700' : 'text-emerald-700'}`}>{message}</p>}</div>
}

function HomepageImageField({ label, value, onChange, disabled, onUploadStateChange }: { label: string; value: string; onChange: (value: string) => void; disabled: boolean; onUploadStateChange: (uploading: boolean) => void }) {
  return <div><Field label={label} type="url" value={value} disabled={disabled} onChange={onChange} /><div className="mt-3 flex flex-wrap items-center gap-3"><HomepageImageUploadButton disabled={disabled} label={`从电脑上传${label.replace(' URL', '')}`} onUploaded={onChange} onUploadStateChange={onUploadStateChange} /><p className="text-xs leading-relaxed text-slate-500">可粘贴图片 URL，或直接从本机选择 JPEG、PNG、WebP、AVIF（最多 6 MB）。</p></div>{value && <div className="mt-3 flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3"><img src={value} alt="当前图片预览" className="size-16 rounded-md border border-slate-200 bg-white object-cover" /><div className="min-w-0"><p className="text-xs font-bold text-slate-700">当前图片预览</p><p className="mt-1 break-all text-xs text-slate-500">图片上传或 URL 修改后仅更新当前表单，保存首页后才会发布。</p></div></div>}</div>
}

function CategoryMediaEditor({ item, onChange, disabled, onUploadStateChange }: { item: HomepageCategory; onChange: (item: HomepageCategory) => void; disabled: boolean; onUploadStateChange: (uploading: boolean) => void }) {
  const [newImage, setNewImage] = useState('')
  const images = item.images.length ? item.images : [item.image]
  const updateImage = (index: number, value: string) => {
    const nextImages = replaceAt(images, index, value)
    onChange({ ...item, image: nextImages[0], images: nextImages })
  }
  const removeImage = (index: number) => {
    if (images.length === 1) return
    const nextImages = images.filter((_, imageIndex) => imageIndex !== index)
    onChange({ ...item, image: nextImages[0], images: nextImages })
  }
  const addImage = () => {
    const value = newImage.trim()
    if (!value) return
    onChange({ ...item, image: images[0], images: [...images, value] })
    setNewImage('')
  }
  const appendUploadedImage = (url: string) => onChange({ ...item, image: images[0], images: [...images, url] })

  return <div className="mt-5 border-t border-slate-200 pt-5"><div className="flex items-center gap-2"><FileImage className="size-4 text-[#ff6a00]" /><h4 className="text-sm font-bold text-slate-800">分类图片与视频</h4></div><p className="mt-1 text-xs leading-relaxed text-slate-500">第一张是分类卡封面；其余图片和视频会在首页媒体预览中保留展示。可粘贴站内路径或 HTTP(S) URL，也可直接上传本机图片。</p><div className="mt-4 space-y-4">{images.map((image, index) => <div key={`${index}-${image}`} className="rounded-lg border border-slate-200 bg-white p-3"><div className="flex gap-2"><div className="min-w-0 flex-1"><HomepageImageField label={index === 0 ? '封面图片 URL' : `附加图片 ${index + 1} URL`} value={image} disabled={disabled} onChange={(value) => updateImage(index, value)} onUploadStateChange={onUploadStateChange} /></div><button type="button" aria-label={`删除图片 ${index + 1}`} disabled={disabled || images.length === 1} onClick={() => removeImage(index)} className="mt-7 h-10 shrink-0 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-40">删除</button></div></div>)}</div><div className="mt-4 rounded-lg border border-dashed border-orange-200 bg-orange-50/40 p-3"><p className="text-xs font-bold text-slate-700">添加附加图片</p><div className="mt-2 flex flex-wrap items-start gap-2"><input aria-label="新增图片 URL" type="url" value={newImage} disabled={disabled} placeholder="新增图片 URL" onChange={(event) => setNewImage(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#ff6a00] disabled:bg-slate-100" /><button type="button" disabled={disabled || !newImage.trim()} onClick={addImage} className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-orange-200 bg-white px-3 py-2 text-sm font-bold text-[#e85d00] hover:bg-orange-100 disabled:cursor-not-allowed disabled:opacity-50"><ImagePlus className="size-4" />添加图片</button><HomepageImageUploadButton disabled={disabled} label="上传图片" successMessage="图片上传成功，已添加到当前表单；请点击“保存首页”后发布。" onUploaded={appendUploadedImage} onUploadStateChange={onUploadStateChange} /></div></div><div className="mt-4"><Field label="视频 URL（可选）" type="url" value={item.video} disabled={disabled} onChange={(value) => onChange({ ...item, video: value })} /></div></div>
}

export function HomepageEditor({ initial, readOnly }: { initial: HomepageContent; readOnly: boolean }) {
  const [content, setContent] = useState(initial)
  const [active, setActive] = useState<SectionKey>('hero')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [uploadCount, setUploadCount] = useState(0)
  const editingDisabled = readOnly || status === 'saving'
  const uploading = uploadCount > 0
  const saveDisabled = editingDisabled || uploading
  const update = <K extends SectionKey>(key: K, patch: Partial<HomepageContent[K]>) => {
    setContent((current) => ({ ...current, [key]: { ...current[key], ...patch } }) as HomepageContent)
    setStatus('idle')
    setMessage('修改尚未保存，请点击“保存首页”后才会更新前台。')
  }
  const setUploadState = (isUploading: boolean) => setUploadCount((count) => Math.max(0, count + (isUploading ? 1 : -1)))

  const save = async () => {
    if (readOnly || uploading) return
    setStatus('saving')
    setMessage('')
    try {
      const response = await fetch('/api/homepage', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(content) })
      const payload = await response.json().catch(() => null) as { content?: HomepageContent; error?: string } | null
      if (!response.ok || !payload?.content) throw new Error(payload?.error || '保存失败，请稍后重试。')
      setContent(payload.content)
      setStatus('saved')
      setMessage('内容已保存为新的不可变版本，并将在首页读取。')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : '保存失败，请稍后重试。')
    }
  }

  const updateCategory = (index: number, item: HomepageCategory) => update('products', { items: replaceAt(content.products.items, index, item) })
  const activeLabel = sections.find((section) => section.key === active)?.label
  const saveButton = (compact = false) => <button onClick={save} disabled={saveDisabled} className={`inline-flex items-center gap-2 rounded-lg bg-[#ff6a00] text-sm font-bold text-white hover:bg-[#e85d00] disabled:cursor-not-allowed disabled:opacity-60 ${compact ? 'px-4 py-2.5' : 'px-5 py-3'}`}>{status === 'saving' || uploading ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}{readOnly ? '只读模式' : uploading ? '图片上传中…' : '保存首页'}</button>

  return <div className="mx-auto max-w-[1440px]"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-[#e85d00]">Homepage CMS</p><h1 className="mt-1 text-3xl font-bold tracking-tight">首页内容管理</h1><p className="mt-2 max-w-3xl text-sm text-slate-500">编辑公开首页文案、图片、分类媒体与联系方式。商品目录由独立的产品后台维护，不会在此保存。</p></div><div className="flex gap-2"><a href="/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"><Eye className="size-4" />查看首页</a>{saveButton(true)}</div></div>
    {readOnly && <div className="mt-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><TriangleAlert className="mt-0.5 size-5 shrink-0" /><div><p className="font-bold">首页 CMS 当前为只读</p><p className="mt-1">未检测到 Blob 持久化配置。首页仍显示已随部署提供的基线内容，但保存和图片上传已禁用，绝不会显示为发布成功。</p></div></div>}
    <div className="mt-6 grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]"><aside className="h-fit rounded-xl border border-slate-200 bg-white p-3 lg:sticky lg:top-24"><p className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[.16em] text-slate-400">首页区块</p><nav className="space-y-1">{sections.map((section) => <button key={section.key} type="button" onClick={() => setActive(section.key)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-semibold transition ${active === section.key ? 'bg-orange-50 text-[#e85d00]' : 'text-slate-600 hover:bg-slate-50'}`}>{section.label}{active === section.key && <span className="size-2 rounded-full bg-[#ff6a00]" />}</button>)}</nav><div className="mt-5 rounded-lg bg-slate-900 p-4 text-xs leading-relaxed text-slate-300"><p className="font-bold text-orange-300">产品目录独立维护</p><p className="mt-1">新增、编辑和发布商品请前往产品后台；本编辑器不读取或写入 catalog/items。</p><Link href="/admin/products" className="mt-3 inline-block font-bold text-white underline underline-offset-2">打开 Products →</Link></div></aside><main className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:p-7"><div className="mb-7 border-b border-slate-100 pb-5"><p className="text-sm font-semibold text-[#e85d00]">编辑区块</p><h2 className="mt-1 text-2xl font-bold">{activeLabel}</h2></div><EditorFields active={active} content={content} update={update} updateCategory={updateCategory} disabled={editingDisabled || uploading} onUploadStateChange={setUploadState} /><div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-100 pt-6"><p role="status" className={`text-sm font-semibold ${status === 'error' ? 'text-red-700' : status === 'saved' ? 'text-emerald-700' : 'text-slate-500'}`}>{status === 'saved' && <Check className="mr-1 inline size-4" />}{message || (readOnly ? '配置 Blob 后即可保存首页内容。' : uploading ? '图片正在上传。上传完成后才可保存首页。' : '图片上传后仍需点击保存首页才会发布；不会覆盖商品目录。')}</p>{saveButton()}</div></main></div></div>
}

function EditorFields({ active, content, update, updateCategory, disabled, onUploadStateChange }: { active: SectionKey; content: HomepageContent; update: <K extends SectionKey>(key: K, patch: Partial<HomepageContent[K]>) => void; updateCategory: (index: number, item: HomepageCategory) => void; disabled: boolean; onUploadStateChange: (uploading: boolean) => void }) {
  if (active === 'hero') return <div className="grid gap-5 md:grid-cols-2"><Field label="顶部小标题" value={content.hero.eyebrow} disabled={disabled} onChange={(eyebrow) => update('hero', { eyebrow })} /><Field label="主标题" value={content.hero.title} disabled={disabled} onChange={(title) => update('hero', { title })} /><Field label="副标题" value={content.hero.subtitle} textarea disabled={disabled} onChange={(subtitle) => update('hero', { subtitle })} /><Field label="主按钮文字" value={content.hero.primaryCta} disabled={disabled} onChange={(primaryCta) => update('hero', { primaryCta })} /><Field label="次按钮文字" value={content.hero.secondaryCta} disabled={disabled} onChange={(secondaryCta) => update('hero', { secondaryCta })} /><HomepageImageField label="背景图片 URL" value={content.hero.image} disabled={disabled} onChange={(image) => update('hero', { image })} onUploadStateChange={onUploadStateChange} /></div>
  if (active === 'why') return <div className="space-y-5"><div className="grid gap-5 md:grid-cols-2"><Field label="小标题" value={content.why.eyebrow} disabled={disabled} onChange={(eyebrow) => update('why', { eyebrow })} /><Field label="主标题" value={content.why.title} disabled={disabled} onChange={(title) => update('why', { title })} /><Field label="描述" value={content.why.description} textarea disabled={disabled} onChange={(description) => update('why', { description })} /></div>{content.why.items.map((item, index) => <div key={index} className="rounded-lg border border-slate-200 bg-slate-50 p-4"><p className="mb-4 text-sm font-bold text-slate-500">卖点 {index + 1}</p><div className="grid gap-4 md:grid-cols-2"><Field label="标题" value={item.title} disabled={disabled} onChange={(title) => update('why', { items: replaceAt(content.why.items, index, { ...item, title }) })} /><Field label="描述" value={item.text} textarea disabled={disabled} onChange={(text) => update('why', { items: replaceAt(content.why.items, index, { ...item, text }) })} /></div></div>)}</div>
  if (active === 'products') return <div className="space-y-5"><div className="grid gap-5 md:grid-cols-2"><Field label="小标题" value={content.products.eyebrow} disabled={disabled} onChange={(eyebrow) => update('products', { eyebrow })} /><Field label="主标题" value={content.products.title} disabled={disabled} onChange={(title) => update('products', { title })} /><Field label="描述" value={content.products.description} textarea disabled={disabled} onChange={(description) => update('products', { description })} /></div>{content.products.items.map((item, index) => <div key={item.slug} className="rounded-lg border border-slate-200 bg-slate-50 p-4"><p className="mb-4 text-sm font-bold text-slate-500">分类 {index + 1} · {item.slug}</p><div className="grid gap-4 md:grid-cols-2"><Field label="名称" value={item.name} disabled={disabled} onChange={(name) => updateCategory(index, { ...item, name })} /><Field label="描述" value={item.text} textarea disabled={disabled} onChange={(text) => updateCategory(index, { ...item, text })} /></div><CategoryMediaEditor item={item} disabled={disabled} onChange={(next) => updateCategory(index, next)} onUploadStateChange={onUploadStateChange} /></div>)}</div>
  if (active === 'oem') return <div className="space-y-5"><div className="grid gap-5 md:grid-cols-2"><Field label="小标题" value={content.oem.eyebrow} disabled={disabled} onChange={(eyebrow) => update('oem', { eyebrow })} /><Field label="主标题" value={content.oem.title} disabled={disabled} onChange={(title) => update('oem', { title })} /><Field label="描述" value={content.oem.description} textarea disabled={disabled} onChange={(description) => update('oem', { description })} /><HomepageImageField label="图片 URL" value={content.oem.image} disabled={disabled} onChange={(image) => update('oem', { image })} onUploadStateChange={onUploadStateChange} /><Field label="统计数值" value={content.oem.statValue} disabled={disabled} onChange={(statValue) => update('oem', { statValue })} /><Field label="统计标签" value={content.oem.statLabel} disabled={disabled} onChange={(statLabel) => update('oem', { statLabel })} /><Field label="按钮文字" value={content.oem.cta} disabled={disabled} onChange={(cta) => update('oem', { cta })} /></div>{content.oem.services.map((item, index) => <div key={index} className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-2"><Field label={`服务 ${index + 1} 标题`} value={item.title} disabled={disabled} onChange={(title) => update('oem', { services: replaceAt(content.oem.services, index, { ...item, title }) })} /><Field label="说明" value={item.text} textarea disabled={disabled} onChange={(text) => update('oem', { services: replaceAt(content.oem.services, index, { ...item, text }) })} /></div>)}</div>
  if (active === 'factory') return <div className="space-y-5"><div className="grid gap-5 md:grid-cols-2"><Field label="小标题" value={content.factory.eyebrow} disabled={disabled} onChange={(eyebrow) => update('factory', { eyebrow })} /><Field label="主标题" value={content.factory.title} disabled={disabled} onChange={(title) => update('factory', { title })} /><Field label="描述" value={content.factory.description} textarea disabled={disabled} onChange={(description) => update('factory', { description })} /><HomepageImageField label="图片 URL" value={content.factory.image} disabled={disabled} onChange={(image) => update('factory', { image })} onUploadStateChange={onUploadStateChange} /></div>{content.factory.stats.map((item, index) => <div key={index} className="grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 md:grid-cols-2"><Field label={`数据 ${index + 1}`} value={item.value} disabled={disabled} onChange={(value) => update('factory', { stats: replaceAt(content.factory.stats, index, { ...item, value }) })} /><Field label="标签" value={item.label} disabled={disabled} onChange={(label) => update('factory', { stats: replaceAt(content.factory.stats, index, { ...item, label }) })} /></div>)}</div>
  if (active === 'about') return <div className="space-y-5"><div className="grid gap-5 md:grid-cols-2"><Field label="小标题" value={content.about.eyebrow} disabled={disabled} onChange={(eyebrow) => update('about', { eyebrow })} /><Field label="公司标题" value={content.about.title} disabled={disabled} onChange={(title) => update('about', { title })} /><Field label="公司介绍" value={content.about.description} textarea disabled={disabled} onChange={(description) => update('about', { description })} /><HomepageImageField label="图片 URL" value={content.about.image} disabled={disabled} onChange={(image) => update('about', { image })} onUploadStateChange={onUploadStateChange} /><Field label="按钮文字" value={content.about.cta} disabled={disabled} onChange={(cta) => update('about', { cta })} /></div>{content.about.highlights.map((highlight, index) => <Field key={index} label={`要点 ${index + 1}`} value={highlight} disabled={disabled} onChange={(value) => update('about', { highlights: replaceAt(content.about.highlights, index, value) })} />)}</div>
  if (active === 'testimonials') return <div className="space-y-5"><div className="grid gap-5 md:grid-cols-2"><Field label="小标题" value={content.testimonials.eyebrow} disabled={disabled} onChange={(eyebrow) => update('testimonials', { eyebrow })} /><Field label="主标题" value={content.testimonials.title} disabled={disabled} onChange={(title) => update('testimonials', { title })} /></div>{content.testimonials.items.map((item, index) => <div key={index} className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4"><p className="text-sm font-bold text-slate-500">评价 {index + 1}</p><Field label="评价内容" value={item.quote} textarea disabled={disabled} onChange={(quote) => update('testimonials', { items: replaceAt(content.testimonials.items, index, { ...item, quote }) })} /><div className="grid gap-4 md:grid-cols-2"><Field label="客户姓名" value={item.name} disabled={disabled} onChange={(name) => update('testimonials', { items: replaceAt(content.testimonials.items, index, { ...item, name }) })} /><Field label="职位/公司" value={item.role} disabled={disabled} onChange={(role) => update('testimonials', { items: replaceAt(content.testimonials.items, index, { ...item, role })})} /></div></div>)}</div>
  return <div className="grid gap-5 md:grid-cols-2"><Field label="小标题" value={content.contact.eyebrow} disabled={disabled} onChange={(eyebrow) => update('contact', { eyebrow })} /><Field label="主标题" value={content.contact.title} disabled={disabled} onChange={(title) => update('contact', { title })} /><Field label="描述" value={content.contact.description} textarea disabled={disabled} onChange={(description) => update('contact', { description })} /><Field label="邮箱" type="email" value={content.contact.email} disabled={disabled} onChange={(email) => update('contact', { email })} /><Field label="WhatsApp" value={content.contact.whatsapp} disabled={disabled} onChange={(whatsapp) => update('contact', { whatsapp })} /><Field label="WhatsApp 链接" type="url" value={content.contact.whatsappLink} disabled={disabled} onChange={(whatsappLink) => update('contact', { whatsappLink })} /><Field label="地址" value={content.contact.address} textarea disabled={disabled} onChange={(address) => update('contact', { address })} /></div>
}
