import { PawPrint } from 'lucide-react'
import { company, navLinks } from '@/lib/site'
import { readHomepageContent, type HomepageContent } from '@/lib/homepage'

type Contact = HomepageContent['contact']

export async function SiteFooter({ contact }: { contact?: Contact } = {}) {
  const details = contact ?? (await readHomepageContent()).contact
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
              <a href={`mailto:${details.email}`} className="transition-colors hover:text-white">
                {details.email}
              </a>
            </li>
            <li>
              <a href={details.whatsappLink} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-white">
                WhatsApp: {details.whatsapp}
              </a>
            </li>
            <li>{details.address}</li>
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
