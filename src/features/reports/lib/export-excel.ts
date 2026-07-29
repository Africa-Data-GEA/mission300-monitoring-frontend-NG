import * as XLSX from 'xlsx'
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
export function buildReportWorkbook(preview: ReportPreview): Blob {
  const workbook = XLSX.utils.book_new()

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
  const metadataSheet = XLSX.utils.aoa_to_sheet([['Field', 'Value'], ...metadataRows])
  XLSX.utils.book_append_sheet(workbook, metadataSheet, 'Report info')

  const usedNames = new Set<string>(['Report info'])
  for (const section of preview.sections) {
    const sheet = XLSX.utils.aoa_to_sheet([section.columns, ...section.rows])
    XLSX.utils.book_append_sheet(workbook, sheet, sheetName(section.title, usedNames))
  }

  const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' })
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}
