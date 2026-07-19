import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { InfoPopover } from '@/components/ui/info-popover'
import { SourceBadge } from '@/components/ui/status-badge'
import { MetricIcon } from '@/config/metric-icons'
import { cn } from '@/lib/utils'
import type { MetricIconName, MetricProvenance, SourceTag } from '@/types/domain'

/**
 * Shared chrome for the four Section A headline cards: icon, provenance badge,
 * information popover and title.
 *
 * The four cards have deliberately different bodies — a progress bar, a KPI
 * with a source year, a KPI with a sparkline, an alert count — so only the
 * frame is shared. Extracting the body too would mean a props object that
 * describes four unrelated shapes.
 */
export function MetricCardFrame({
  title,
  icon,
  source,
  provenance,
  tone = 'default',
  details,
  children,
  className,
}: {
  title: string
  icon: MetricIconName
  source: SourceTag
  provenance: MetricProvenance
  /** Extra rows for the information popover — target, baseline and similar. */
  details?: ReadonlyArray<{ label: string; value: string | null | undefined }>
  /** `alert` tints the icon for the escalations card. */
  tone?: 'default' | 'alert'
  children: ReactNode
  className?: string
}) {
  return (
    <Card className={cn('flex flex-col p-4', className)}>
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            'inline-flex size-8 shrink-0 items-center justify-center rounded-full',
            tone === 'alert' ? 'bg-status-at-risk-bg' : 'bg-brand-50',
          )}
        >
          <MetricIcon
            name={icon}
            className={cn(
              'size-4',
              tone === 'alert' ? 'text-status-at-risk' : 'text-brand-600',
            )}
          />
        </span>

        <div className="flex shrink-0 items-center gap-1.5">
          <SourceBadge source={source} />
          <InfoPopover provenance={provenance} label={title} details={details} />
        </div>
      </div>

      <p className="mt-4 text-sm text-text-muted">{title}</p>

      {children}
    </Card>
  )
}
