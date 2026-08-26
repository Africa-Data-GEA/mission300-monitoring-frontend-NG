import type { ReactNode } from 'react'
import { ChartDownloadBar, type ChartDataset } from './chart-download-bar'

/**
 * The frame every chart on this page sits in.
 *
 * One frame, used everywhere, so the reader learns the layout once: title,
 * one line saying what is actually plotted, controls on the same baseline as
 * the title, the figure, then the source and download row. That consistency is
 * the whole point — a page where each chart invents its own furniture reads as
 * a collection of screenshots rather than a single record.
 *
 * SQUARE CORNERS. Kept from the previous build of this page (see
 * public-header.tsx's own note). The visual weight here comes from the hairline
 * border and the internal rhythm, not from radius or shadow — a rounded,
 * shadowed card is the product-marketing default this page is deliberately not.
 */
export function ChartCard({
  id,
  title,
  description,
  unit,
  controls,
  children,
  source,
  chartId,
  dataset,
  footnote,
}: {
  /** Anchor id — the header's page search jumps to these. */
  id?: string
  title: string
  description?: string
  /** What the y-axis counts. Sits under the title, not on the axis, so the
   * axis can stay abbreviated (see `compactNumber`). */
  unit?: string
  /** Filter pills, toggles or a legend, rendered opposite the title. */
  controls?: ReactNode
  children: ReactNode
  source?: string
  chartId?: string
  dataset: ChartDataset
  /** A caveat that belongs to this chart specifically — a missing target, a
   * projected series. Not a place for general methodology. */
  footnote?: string
}) {
  return (
    <figure id={id} className="flex min-w-0 flex-col border border-border-default bg-surface p-5">
      <figcaption className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
        <div className="min-w-0">
          <h3 className="text-[1rem] leading-6 font-bold tracking-tight text-text-default">
            {title}
          </h3>
          {description && (
            <p className="mt-0.5 max-w-[42rem] text-[0.8125rem] leading-5 text-text-muted">
              {description}
            </p>
          )}
          {unit && (
            <p className="mt-1 text-[0.6875rem] leading-4 font-semibold tracking-[0.08em] text-text-subtle uppercase">
              {unit}
            </p>
          )}
        </div>
        {controls && <div className="shrink-0">{controls}</div>}
      </figcaption>

      <div className="mt-4 min-w-0 flex-1">{children}</div>

      {footnote && (
        <p className="mt-3 text-[0.75rem] leading-4 text-text-subtle italic">{footnote}</p>
      )}

      <ChartDownloadBar title={title} source={source} chartId={chartId} dataset={dataset} />
    </figure>
  )
}
