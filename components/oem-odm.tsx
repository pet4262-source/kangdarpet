import { Boxes, Package, PenTool, Tag } from 'lucide-react'
import { SectionHeading } from './section-heading'
import type { HomepageOem } from '@/lib/homepage-types'

const icons = [Tag, Package, PenTool, Boxes]

export function OemOdm({ content }: { content: HomepageOem }) {
  return (
    <section
      id="oem-odm"
      className="mx-auto max-w-7xl px-5 py-24 lg:px-8"
    >
      <div className="grid items-center gap-14 lg:grid-cols-2">

        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl sm:aspect-[4/3] lg:aspect-[4/5]">

          <img src={content.image} alt={content.title} className="size-full object-cover" />

          <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/90 p-5 backdrop-blur sm:right-auto">

            <p className="font-heading text-3xl font-extrabold text-primary">
              {content.statValue}
            </p>

            <p className="text-sm font-medium text-navy">
              {content.statLabel}
            </p>

          </div>

        </div>


        {/* Content */}
        <div>

          <SectionHeading
            align="left"
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.description}
          />


          <div className="mt-10 grid gap-5 sm:grid-cols-2">

            {content.services.map(({ title, text }, index) => {
              const Icon = icons[index % icons.length]
              return (

              <div
                key={`${title}-${index}`}
                className="rounded-2xl border border-border p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
              >

                <Icon
                  className="size-7 text-primary"
                  aria-hidden="true"
                />


                <h3 className="mt-4 text-lg font-bold text-navy">
                  {title}
                </h3>


                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {text}
                </p>


              </div>

              )
            })}

          </div>


          <a
            href="#contact"
            className="mt-10 inline-flex rounded-full bg-primary px-7 py-3.5 font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25"
          >
            {content.cta}
          </a>


        </div>

      </div>

    </section>
  )
}
