import { Info } from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { cn } from '@/lib/utils'
import { formatDateTime } from '@/lib/format'
import type { MetricProvenance } from '@/types/domain'

/**
 * The information icon required on every metric by the page specifications.
 *
 * The spec mandates that definition, methodology, source and last-updated date
 * are all reachable, so this renders all four rather than a one-line tooltip.
 * It is a click-triggered popover, not a hover tooltip, because the content is
 * long enough to need reading time and must work on touch devices.
 */
export function InfoPopover({
  provenance,
  label,
  details,
  className,
}: {
  provenance: MetricProvenance
  /** Name of the metric, used to give the trigger an accessible name. */
  label: string
  /**
   * Metric-specific rows shown above the definition — target, baseline,
   * reporting period and similar. These keep cards uncluttered: the
   * specification requires the figures to be reachable, not to be printed on
   * the card face. Falsy values are skipped.
   */
  details?: ReadonlyArray<{ label: string; value: string | null | undefined }>
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={containerRef} className={cn('relative inline-flex', className)}>
      <button
        type="button"
        aria-label={`About ${label}: definition, methodology and data source`}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((previous) => !previous)}
        className="inline-flex size-5 items-center justify-center rounded-full text-text-subtle transition-colors hover:text-text-muted"
      >
        <Info aria-hidden="true" className="size-4" />
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label={`${label} — definition, methodology and data source`}
          className="absolute top-7 right-0 z-50 w-80 rounded-control border border-border-default bg-surface p-4 text-left shadow-lg"
        >
          <dl className="space-y-3 text-xs leading-relaxed">
            {details
              ?.filter((detail) => Boolean(detail.value))
              .map((detail) => (
                <div key={detail.label}>
                  <dt className="font-semibold text-text-default">
                    {detail.label}
                  </dt>
                  <dd className="mt-0.5 text-text-muted">{detail.value}</dd>
                </div>
              ))}
            <div>
              <dt className="font-semibold text-text-default">Definition</dt>
              <dd className="mt-0.5 text-text-muted">{provenance.definition}</dd>
            </div>
            <div>
              <dt className="font-semibold text-text-default">Methodology</dt>
              <dd className="mt-0.5 text-text-muted">
                {provenance.methodology}
              </dd>
            </div>
            <div>
              <dt className="font-semibold text-text-default">Data source</dt>
              <dd className="mt-0.5 text-text-muted">{provenance.source}</dd>
            </div>
            <div>
              <dt className="font-semibold text-text-default">Last updated</dt>
              <dd className="mt-0.5 text-text-muted">
                {formatDateTime(provenance.lastUpdated)}
              </dd>
            </div>
          </dl>
        </div>
      )}
    </div>
  )
}
