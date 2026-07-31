import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { InfoPopover } from '@/components/ui/info-popover'
import { SourceBadge } from '@/components/ui/status-badge'
import { cn } from '@/lib/utils'
import type { MetricProvenance, SourceTag } from '@/types/domain'

/**
 * Shared chrome for the four Section A headline cards: title, provenance badge
 * and information popover.
 *
 * NO ICON. These cards carry a single large figure each, and a decorative
 * glyph beside it competes with the number for the first fixation without
 * distinguishing one card from the next — the titles already do that. The
 * title takes the top-left slot instead, so the first thing read is what the
 * number measures.
 *
 * ALIGNMENT: the four cards sit side by side, so their internals must line up
 * even though the titles differ in length. The title is therefore clamped to
 * two lines and reserves that height whether or not it wraps, which keeps the
 * value rows on a common baseline. The card itself stretches to the tallest in
 * the row, and each body pushes its footer down with `mt-auto`.
 */
export function MetricCardFrame({
  title,
  source,
  provenance,
  details,
  children,
  className,
  hideSource = false,
}: {
  title: string
  source: SourceTag
  provenance: MetricProvenance
  /** Extra rows for the information popover — target, baseline and similar. */
  details?: ReadonlyArray<{ label: string; value: string | null | undefined }>
  children: ReactNode
  className?: string
  /** Skips the top-right provenance pill (e.g. "live • CPR") for cards that read cleaner without it. */
  hideSource?: boolean
}) {
  return (
    <Card className={cn('flex h-full flex-col p-4', className)}>
      <div className="flex items-start justify-between gap-2">
        {/*
          Two-line box reserved whether or not the title wraps, so the value
          rows across the four cards share a baseline. The full text stays
          available via the title attribute when it is clamped.
        */}
        <p title={title} className="line-clamp-2 min-h-9 text-sm text-text-muted">
          {title}
        </p>

        <div className="flex shrink-0 items-center gap-1">
          {!hideSource && <SourceBadge source={source} />}
          <InfoPopover provenance={provenance} label={title} details={details} />
        </div>
      </div>

      {children}
    </Card>
  )
}
