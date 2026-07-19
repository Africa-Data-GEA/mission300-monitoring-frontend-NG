import { cn } from '@/lib/utils'
import type { DeliveryStatus, SourceTag } from '@/types/domain'
import type { BottleneckSeverity } from '@/features/dashboard/types'

const badgeBase =
  'inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-medium whitespace-nowrap'

/**
 * Colour and copy for each delivery status. Centralised here so that a status
 * always looks the same everywhere in the product — a reviewer can verify the
 * whole vocabulary by reading one object.
 */
const STATUS_STYLES: Record<DeliveryStatus, { label: string; className: string }> =
  {
    completed: {
      label: 'Completed',
      className: 'bg-status-on-track-bg text-status-on-track',
    },
    'on-track': {
      label: 'On track',
      className: 'bg-status-on-track-bg text-status-on-track',
    },
    'at-risk': {
      label: 'At risk',
      className: 'bg-status-at-risk-bg text-status-at-risk',
    },
    lagging: {
      label: 'Lagging',
      className: 'bg-status-lagging-bg text-status-lagging',
    },
    delayed: {
      label: 'Delayed',
      className: 'bg-status-delayed-bg text-status-delayed',
    },
    blocked: {
      label: 'Blocked',
      className: 'bg-status-delayed-bg text-status-delayed',
    },
    // Not performance judgements — these say "we cannot assert yet".
    'limited-data': {
      label: 'Limited data',
      className: 'bg-status-no-data-bg text-status-no-data',
    },
    provisional: {
      label: 'Provisional',
      className: 'bg-status-no-data-bg text-status-no-data',
    },
  }

export function StatusBadge({
  status,
  className,
}: {
  status: DeliveryStatus
  className?: string
}) {
  const { label, className: statusClassName } = STATUS_STYLES[status]
  return <span className={cn(badgeBase, statusClassName, className)}>{label}</span>
}

/** Provenance tag shown in the top-right of a metric card. */
const SOURCE_STYLES: Record<SourceTag, { label: string; className: string }> = {
  live: { label: 'live', className: 'bg-status-on-track-bg text-status-on-track' },
  'live-cpr': {
    label: 'live • CPR',
    className: 'bg-status-on-track-bg text-status-on-track',
  },
  'public-source': {
    label: 'Public source',
    className: 'bg-status-on-track-bg text-status-on-track',
  },
  indicative: {
    label: 'indicative',
    className: 'bg-status-no-data-bg text-status-no-data',
  },
  'requires-validation': {
    label: 'Requires validation',
    className: 'bg-status-lagging-bg text-status-lagging',
  },
}

export function SourceBadge({
  source,
  className,
}: {
  source: SourceTag
  className?: string
}) {
  const { label, className: sourceClassName } = SOURCE_STYLES[source]
  return <span className={cn(badgeBase, sourceClassName, className)}>{label}</span>
}

const SEVERITY_STYLES: Record<
  BottleneckSeverity,
  { label: string; className: string }
> = {
  critical: {
    label: 'Critical',
    className: 'bg-status-at-risk-bg text-status-at-risk',
  },
  regulatory: {
    label: 'Regulatory',
    className: 'bg-status-lagging-bg text-status-lagging',
  },
  delayed: {
    label: 'Delayed',
    className: 'bg-status-delayed-bg text-status-delayed',
  },
  blocked: {
    label: 'Blocked',
    className: 'bg-status-delayed-bg text-status-delayed',
  },
}

export function SeverityBadge({
  severity,
  className,
}: {
  severity: BottleneckSeverity
  className?: string
}) {
  const { label, className: severityClassName } = SEVERITY_STYLES[severity]
  return (
    <span className={cn(badgeBase, severityClassName, className)}>{label}</span>
  )
}
