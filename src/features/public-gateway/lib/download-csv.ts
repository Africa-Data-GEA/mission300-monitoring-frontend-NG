import { triggerDownload } from './download-chart'

/**
 * CSV export for the figures behind a chart or table.
 *
 * Built client-side from the same array the chart was drawn from, so the file
 * and the picture can never disagree. No backend route is required, which
 * matters: the public overview endpoint does not exist yet
 * (see `api.ts`), and this page should not be blocked on it to let a
 * journalist check a number.
 */
export function downloadCsv(
  filename: string,
  headers: readonly string[],
  rows: readonly (readonly (string | number | null)[])[],
): void {
  const lines = [headers.map(escapeCell).join(','), ...rows.map((row) => row.map(escapeCell).join(','))]

  // The BOM is what makes Excel open a UTF-8 CSV without mangling the naira
  // sign and the en-dashes in our period labels.
  const blob = new Blob([`\uFEFF${lines.join('\r\n')}`], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  triggerDownload(url, `${filename}.csv`)
  URL.revokeObjectURL(url)
}

function escapeCell(cell: string | number | null): string {
  if (cell === null) return ''
  const text = String(cell)
  return /[",\r\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

/** Filesystem-safe slug for a chart title, used as the download filename. */
export function toFilename(title: string): string {
  return `m300-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`
}
