import ApexCharts from 'apexcharts'

/**
 * PNG export for a landing chart, by chart id.
 *
 * Uses ApexCharts' own `dataURI` rather than a screenshot library: the chart
 * already knows how to render itself to a canvas at the right pixel ratio, and
 * adding html2canvas to the bundle to photograph an element that can export
 * itself would be a dependency bought for nothing.
 *
 * WHY THIS EXISTS. A published figure a reader cannot take away is a figure
 * they will screenshot badly and caption wrongly. Giving them the chart with
 * its own title in the filename is the cheaper correction.
 */
export async function downloadChartPng(chartId: string, filename: string): Promise<void> {
  const result = (await ApexCharts.exec(chartId, 'dataURI')) as { imgURI?: string } | undefined
  const imgURI = result?.imgURI
  if (!imgURI) return

  triggerDownload(imgURI, `${filename}.png`)
}

/** Shared by both exports — creates the anchor, clicks it, cleans up. */
export function triggerDownload(href: string, filename: string): void {
  const link = document.createElement('a')
  link.href = href
  link.download = filename
  document.body.append(link)
  link.click()
  link.remove()
}
