import { PawPrint } from 'lucide-react'
import { company, contactInfo, navLinks } from '@/lib/site'

export function SiteFooter() {
  return (
    <footer className="bg-navy text-white/75">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-16 md:grid-cols-3 lg:px-8">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <PawPrint className="size-5" aria-hidden="true" />
            </span>
            <span className="font-heading text-lg font-extrabold text-white">KANGDARPET</span>
          </div>
          <p className="mt-3 text-sm font-medium text-white">{company.legalName}</p>
          <p className="mt-4 max-w-xs leading-relaxed">
            Professional dog toy manufacturer in Nanyang, China since {company.established}, providing OEM &amp; ODM
            solutions to pet brands, wholesalers and retailers worldwide.
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 className="font-heading font-bold text-white">Quick Links</h2>
          <ul className="mt-5 grid grid-cols-2 gap-3">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="transition-colors hover:text-white">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-heading font-bold text-white">Company Info</h2>
          <ul className="mt-5 flex flex-col gap-3">
            <li>
              <a href={`mailto:${contactInfo.email}`} className="transition-colors hover:text-white">
                {contactInfo.email}
              </a>
            </li>
            <li>
              <a href={contactInfo.whatsappLink} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">
                WhatsApp: {contactInfo.whatsapp}
              </a>
            </li>
            <li>{contactInfo.address}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-5 py-6 text-sm lg:px-8">
          {`© ${new Date().getFullYear()} ${company.legalName} All rights reserved.`}
        </p>
      </div>
    </footer>
  )
}
