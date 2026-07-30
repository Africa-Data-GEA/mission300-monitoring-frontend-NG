import type { ReportPreview } from '@/api/schemas/reports'

/** A safe Excel sheet name — max 31 chars, no []:*?/\ characters. */
function sheetName(title: string, usedNames: Set<string>) {
  const base = title.replace(/[[\]:*?/\\]/g, ' ').slice(0, 31).trim() || 'Sheet'
  let name = base
  let suffix = 2
  while (usedNames.has(name)) {
    name = `${base.slice(0, 28)} ${suffix}`
    suffix += 1
  }
  usedNames.add(name)
  return name
}

/**
 * Builds a real .xlsx workbook from a report preview — one sheet for the
 * metadata/appendix, then one sheet per data section, using the exact same
 * rows the on-screen preview shows.
 */
export async function buildReportWorkbook(preview: ReportPreview): Promise<Blob> {
  const { default: ExcelJS } = await import('exceljs')
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'M300 Dashboard'
  workbook.created = new Date()

  const metadataRows: [string, string][] = [
    ['Title', preview.metadata.title],
    ['Reporting period', preview.metadata.reportingPeriod],
    ['Generated at', preview.metadata.generatedAt],
    ['Data version', preview.metadata.dataVersion],
    ['Validation status', preview.metadata.validationStatus],
    ['Units', preview.metadata.units],
    ['Source notes', preview.metadata.sourceNotes],
    ['Limitations', preview.metadata.limitations],
    ...preview.metadata.appliedFilters.map(
      (filter) => [`Filter — ${filter.label}`, filter.value] as [string, string],
    ),
  ]
  const metadataSheet = workbook.addWorksheet('Report info')
  metadataSheet.addRows([['Field', 'Value'], ...metadataRows])
  metadataSheet.getRow(1).font = { bold: true }
  metadataSheet.columns = [{ width: 24 }, { width: 60 }]

  const usedNames = new Set<string>(['Report info'])
  for (const section of preview.sections) {
    const sheet = workbook.addWorksheet(sheetName(section.title, usedNames))
    sheet.addRows([section.columns, ...section.rows])
    sheet.getRow(1).font = { bold: true }
    sheet.views = [{ state: 'frozen', ySplit: 1 }]
    sheet.columns = section.columns.map((column, index) => ({
      width: Math.min(
        60,
        Math.max(
          String(column).length + 2,
          ...section.rows.map((row) => String(row[index] ?? '').length + 2),
        ),
      ),
    }))
  }

  const buffer = await workbook.xlsx.writeBuffer()
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}
