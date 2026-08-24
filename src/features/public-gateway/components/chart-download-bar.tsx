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
 * Both halves are load-bearing. The source line is the page's standing rule —
 * every number carries its provenance — restated at the point of the chart
 * rather than only inside an info popover. The download buttons exist because
 * the alternative is a reader screenshotting a chart and re-typing the numbers
 * underneath it, which is how a provisional figure becomes a wrong headline.
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
  source: string
  chartId?: string
  dataset: ChartDataset
}) {
  const filename = toFilename(title)

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-border-default pt-3">
      <p className="min-w-0 text-[0.75rem] leading-4 text-text-subtle">
        <span className="font-semibold text-text-muted">Source:</span> {source}
      </p>

      <div className="flex shrink-0 items-center gap-2">
        {chartId && (
          <button
            type="button"
            onClick={() => void downloadChartPng(chartId, filename)}
            className="inline-flex items-center gap-1.5 border border-border-strong px-2.5 py-1 text-[0.75rem] leading-4 font-semibold text-text-muted transition-colors hover:border-brand-600 hover:bg-brand-600 hover:text-white"
          >
            <Download aria-hidden="true" className="size-3" />
            Chart (PNG)
          </button>
        )}
        <button
          type="button"
          onClick={() => downloadCsv(filename, dataset.headers, dataset.rows)}
          className="inline-flex items-center gap-1.5 border border-border-strong px-2.5 py-1 text-[0.75rem] leading-4 font-semibold text-text-muted transition-colors hover:border-brand-600 hover:bg-brand-600 hover:text-white"
        >
          <Download aria-hidden="true" className="size-3" />
          Data (CSV)
        </button>
      </div>
      <span className="sr-only">Downloads for {title}</span>
    </div>
  )
}
