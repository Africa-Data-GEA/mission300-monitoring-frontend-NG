import type { ReactNode } from 'react'

/**
 * The heading block that opens each analysis section.
 *
 * A section number, the title on a heavy rule, and room for controls. The
 * numbering gives a reader citing this page in a briefing a way to say *which*
 * part they are quoting, and makes the page's argument — how much, how, where,
 * who — legible as a sequence rather than a stack of charts.
 *
 * `description` IS THE EXCEPTION, NOT THE RULE. An earlier version gave every
 * section a sentence explaining itself, which turned the page into prose
 * interrupted by charts. A title that needs a sentence underneath is usually a
 * title that should be better. Use it only where the section makes a
 * methodological claim the reader cannot get from the figures — currently one
 * place, the state table, which has to say what it is NOT measuring.
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
        <h2
          id={id}
          className="flex items-baseline gap-3 text-[1.5rem] leading-8 font-bold tracking-tight text-text-default"
        >
          <span aria-hidden="true" className="text-[1rem] font-bold text-landing-blue tabular-nums">
            {index}
          </span>
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 max-w-[46rem] text-[0.8125rem] leading-5 text-text-muted">
            {description}
          </p>
        )}
      </div>
      {controls && <div className="shrink-0 pb-1">{controls}</div>}
    </div>
  )
}
