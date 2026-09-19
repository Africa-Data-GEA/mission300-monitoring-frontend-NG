import { Link } from 'react-router'
import type { InstitutionOverview } from '@/api/schemas/institution-overview'
import { Card } from '@/components/ui/card'
import { WorkflowStatusBadge } from '@/features/data-submissions/components/workflow-status'

const TONE_DOT: Record<string, string> = {
  danger: 'bg-status-at-risk',
  warning: 'bg-status-lagging',
  success: 'bg-status-on-track',
  info: 'bg-chart-blue-dark',
  neutral: 'bg-status-no-data',
}

function StatTile({ value, label, tone }: { value: number; label: string; tone: 'default' | 'danger' | 'success' }) {
  const valueClass =
    tone === 'danger' ? 'text-status-at-risk' : tone === 'success' ? 'text-status-on-track' : 'text-text-default'
  return (
    <div className="flex-1 rounded-card border border-border-default bg-white px-4 py-3">
      <p className={`text-2xl font-semibold tracking-tight tabular-nums ${valueClass}`}>{value}</p>
      <p className="mt-0.5 text-xs text-text-muted">{label}</p>
    </div>
  )
}

export function ObligationSummaryCard({ obligations }: { obligations: InstitutionOverview['obligations'] }) {
  const { summary, recent } = obligations

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-text-default">Reporting compliance</h2>
        <Link to="/data-submissions/obligations" className="text-xs font-medium text-link underline underline-offset-4">
          View all obligations →
        </Link>
      </div>

      <div className="mt-3 flex flex-wrap gap-3">
        <StatTile value={summary.fulfilledCount} label="Fulfilled" tone="success" />
        <StatTile value={summary.overdueCount} label="Overdue" tone="danger" />
        <StatTile value={summary.total} label="Open" tone="default" />
      </div>

      {summary.byStatus.length > 0 && (
        <ul className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
          {summary.byStatus.map((entry) => (
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
      )}

      {recent.length > 0 && (
        <div className="mt-3 space-y-2">
          {recent.map((row) => (
            <div
              key={row.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border-default bg-surface p-3"
            >
              <div>
                <p className="text-sm font-medium text-text-default">
                  {row.dataset} · {row.reportingPeriod}
                </p>
                <p className="mt-0.5 text-xs text-text-muted">{row.dueLabel}</p>
              </div>
              <WorkflowStatusBadge status={row.status} />
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
