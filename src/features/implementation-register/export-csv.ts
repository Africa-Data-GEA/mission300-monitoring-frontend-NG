/**
 * Client-side CSV export for the register's tables (Section E, "filtered
 * export and technical handoff"). The current filters have already narrowed
 * `rows` by the time this is called, so the export preserves them by
 * construction — there is no separate server export endpoint to keep in sync.
 */
export function exportToCsv(fileName: string, columns: string[], rows: string[][]) {
  const escapeCell = (cell: string) =>
    /[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell

  const lines = [columns, ...rows].map((row) => row.map(escapeCell).join(','))
  const csv = lines.join('\n')

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}
