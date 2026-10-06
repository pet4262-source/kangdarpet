import { SectionHeading } from './section-heading'
import type { HomepageFactory } from '@/lib/homepage-types'

export function FactorySection({ content }: { content: HomepageFactory }) {
  return (
    <section id="factory" className="px-3 lg:px-5">
      <div className="overflow-hidden rounded-3xl bg-navy">
        <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8">

          <SectionHeading
            invert
            eyebrow={content.eyebrow}
            title={content.title}
            description={content.description}
          />

          <div className="relative mt-14 aspect-[16/7] overflow-hidden rounded-3xl">
            <img src={content.image} alt={content.title} className="size-full object-cover" />
          </div>

          <dl className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {content.stats.map((stat, index) => (
              <div
                key={`${stat.label}-${index}`}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:bg-white/10"
              >
                <dt className="sr-only">
                  {stat.label}
                </dt>

                <dd>
                  <span className="block font-heading text-3xl font-extrabold text-white md:text-4xl">
                    {stat.value}
                  </span>

                  <span className="mt-2 block text-sm font-medium text-sky-200">
                    {stat.label}
                  </span>
                </dd>

              </div>
            ))}
          </dl>

        </div>
      </div>
    </section>
  )
}
