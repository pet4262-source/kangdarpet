import Image from 'next/image'
import { SectionHeading } from './section-heading'

const stats = [
  { value: '12+', label: 'Years Experience' },
  { value: '4800㎡', label: 'Factory Area' },
  { value: '50+', label: 'Skilled Workers' },
  { value: '30+', label: 'Export Countries' },
]

export function FactorySection() {
  return (
    <section id="factory" className="px-3 lg:px-5">
      <div className="overflow-hidden rounded-3xl bg-navy">
        <div className="mx-auto max-w-7xl px-5 py-24 lg:px-8">
          <SectionHeading
            invert
            eyebrow="Factory Overview"
            title="Professional Dog Toy Manufacturing Factory"
            description="Since 2012, KANGDARPET has specialized in manufacturing high-quality dog toys with advanced equipment, strict quality control and reliable worldwide delivery."
          <div className="relative mt-14 aspect-[16/7] overflow-hidden rounded-3xl">
            <Image
              src="/images/factory.png"
              alt="KANGDARPET dog toy production floor with workers"
              fill
              sizes="(min-width: 1280px) 1216px, 100vw"
              className="object-cover"
            />
          </div>
          <dl className="mt-10 grid grid-cols-2 gap-5 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:bg-white/10"
              >
                <dt className="sr-only">{stat.label}</dt>
                <dd>
                  <span className="block font-heading text-3xl font-extrabold text-white md:text-4xl">
                    {stat.value}
                  </span>
                  <span className="mt-2 block text-sm font-medium text-sky-200">{stat.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
