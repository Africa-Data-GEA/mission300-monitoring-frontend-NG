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
 * ALIGNMENT: the four cards sit side by side, so their internals must line up
 * even though the titles differ in length. The title is therefore clamped to
 * two lines and reserves that height whether or not it wraps, which keeps the
 * value rows on a common baseline. The card itself stretches to the tallest in
 * the row, and each body pushes its footer down with `mt-auto`.
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
  hideSource = false,
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
  /** Skips the top-right provenance pill (e.g. "live • CPR") for cards that read cleaner without it. */
  hideSource?: boolean
}) {
  return (
    <Card className={cn('flex h-full flex-col p-4', className)}>
      <div className="flex items-start justify-between gap-2">
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

        <div className="flex min-w-0 shrink-0 items-center gap-1">
          {!hideSource && <SourceBadge source={source} />}
          <InfoPopover provenance={provenance} label={title} details={details} />
        </div>
      </div>

      {/*
        Two-line box reserved whether or not the title wraps, so the value rows
        across the four cards share a baseline. The full text stays available
        via the title attribute when it is clamped.
      */}
      <p
        title={title}
        className="mt-3 line-clamp-2 min-h-9 text-sm text-text-muted"
      >
        {title}
      </p>

      {children}
    </Card>
  )
}
