import { Mail, MapPin, MessageCircle } from 'lucide-react'
import { SectionHeading } from './section-heading'
import type { HomepageContact } from '@/lib/homepage-types'

export function ContactSection({ content }: { content: HomepageContact }) {
  const items = [
    { icon: Mail, label: 'Email', value: content.email, href: `mailto:${content.email}` },
    { icon: MessageCircle, label: 'WhatsApp', value: content.whatsapp, href: content.whatsappLink },
    { icon: MapPin, label: 'Address', value: content.address },
  ]
  return (
    <section id="contact" className="bg-secondary py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <SectionHeading
          eyebrow={content.eyebrow}
          title={content.title}
          description={content.description}
        />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {items.map(({ icon: Icon, label, value, href }) => {
            const content = (
              <>
                <span className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                  <Icon className="size-6" />
                </span>

                <h3 className="mt-6 text-lg font-bold text-navy">
                  {label}
                </h3>

                <p className="mt-2 text-muted-foreground">
                  {value}
                </p>
              </>
            )

            const className =
              'flex flex-col items-center rounded-3xl bg-card p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10'

            return href ? (
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className={className}
              >
                {content}
              </a>
            ) : (
              <div key={label} className={className}>
                {content}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
