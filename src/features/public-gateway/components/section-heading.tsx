import type { ReactNode } from 'react'

/**
 * The heading block that opens each analysis section.
 *
 * A numbered eyebrow, the section title on a heavy rule, one sentence of what
 * the section answers, and room for section-level controls on the right. The
 * numbering is not decoration: it gives a reader citing this page in a briefing
 * a way to say *which* part of it they are quoting, and it makes the page's
 * argument — how much, how, where, who — legible as a sequence rather than as
 * a stack of charts.
 */
export function SectionHeading({
  id,
  index,
  title,
  description,
  controls,
}: {
  id: string
  /** Two-digit section number, e.g. "02". */
  index: string
  title: string
  description?: string
  controls?: ReactNode
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b-2 border-text-default pb-3">
      <div className="min-w-0">
        <p className="text-[0.6875rem] leading-4 font-bold tracking-[0.14em] text-brand-600 uppercase">
          {index} — Mission 300 Nigeria
        </p>
        <h2
          id={id}
          className="mt-1.5 text-[1.5rem] leading-8 font-bold tracking-tight text-text-default"
        >
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 max-w-[46rem] text-[0.9375rem] leading-6 text-text-muted">
            {description}
          </p>
        )}
      </div>
      {controls && <div className="shrink-0 pb-1">{controls}</div>}
    </div>
  )
}
