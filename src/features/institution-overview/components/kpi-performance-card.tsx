import type { InstitutionKpi } from '@/api/schemas/institution-overview'
import { Card } from '@/components/ui/card'

const TRACK_CLASSES: Record<'on-track' | 'off-track' | 'unknown', string> = {
  'on-track': 'text-status-on-track',
  'off-track': 'text-status-at-risk',
  unknown: 'text-text-muted',
}

function trackState(onTrack: boolean | null): 'on-track' | 'off-track' | 'unknown' {
  if (onTrack === null) return 'unknown'
  return onTrack ? 'on-track' : 'off-track'
}

export function KpiPerformanceCard({ kpi }: { kpi: InstitutionKpi }) {
  const state = trackState(kpi.onTrack)

  return (
    <Card variant="well" className="p-4">
      <p className="text-xs font-medium text-text-subtle uppercase tracking-wide">{kpi.pillar}</p>
      <p className="mt-1 text-sm font-semibold text-text-default">{kpi.name}</p>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span className="text-2xl font-semibold text-text-default">{kpi.value.toLocaleString()}</span>
        <span className="text-xs text-text-muted">{kpi.unit}</span>
      </div>
      <p className={`mt-1 text-xs font-medium ${TRACK_CLASSES[state]}`}>
        {kpi.target !== null
          ? `${state === 'unknown' ? 'Target' : state === 'on-track' ? 'On track for' : 'Off track from'} ${kpi.targetLabel ?? kpi.target.toLocaleString()}`
          : 'No target set'}
      </p>
      <p className="mt-1 text-xs text-text-muted">{kpi.period}</p>
    </Card>
  )
}
