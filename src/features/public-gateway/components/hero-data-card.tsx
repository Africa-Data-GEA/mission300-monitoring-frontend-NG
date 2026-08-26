export interface HeroDataRow {
  readonly label: string
  readonly value: string
}

/**
 * The white card inside the hero band, carrying the record's own citation:
 * what period it covers, who published it, when it was last updated.
 *
 * WHY IT IS IN THE HERO AND NOT THE FOOTER. On a statistical publication the
 * provenance is not small print — it is the first thing a professional reader
 * checks, and it decides whether the rest of the page is usable. A journalist
 * who has to scroll to the footer for the reporting period will publish
 * without it.
 *
 * THREE ROWS, LABELLED IN ONE WORD EACH. This card earns its place by being
 * glanceable. An earlier version ran five rows with sentence-length values and
 * a list of jump links underneath, which made the one element that must be
 * absorbed instantly into the densest block on the page. Anything that needs a
 * sentence belongs in the body, not here.
 */
export function HeroDataCard({ rows }: { rows: readonly HeroDataRow[] }) {
  return (
    <aside
      aria-label="About this record"
      className="w-full border border-white/10 bg-surface p-5 shadow-[0_18px_40px_rgba(0,0,0,0.28)] lg:w-[19rem] lg:shrink-0"
    >
      <dl className="flex flex-col divide-y divide-border-default">
        {rows.map((row, index) => (
          <div
            key={row.label}
            className={`flex items-baseline justify-between gap-4 ${index === 0 ? 'pb-2.5' : 'py-2.5 last:pb-0'}`}
          >
            <dt className="shrink-0 text-[0.6875rem] leading-4 font-bold tracking-[0.1em] text-text-subtle uppercase">
              {row.label}
            </dt>
            <dd className="min-w-0 text-right text-[0.8125rem] leading-5 font-medium text-text-default">
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  )
}
