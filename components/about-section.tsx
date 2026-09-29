import Image from 'next/image'
import { CheckCircle2 } from 'lucide-react'
import { company } from '@/lib/site'

const highlights = [
  `Established in ${company.established} in Nanyang, Henan, China`,
  `${company.factoryArea} factory with ${company.employees} skilled employees`,
  `Products certified to ${company.certifications.join(' and ')} requirements`,
  `Exporting to ${company.markets.slice(0, -1).join(', ')} and ${company.markets.at(-1)}`,
]

const facts = [
  { label: 'Established', value: String(company.established) },
  { label: 'Factory Area', value: company.factoryArea },
  { label: 'Employees', value: String(company.employees) },
  { label: 'Certification', value: company.certifications.join(', ') },
]

export function AboutSection() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
      <div className="grid items-center gap-14 lg:grid-cols-2">
        <div className="relative">
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl">
            <Image
              src="/images/oem.png"
              alt="KANGDARPET design team reviewing custom dog toy samples"
              fill
              sizes="(min-width: 1024px) 600px, 100vw"
              className="object-cover"
            />
          </div>
          <div className="absolute -bottom-6 right-4 rounded-2xl bg-primary px-7 py-5 text-primary-foreground shadow-xl shadow-primary/30 sm:right-8">
            <span className="block font-heading text-4xl font-extrabold">{company.established}</span>
            <span className="text-sm font-medium opacity-90">Manufacturing since</span>
          </div>
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-widest text-primary">
  About KANGDARPET
</p>
          <h2 className="mt-3 text-balance font-heading text-3xl font-extrabold text-navy md:text-4xl lg:text-5xl">
            {company.legalName}
          </h2>
          <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
  KANGDARPET is a professional dog toy manufacturer established in {company.established}.
  We specialize in plush toys, rubber toys, rope toys, interactive toys and durable chew toys.
  Our factory provides OEM & ODM manufacturing services for global pet brands, wholesalers,
  distributors and importers with reliable quality and competitive pricing.
</p>

          <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {facts.map((fact) => (
              <div key={fact.label} className="rounded-2xl border border-border bg-secondary/40 p-4">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{fact.label}</dt>
                <dd className="mt-1 font-heading text-lg font-extrabold text-navy">{fact.value}</dd>
              </div>
            ))}
          </dl>

          <ul className="mt-8 flex flex-col gap-4">
            {highlights.map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <span className="leading-relaxed text-foreground">{item}</span>
              </li>
            ))}
          </ul>
          <a
            href="#contact"
            className="mt-10 inline-flex h-12 items-center rounded-full bg-navy px-7 font-semibold text-white transition-colors hover:bg-primary"
          >
           Contact Our Team
          </a>
        </div>
      </div>
    </section>
  )
}
