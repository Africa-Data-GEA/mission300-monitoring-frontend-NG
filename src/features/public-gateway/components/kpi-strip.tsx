import type { KpiFigure } from '../lib/headline-figures'
import { KpiCard } from './kpi-card'
import { SectionHeading } from './section-heading'

/**
 * The national headline strip — the four Compact outcomes, side by side.
 *
 * DIVIDERS ARE THE GAP. The grid has a 1px gap over a border-coloured
 * background, so the rules between cells are the gap itself. That is what makes
 * four cards read as one instrument: there is no gutter, no shadow and no
 * rounding to separate them, only a hairline, exactly as a printed statistical
 * table separates its columns.
 *
 * Two columns before four, never three: three columns leaves one card orphaned
 * on its own row, which visually promotes whichever figure lands there.
 */
export function KpiStrip({ figures }: { figures: readonly KpiFigure[] }) {
  return (
    <section aria-labelledby="latest-figures" className="mt-10">
      <SectionHeading
        id="latest-figures"
        index="01"
        title="Latest published figures"
        controls={
          <p className="max-w-[20rem] text-[0.8125rem] leading-5 text-text-muted">
            The four outcomes tracked by the Compact Progress Report.
          </p>
        }
      />

      <div className="mt-px grid gap-px bg-border-strong sm:grid-cols-2 xl:grid-cols-4">
        {figures.map((figure) => (
          <KpiCard key={figure.id} figure={figure} />
        ))}
      </div>
    </section>
  )
}
