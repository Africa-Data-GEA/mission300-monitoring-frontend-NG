import type { StateCoverageRow } from '@/api/schemas/state-disco'
import { InfoPopover } from '@/components/ui/info-popover'

/**
 * §06 — "Delivery in motion". docs/public-gateway-home.md calls this the
 * section a state commissioner or journalist checks first: *did my state
 * get anything?* The spec's own fallback applies here: a Nigeria map was
 * the aspiration, but "if it cannot be done properly it should ship as a
 * ranked list of states rather than a broken map — a list that works beats
 * a map that does not." No map exists yet, so this is that list: every
 * state ranked by validated coverage, highest first.
 *
 * Not links yet, same reasoning as the removed Pillars section: there is
 * no public per-state page to send a reader to, and a link into the
 * authenticated /state-disco view would drop a citizen onto a login wall.
 */
export function DeliveryInMotion({
  rows,
  asOf,
}: {
  rows: readonly StateCoverageRow[]
  /** Falls back to this when a state has no `validatedAt` of its own (still
   * provisional) — the page's own data snapshot date, not an invented one. */
  asOf: string
}) {
  if (rows.length === 0) return null

  const ranked = [...rows].sort((a, b) => b.coverageBarPercent - a.coverageBarPercent)

  return (
    <section aria-labelledby="delivery-in-motion" className="mt-14">
      <h2
        id="delivery-in-motion"
        className="text-[1.5rem] leading-8 font-bold tracking-tight text-text-default"
      >
        Delivery in motion, by state
      </h2>
      <p className="mt-1 max-w-[42rem] text-[0.9375rem] leading-6 text-text-muted">
        Validated distributed-energy delivery coverage for every state with an
        approved breakdown, ranked highest first.
      </p>

      <ol className="mt-4 divide-y divide-border-strong border-t-2 border-text-default">
        {ranked.map((row, index) => (
          <li key={row.id} className="flex flex-wrap items-center gap-3 py-3">
            <span className="w-7 shrink-0 text-[0.9375rem] font-bold text-text-subtle">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[1rem] leading-6 font-bold text-text-default">
                {row.state}
                <span className="ml-2 text-[0.8125rem] font-normal text-text-muted">{row.zone}</span>
              </p>
              <p className="text-[0.8125rem] leading-5 text-text-muted">
                {row.activeProgrammes} programme{row.activeProgrammes === '1' ? '' : 's'} ·{' '}
                {row.activeProjects} project{row.activeProjects === '1' ? '' : 's'} ·{' '}
                {row.miniGridConnections} mini-grid connections · {row.solarHomeSystems} solar home systems
              </p>
            </div>

            <div className="flex w-full shrink-0 items-center gap-2 sm:w-48">
              <div className="h-2 flex-1 rounded-pill bg-surface-sunken">
                <div
                  className="h-2 rounded-pill bg-brand-700"
                  style={{ width: `${Math.min(100, row.coverageBarPercent)}%` }}
                />
              </div>
              <span className="w-11 shrink-0 text-right text-[0.9375rem] font-bold text-text-default">
                {row.coverageBarPercent.toFixed(0)}%
              </span>
            </div>

            <InfoPopover
              label={`About ${row.state}'s coverage figure`}
              provenance={{
                definition: `${row.state}'s validated distributed-energy delivery coverage.`,
                methodology: 'Connection counts are not converted into an inferred state electricity-access rate.',
                source: row.validatedBy ? `Validated by ${row.validatedBy}` : row.validationLabel,
                lastUpdated: row.validatedAt ?? asOf,
              }}
            />
          </li>
        ))}
      </ol>
    </section>
  )
}
