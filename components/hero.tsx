import Image from 'next/image'
import { ArrowRight } from 'lucide-react'

export function Hero() {
  return (
    <section id="home" className="px-3 pt-3 lg:px-5 lg:pt-5">
      <div className="relative isolate overflow-hidden rounded-3xl">
        <Image
          src="/images/hero.png"
          alt="Golden retriever playing with a blue rubber dog toy on the grass"
          fill
          priority
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy/85 via-navy/55 to-transparent" />

        <div className="mx-auto flex min-h-[560px] max-w-7xl flex-col justify-center px-6 py-20 lg:min-h-[680px] lg:px-12">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur">
              <span className="size-2 rounded-full bg-sky-300" aria-hidden="true" />
              12+ Years Experience · OEM & ODM · Factory Direct
            </span>
            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl lg:text-6xl">
             12+ Years Experience · OEM & ODM · Factory Direct
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/85 md:text-xl">
             Manufacturing premium plush, rubber, rope and interactive dog toys for pet brands worldwide since 2012.
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href="#products"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/30"
              >
                Explore Products
                <ArrowRight className="size-4" aria-hidden="true" />
              </a>
              <a
                href="#contact"
                className="inline-flex items-center rounded-full bg-white px-7 py-3.5 font-semibold text-navy transition-all hover:-translate-y-0.5 hover:shadow-xl"
              >
                Explore Products
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
