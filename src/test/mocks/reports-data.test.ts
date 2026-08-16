import { describe, expect, it } from 'vitest'
import {
  compactExportCardSchema,
  reportCatalogueCardSchema,
  reportPreviewSchema,
  reportsFilterOptionsSchema,
  savedReportSchema,
  REPORT_TYPES,
} from '@/api/schemas/reports'
import {
  buildReportPreview,
  compactExportCards,
  reportCatalogue,
  reportsFilterOptions,
  savedReports,
} from '@/mocks/data/reports'

function issuesOf(result: { success: boolean; error?: { issues: Array<{ path: PropertyKey[]; message: string }> } }) {
  return result.success
    ? []
    : (result.error?.issues ?? []).map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
}

describe('Reports & Exports mock data', () => {
  it('satisfies the filter options contract', () => {
    expect(issuesOf(reportsFilterOptionsSchema.safeParse(reportsFilterOptions))).toEqual([])
  })

  it('satisfies the catalogue contract and covers every report type exactly once', () => {
    for (const card of reportCatalogue) {
      expect(issuesOf(reportCatalogueCardSchema.safeParse(card)), card.reportType).toEqual([])
    }
    expect(reportCatalogue.map((card) => card.reportType).sort()).toEqual([...REPORT_TYPES].sort())
  })

  it('satisfies the CPR/Compact export card contract', () => {
    for (const card of compactExportCards) {
      expect(issuesOf(compactExportCardSchema.safeParse(card)), card.id).toEqual([])
    }
  })

  it('satisfies the saved report contract for the seed history', () => {
    for (const report of savedReports) {
      expect(issuesOf(savedReportSchema.safeParse(report)), report.id).toEqual([])
    }
  })

  it('builds a schema-valid preview for every report type', () => {
    for (const reportType of REPORT_TYPES) {
      const preview = buildReportPreview({
        reportType,
        periods: ['q3-2025'],
        pillars: ['all'],
        kpiCategory: 'all',
        state: 'all',
        distributionCompany: 'all',
        programmeOrAgency: 'all',
        validationStatus: 'all',
        readinessTier: 'all',
        format: 'pdf',
      })
      expect(issuesOf(reportPreviewSchema.safeParse(preview)), reportType).toEqual([])
      expect(preview.sections.length, reportType).toBeGreaterThan(0)
    }
  })

  it('narrows the preview when a pillar filter is applied', () => {
    const preview = buildReportPreview({
      reportType: 'pillar-performance',
      periods: ['q3-2025'],
      pillars: ['generation-network'],
      kpiCategory: 'all',
      state: 'all',
      distributionCompany: 'all',
      programmeOrAgency: 'all',
      validationStatus: 'all',
      readinessTier: 'all',
      format: 'pdf',
    })
    const indicatorSection = preview.sections.find((section) => section.title === 'Indicators')
    expect(indicatorSection?.rows.every((row) => row[2] === 'generation-network')).toBe(true)
    expect(preview.metadata.appliedFilters.some((filter) => filter.label === 'Compact pillar')).toBe(true)
  })
})
