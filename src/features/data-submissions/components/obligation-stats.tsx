import type { ObligationStats } from '@/api/schemas/data-submissions'
import { Card } from '@/components/ui/card'
import { InfoPopover } from '@/components/ui/info-popover'

const TONE_DOT: Record<string, string> = {
  danger: 'bg-status-at-risk',
  warning: 'bg-status-lagging',
  success: 'bg-status-on-track',
  info: 'bg-chart-blue-dark',
  neutral: 'bg-status-no-data',
}

/**
 * Aggregate data-operations indicators above the obligations table.
 *
 * Review asked for these — count by status, average days overdue and similar
 * — and specifically that they respond to the dataset / responsible
 * organisation filters (docs/M300 Monitoring Platform Feedback.pptx,
 * slide 13). They are computed server-side over the filtered set, so they
 * describe the current filter rather than the visible page.
 *
 * One flat row of stat groups rather than three separate nested cards — the
 * three-card layout read as oversized for what is a glance-level strip, not
 * a dashboard section of its own.
 */
export function ObligationStats({ stats }: { stats: ObligationStats }) {
  if (stats.total === 0) return null

  return (
    <Card className="flex flex-wrap items-center gap-x-5 gap-y-2 px-3 py-2">
      <div className="flex items-center gap-1">
        <span className="text-2xs font-medium tracking-wide text-text-subtle uppercase">Data operations</span>
        <InfoPopover
          label="About these data-operations indicators"
          provenance={{
            definition:
              'Counts and averages across every obligation matching the current filters — not only the rows on this page. ' +
              '"Open" excludes obligations already accepted, approved or provisionally approved.',
            methodology:
              'Days overdue is read from each obligation’s own stated due label, so these figures always agree with the ' +
              'row beneath them.',
            source: 'Reporting obligations register.',
            lastUpdated: '2026-10-01T00:00:00Z',
          }}
        />
      </div>

      <div className="h-6 w-px shrink-0 bg-border-default" aria-hidden="true" />

      <div className="flex items-baseline gap-1.5">
        <span className="text-lg font-semibold text-text-default">{stats.openCount}</span>
        <span className="text-xs text-text-muted">open of {stats.total}</span>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-lg font-semibold text-text-default">{stats.overdueCount}</span>
        <span className="text-xs text-text-muted">
          overdue
          {stats.averageDaysOverdue !== null && ` · ${stats.averageDaysOverdue}d avg`}
        </span>
      </div>

      <div className="h-6 w-px shrink-0 bg-border-default" aria-hidden="true" />

      <ul className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {stats.byStatus.map((entry) => (
          <li key={entry.code} className="flex items-center gap-1.5 text-xs">
            <span
              aria-hidden="true"
              className={`size-1.5 shrink-0 rounded-full ${TONE_DOT[entry.tone] ?? TONE_DOT.neutral}`}
            />
            <span className="text-text-muted">{entry.label}</span>
            <span className="font-semibold text-text-default">{entry.count}</span>
          </li>
        ))}
      </ul>
    </Card>
  )
}
