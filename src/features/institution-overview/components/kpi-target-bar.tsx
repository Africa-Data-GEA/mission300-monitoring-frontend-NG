import { Target } from 'lucide-react'
import type { InstitutionKpi } from '@/api/schemas/institution-overview'
import { cn } from '@/lib/utils'

const FILL_STYLES = {
  'on-track': 'bg-status-on-track',
  'off-track': 'bg-status-at-risk',
  'no-target': 'bg-status-no-data',
}

function progressOf(kpi: InstitutionKpi, target: number): number {
  if (target <= 0 || kpi.value <= 0) return 0
  const ratio = kpi.direction === 'lower-is-better' ? target / kpi.value : kpi.value / target
  return Math.min(100, Math.max(0, ratio * 100))
}

function formatTarget(kpi: InstitutionKpi, target: number): string {
  const unit = kpi.unit === '%' ? '%' : ` ${kpi.unit}`
  return `${target.toLocaleString()}${unit}`
}

export function KpiTargetBar({ kpi, status }: { kpi: InstitutionKpi; status: keyof typeof FILL_STYLES }) {
  if (kpi.target === null) {
    return <p className="text-xs text-text-muted">No approved target</p>
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-xs">
        <span className="inline-flex items-center gap-1 text-text-muted">
          <Target className="size-3.5" aria-hidden />
          Target
        </span>
        <span className="font-semibold text-text-default tabular-nums">{formatTarget(kpi, kpi.target)}</span>
      </div>
      <div
        role="progressbar"
        aria-label={`Progress toward target of ${formatTarget(kpi, kpi.target)}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progressOf(kpi, kpi.target))}
        className="h-1.5 w-full overflow-hidden rounded-pill bg-status-no-data-bg"
      >
        <div
          className={cn('h-full rounded-pill', FILL_STYLES[status])}
          style={{ width: `${progressOf(kpi, kpi.target)}%` }}
        />
      </div>
    </div>
  )
}
