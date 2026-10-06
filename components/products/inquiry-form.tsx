'use client'

import { FormEvent, useRef, useState } from 'react'
import { Loader2, Send } from 'lucide-react'

export function InquiryForm({ productSlug, productName }: { productSlug: string; productName: string }) {
  const startedAt = useRef(Date.now())
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setStatus('sending'); setMessage('')
    const form = new FormData(event.currentTarget)
    try {
      const response = await fetch('/api/inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productSlug, startedAt: startedAt.current, name: form.get('name'), email: form.get('email'), company: form.get('company'), phone: form.get('phone'), country: form.get('country'), message: form.get('message'), website: form.get('website') }) })
      const body = await response.json()
      if (!response.ok) throw new Error(body.error || 'Unable to send your inquiry.')
      event.currentTarget.reset(); setStatus('success'); setMessage(`Thank you — our wholesale team received your inquiry about ${productName}.`)
    } catch (error) { setStatus('error'); setMessage(error instanceof Error ? error.message : 'Unable to send your inquiry.') }
  }
  return <form onSubmit={submit} className="rounded-2xl border border-border bg-card p-5 shadow-sm"><p className="text-sm font-semibold uppercase tracking-widest text-primary">Send inquiry</p><h2 className="mt-1 font-heading text-2xl font-extrabold text-navy">Request wholesale details</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">Tell us your target market, customization needs and expected quantity. We will reply by email.</p><input name="website" tabIndex={-1} autoComplete="off" className="absolute -left-[10000px] opacity-0" aria-hidden="true" /><div className="mt-5 grid gap-3 sm:grid-cols-2"><Input name="name" label="Your name" required /><Input name="email" label="Business email" type="email" required /><Input name="company" label="Company" /><Input name="phone" label="Phone / WhatsApp" /><Input name="country" label="Country" /></div><label className="mt-3 block text-xs font-semibold text-navy">What do you need?<textarea required minLength={15} name="message" rows={4} placeholder="For example: logo customization, colors, annual quantity and required delivery date." className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" /></label>{message && <p role="status" className={`mt-3 rounded-lg px-3 py-2 text-sm ${status === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{message}</p>}<button disabled={status === 'sending'} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:opacity-90 disabled:opacity-60">{status === 'sending' ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}{status === 'sending' ? 'Sending inquiry…' : 'Send inquiry'}</button><p className="mt-3 text-center text-[11px] leading-relaxed text-muted-foreground">We use your details only to respond to this wholesale inquiry.</p></form>
}
function Input({ label, name, type = 'text', required = false }: { label: string; name: string; type?: string; required?: boolean }) { return <label className="block text-xs font-semibold text-navy">{label}<input required={required} name={name} type={type} className="mt-1.5 w-full rounded-lg border border-border px-3 py-2 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" /></label> }
