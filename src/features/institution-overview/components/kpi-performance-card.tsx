import type { InstitutionKpi } from '@/api/schemas/institution-overview'
import { Card } from '@/components/ui/card'
import { PILLAR_LABELS } from '@/types/domain'
import { cn } from '@/lib/utils'
import { KpiTargetBar } from './kpi-target-bar'

const STATUS_STYLES: Record<'on-track' | 'off-track' | 'no-target', { label: string; className: string }> = {
  'on-track': { label: 'On track', className: 'bg-status-on-track-bg text-status-on-track' },
  'off-track': { label: 'Off track', className: 'bg-status-at-risk-bg text-status-at-risk' },
  'no-target': { label: 'No target', className: 'bg-status-no-data-bg text-status-no-data' },
}

function statusOf(onTrack: boolean | null): 'on-track' | 'off-track' | 'no-target' {
  if (onTrack === null) return 'no-target'
  return onTrack ? 'on-track' : 'off-track'
}

function formatPeriod(period: string): string {
  const match = /^q([1-4])-(\d{4})$/i.exec(period)
  return match ? `Q${match[1]} ${match[2]}` : period
}

export function KpiPerformanceCard({ kpi }: { kpi: InstitutionKpi }) {
  const status = statusOf(kpi.onTrack)
  const { label, className } = STATUS_STYLES[status]

  return (
    <Card className="flex h-full flex-col p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-2xs font-semibold tracking-wide text-text-subtle uppercase">
          {PILLAR_LABELS[kpi.pillar]}
        </p>
        <span className={cn('inline-flex shrink-0 rounded-pill px-2 py-0.5 text-2xs font-medium whitespace-nowrap', className)}>
          {label}
        </span>
      </div>

      <p title={kpi.name} className="mt-1.5 line-clamp-2 min-h-9 text-sm font-medium text-text-default">
        {kpi.name}
      </p>

      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold tracking-tight text-text-default tabular-nums">
          {kpi.value.toLocaleString()}
        </span>
        <span className="text-xs text-text-muted">{kpi.unit}</span>
      </div>

      <div className="mt-auto pt-2">
        <KpiTargetBar kpi={kpi} status={status} />
        <p className="mt-1.5 text-2xs text-text-subtle">{formatPeriod(kpi.period)}</p>
      </div>
    </Card>
  )
}
