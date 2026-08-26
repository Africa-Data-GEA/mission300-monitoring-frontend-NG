import type { StateCoverageRow as StateRow } from '@/api/schemas/state-disco'
import { InfoPopover } from '@/components/ui/info-popover'

/** One quiet, scan-friendly row in the public state ranking. */
export function StateCoverageRow({
  row,
  rank,
  asOf,
}: {
  row: StateRow
  rank: number
  asOf: string
}) {
  const confirmed = row.validationLabel.toLowerCase() === 'confirmed'

  return (
    <article className="grid gap-x-5 gap-y-3 border-b border-white/12 px-1 py-5 last:border-b-0 sm:grid-cols-[2rem_11rem_minmax(0,1fr)_auto] sm:items-center sm:px-2">
      <p className="text-[0.75rem] leading-5 font-medium text-white/35 tabular-nums">
        {String(rank).padStart(2, '0')}
      </p>

      <div>
        <h3 className="text-[0.9375rem] leading-5 font-semibold text-white">{row.state}</h3>
        <p className="mt-0.5 text-[0.6875rem] leading-4 text-white/45">{row.zone}</p>
      </div>

      <div className="min-w-0 sm:px-2">
        <div className="flex items-center gap-3">
          <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/12">
            <div
              className="h-full rounded-full bg-landing-gold"
              style={{ width: `${Math.min(100, row.coverageBarPercent)}%` }}
            />
          </div>
          <p className="font-landing-figure w-12 shrink-0 text-right text-[1.25rem] leading-6 font-semibold text-white tabular-nums">
            {row.coverageBarPercent.toFixed(0)}<span className="text-landing-gold">%</span>
          </p>
        </div>
        <p className="mt-2 text-[0.6875rem] leading-4 text-white/48">
          <span className="font-semibold text-white/82">{row.miniGridConnections}</span> mini-grid
          <span className="mx-2 text-white/20">·</span>
          <span className="font-semibold text-white/82">{row.solarHomeSystems}</span> solar homes
          <span className="mx-2 text-white/20">·</span>
          <span className="font-semibold text-white/82">{row.activeProjects}</span> projects
          <span className="mx-1 text-white/20">/</span>
          <span className="font-semibold text-white/82">{row.activeProgrammes}</span> programmes
        </p>
      </div>

      <div className="flex items-center gap-2 sm:justify-end">
        <span
          aria-hidden="true"
          className={`size-1.5 rounded-full ${confirmed ? 'bg-landing-blue' : 'bg-landing-gold'}`}
        />
        <span className="text-[0.6875rem] leading-4 font-medium text-white/50">
          {row.validationLabel}
        </span>
        <InfoPopover
          label={`About ${row.state}'s coverage figure`}
          provenance={{
            definition: `${row.state}'s validated distributed-energy delivery coverage.`,
            methodology: 'Connection counts are not converted into an inferred state electricity-access rate.',
            source: row.validatedBy ? `Validated by ${row.validatedBy}` : row.validationLabel,
            lastUpdated: row.validatedAt ?? asOf,
          }}
          details={[
            { label: 'Open bottlenecks', value: row.openBottlenecks },
            { label: 'Active programmes', value: row.activeProgrammes },
          ]}
          className="[&_button]:text-white/55 [&_button:hover]:text-white"
        />
      </div>
    </article>
  )
}
