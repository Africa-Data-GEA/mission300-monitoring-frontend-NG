import { PIPELINE_READINESS_LABELS, type PipelineReadiness } from '@/api/schemas/programs'
import { cn } from '@/lib/utils'

const STYLES: Record<PipelineReadiness, string> = {
  pipeline: 'bg-surface-sunken text-text-subtle',
  'feasibility-study': 'bg-status-lagging-bg text-status-lagging',
  'investment-ready': 'bg-status-on-track-bg text-status-on-track',
}

export function PipelineReadinessBadge({ readiness }: { readiness: PipelineReadiness }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-pill px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        STYLES[readiness],
      )}
    >
      {PIPELINE_READINESS_LABELS[readiness]}
    </span>
  )
}
