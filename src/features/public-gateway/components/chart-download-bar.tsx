import { Download } from 'lucide-react'
import { downloadChartPng } from '../lib/download-chart'
import { downloadCsv, toFilename } from '../lib/download-csv'

export interface ChartDataset {
  readonly headers: readonly string[]
  readonly rows: readonly (readonly (string | number | null)[])[]
}

/**
 * The footer strip under every chart on this page: where the figure came from,
 * and how to take it away.
 *
 * The source line is the page's standing rule — every number carries its
 * provenance — restated at the point of the chart rather than only inside an
 * info popover. `source` is therefore required almost everywhere it is used.
 * It is optional here only for the one chart on the page whose channels each
 * carry a different institution: naming all four on the page itself read as a
 * wall of text rather than a citation. Provenance is not lost — every
 * channel's own source and last-updated date are still columns in the CSV
 * export this bar's Data (CSV) button produces — only the printed line under
 * the chart is dropped.
 *
 * The download buttons exist because the alternative is a reader
 * screenshotting a chart and re-typing the numbers underneath it, which is
 * how a provisional figure becomes a wrong headline.
 *
 * The PNG button is omitted when no `chartId` is given — an element that is
 * not an ApexCharts instance (the state table, the CSS bars) has no canvas to
 * export, and a button that silently does nothing is worse than no button.
 */
export function ChartDownloadBar({
  title,
  source,
  chartId,
  dataset,
}: {
  title: string
  source?: string
  chartId?: string
  dataset: ChartDataset
}) {
  const filename = toFilename(title)

  return (
    <div className="mt-4 flex flex-wrap items-center justify-end gap-x-6 gap-y-2 border-t border-border-default pt-3">
      {source && (
        <p className="mr-auto min-w-0 text-[0.75rem] leading-4 text-text-subtle">
          <span className="font-semibold text-text-muted">Source:</span> {source}
        </p>
      )}

      <div className="flex shrink-0 items-center gap-2">
        {chartId && (
          <button
            type="button"
            onClick={() => void downloadChartPng(chartId, filename)}
            className="inline-flex items-center gap-1.5 border border-border-strong px-2.5 py-1 text-[0.75rem] leading-4 font-semibold text-text-muted transition-colors hover:border-landing-blue hover:bg-landing-blue hover:text-white"
          >
            <Download aria-hidden="true" className="size-3" />
            Chart (PNG)
          </button>
        )}
        <button
          type="button"
          onClick={() => downloadCsv(filename, dataset.headers, dataset.rows)}
          className="inline-flex items-center gap-1.5 border border-border-strong px-2.5 py-1 text-[0.75rem] leading-4 font-semibold text-text-muted transition-colors hover:border-landing-blue hover:bg-landing-blue hover:text-white"
        >
          <Download aria-hidden="true" className="size-3" />
          Data (CSV)
        </button>
      </div>
      <span className="sr-only">Downloads for {title}</span>
    </div>
  )
}
