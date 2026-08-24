import type { StateCoverageRow as StateRow } from '@/api/schemas/state-disco'
import { InfoPopover } from '@/components/ui/info-popover'

/**
 * One state in the coverage table.
 *
 * THE BAR AND THE NUMBER TOGETHER. The percentage is the value a reader quotes;
 * the bar is what lets them scan forty rows and see the distribution without
 * reading any of them. Neither substitutes for the other, so both are in the
 * same cell rather than the bar replacing the figure.
 *
 * The rank is shown because the section's whole question is comparative — a
 * state commissioner is asking where they sit, not only what their number is.
 */
export function StateCoverageRow({
  row,
  rank,
  asOf,
}: {
  row: StateRow
  rank: number
  /** The page's own snapshot date, used where a state has nothing validated of
   * its own yet — not an invented date. */
  asOf: string
}) {
  return (
    <tr className="border-b border-border-default align-middle">
      <td className="py-3 pr-3 text-[0.8125rem] leading-5 font-semibold text-text-subtle tabular-nums">
        {rank}
      </td>
      <td className="py-3 pr-4">
        <p className="text-[0.875rem] leading-5 font-bold text-text-default">{row.state}</p>
        <p className="text-[0.75rem] leading-4 text-text-muted">{row.zone}</p>
      </td>
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2.5">
          <span className="h-2 w-full min-w-16 max-w-40 flex-1 bg-surface-sunken">
            <span
              className="block h-2 bg-brand-600"
              style={{ width: `${Math.min(100, row.coverageBarPercent)}%` }}
            />
          </span>
          <span className="w-10 shrink-0 text-right text-[0.875rem] leading-5 font-bold text-text-default tabular-nums">
            {row.coverageBarPercent.toFixed(0)}%
          </span>
        </div>
      </td>
      <td className="hidden py-3 pr-4 text-right text-[0.875rem] leading-5 text-text-default tabular-nums md:table-cell">
        {row.miniGridConnections}
      </td>
      <td className="hidden py-3 pr-4 text-right text-[0.875rem] leading-5 text-text-default tabular-nums md:table-cell">
        {row.solarHomeSystems}
      </td>
      <td className="hidden py-3 pr-4 text-right text-[0.875rem] leading-5 text-text-default tabular-nums lg:table-cell">
        {row.activeProjects}
        <span className="ml-1 text-[0.75rem] text-text-subtle">/ {row.activeProgrammes}</span>
      </td>
      <td className="py-3 pl-1 text-right">
        <span className="inline-flex items-center gap-1.5">
          <span className="hidden text-[0.75rem] leading-4 text-text-muted sm:inline">
            {row.validationLabel}
          </span>
          <InfoPopover
            label={`About ${row.state}'s coverage figure`}
            provenance={{
              definition: `${row.state}'s validated distributed-energy delivery coverage.`,
              methodology:
                'Connection counts are not converted into an inferred state electricity-access rate.',
              source: row.validatedBy ? `Validated by ${row.validatedBy}` : row.validationLabel,
              lastUpdated: row.validatedAt ?? asOf,
            }}
            details={[
              { label: 'Open bottlenecks', value: row.openBottlenecks },
              { label: 'Active programmes', value: row.activeProgrammes },
            ]}
          />
        </span>
      </td>
    </tr>
  )
}
