import { cn } from '@/lib/utils'

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  invert = false,
}: {
  eyebrow: string
  title: string
  description?: string
  align?: 'center' | 'left'
  invert?: boolean
}) {
  return (
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center')}>
      <p className={cn('text-sm font-semibold uppercase tracking-widest', invert ? 'text-sky-300' : 'text-primary')}>
        {eyebrow}
      </p>
      <h2
        className={cn(
          'mt-3 text-3xl font-extrabold tracking-tight md:text-4xl',
          invert ? 'text-white' : 'text-navy',
        )}
      >
        {title}
      </h2>
      {description && (
        <p className={cn('mt-4 text-lg leading-relaxed', invert ? 'text-white/75' : 'text-muted-foreground')}>
          {description}
        </p>
      )}
    </div>
  )
}
