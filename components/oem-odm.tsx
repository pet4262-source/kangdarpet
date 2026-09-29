import Image from 'next/image'
import { Boxes, Package, PenTool, Tag } from 'lucide-react'
import { SectionHeading } from './section-heading'

const services = [
  {
    icon: Tag,
    title: 'Custom Logo',
    text: 'Custom logo printing, embroidery and woven labels for your brand.',
  },
  {
    icon: Package,
    title: 'Custom Packaging',
    text: 'Customized packaging including hang tags, color boxes and display cartons.',
  },
  {
    icon: PenTool,
    title: 'OEM & ODM Development',
    text: 'From concept design and sampling to mass production.',
  },
  {
    icon: Boxes,
    title: 'Flexible MOQ',
    text: 'Competitive minimum order quantity with stable production capacity.',
  },
]

export function OemOdm() {
  return (
    <section
      id="oem-odm"
      className="mx-auto max-w-7xl px-5 py-24 lg:px-8"
    >
      <div className="grid items-center gap-14 lg:grid-cols-2">

        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl sm:aspect-[4/3] lg:aspect-[4/5]">

          <Image
            src="/images/oem.png"
            alt="Custom branded dog toy packaging and design samples"
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
          />

          <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/90 p-5 backdrop-blur sm:right-auto">

            <p className="font-heading text-3xl font-extrabold text-primary">
              500+
            </p>

            <p className="text-sm font-medium text-navy">
              OEM Projects Completed
            </p>

          </div>

        </div>


        {/* Content */}
        <div>

          <SectionHeading
            align="left"
            eyebrow="OEM & ODM"
            title="Professional OEM & ODM Dog Toy Manufacturing"
            description="We provide one-stop OEM & ODM services including product development, custom logo, packaging design, sampling, manufacturing and worldwide export."
          />


          <div className="mt-10 grid gap-5 sm:grid-cols-2">

            {services.map(({ icon: Icon, title, text }) => (

              <div
                key={title}
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

            ))}

          </div>


          <a
            href="#contact"
            className="mt-10 inline-flex rounded-full bg-primary px-7 py-3.5 font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/25"
          >
            Request OEM Quote
          </a>


        </div>

      </div>

    </section>
  )
}
