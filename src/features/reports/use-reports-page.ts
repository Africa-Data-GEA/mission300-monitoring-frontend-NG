import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import type {
  CompactExportCard,
  ExportFormat,
  ReportConfig,
  ReportType,
  SavedReport,
} from '@/api/schemas/reports'
import {
  fetchMethodologyReport,
  fetchSavedReportPreview,
  useDeleteSavedReport,
  useGenerateReport,
  useReportPreview,
  useReportsFilters,
  useReportsOverview,
} from './api'
import { buildCompactProgressReportData } from './lib/compact-progress-report-data'
import { buildCompactProgressReportPdf } from './lib/build-compact-progress-report-pdf'
import { downloadBlob } from './lib/download'
import { buildReportWorkbook } from './lib/export-excel'
import { buildReportPdf } from './lib/export-pdf'
import type { Orientation } from './lib/types'
import { environment } from '@/config/environment'

export type { Orientation }

const DEFAULT_CONFIG_BASE: Omit<ReportConfig, 'reportType'> = {
  periods: ['all'],
  pillars: ['all'],
  kpiCategory: 'all',
  state: 'all',
  distributionCompany: 'all',
  programmeOrAgency: 'all',
  validationStatus: 'all',
  readinessTier: 'all',
  format: 'pdf',
}

function defaultConfig(reportType: ReportType): ReportConfig {
  return { ...DEFAULT_CONFIG_BASE, reportType }
}

/**
 * All state and data-fetching for Reports & Exports.
 *
 * This page IS the report builder — a two-pane workspace (configuration
 * sidebar driving a live document preview) is the primary content, with the
 * CPR/Compact quick exports and saved-report history underneath.
 */
export function useReportsPage() {
  const [config, setConfig] = useState<ReportConfig>(defaultConfig('compact-progress'))
  const [orientation, setOrientation] = useState<Orientation>('portrait')
  const [excludedSections, setExcludedSections] = useState<ReadonlySet<string>>(new Set())
  const [downloadingFormat, setDownloadingFormat] = useState<ExportFormat | null>(null)

  const [savedSearch, setSavedSearch] = useState('')
  const [savedCategory, setSavedCategory] = useState('all')
  const [savedPage, setSavedPage] = useState(1)
  const [compactExportKey, setCompactExportKey] = useState<string | null>(null)
  const [redownloadingId, setRedownloadingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [downloadingMethodology, setDownloadingMethodology] = useState<ExportFormat | null>(null)

  const filters = useReportsFilters()
  const preview = useReportPreview(config, true)
  const generateReport = useGenerateReport()
  const deleteSavedReport = useDeleteSavedReport()

  const overview = useReportsOverview(
    useMemo(
      () => ({ search: savedSearch || undefined, category: savedCategory, page: savedPage, pageSize: 8 }),
      [savedSearch, savedCategory, savedPage],
    ),
  )

  function changeReportType(reportType: ReportType) {
    setConfig(defaultConfig(reportType))
    // A different report type changes which sections exist, so a stale
    // exclusion list would silently hide sections the user never chose to
    // hide.
    setExcludedSections(new Set())
  }

  function changeConfig(next: ReportConfig) {
    setConfig(next)
  }

  function toggleSection(title: string) {
    setExcludedSections((current) => {
      const next = new Set(current)
      if (next.has(title)) next.delete(title)
      else next.add(title)
      return next
    })
  }

  const visibleSections = useMemo(
    () => (preview.data?.sections ?? []).filter((section) => !excludedSections.has(section.title)),
    [preview.data, excludedSections],
  )

  async function downloadFromBuilder(format: ExportFormat) {
    setDownloadingFormat(format)
    try {
      const { preview: generated, savedReport } = await generateReport.mutateAsync({
        ...config, format, orientation, excludedSections: [...excludedSections],
      })
      const blob =
        format === 'pdf'
          ? await buildReportPdf(generated, { orientation })
          : await buildReportWorkbook(generated)
      downloadBlob(blob, savedReport.fileReference)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'The report could not be downloaded.')
    } finally {
      setDownloadingFormat(null)
    }
  }

  async function exportCompactCard(card: CompactExportCard, format: ExportFormat) {
    const key = `${card.id}:${format}`
    setCompactExportKey(key)
    try {
      const { preview: generated, savedReport } = await generateReport.mutateAsync({
        ...defaultConfig(card.reportType),
        format,
        ...(card.id === 'compact-progress-report' && format === 'pdf' && environment.dataMode === 'mock'
          ? { compactLayout: true }
          : {}),
      })
      // The Compact Progress Report PDF is a bespoke, fixed layout matching
      // the real CPR's design/structure (see compact-progress-report-
      // document.tsx) — everything else still goes through the generic
      // builder document. `generateReport` above still runs first so this
      // download is tracked in Saved Reports history the same as any other
      // export; only the PDF bytes themselves diverge.
      const blob =
        card.id === 'compact-progress-report' && format === 'pdf' && environment.dataMode === 'mock'
          ? await buildCompactProgressReportPdf(buildCompactProgressReportData())
          : format === 'pdf'
            ? await buildReportPdf(generated, { orientation: 'portrait' })
            : await buildReportWorkbook(generated)
      downloadBlob(blob, savedReport.fileReference)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'The export could not be downloaded.')
    } finally {
      setCompactExportKey(null)
    }
  }

  async function redownloadSavedReport(report: SavedReport) {
    setRedownloadingId(report.id)
    try {
      const { preview: generated, orientation: savedOrientation, compactLayout } = await fetchSavedReportPreview(report.id)
      const blob =
        report.format === 'pdf'
          ? compactLayout && environment.dataMode === 'mock'
            ? await buildCompactProgressReportPdf(buildCompactProgressReportData())
            : await buildReportPdf(generated, { orientation: savedOrientation })
          : await buildReportWorkbook(generated)
      downloadBlob(blob, report.fileReference)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'The saved report could not be downloaded.')
    } finally {
      setRedownloadingId(null)
    }
  }

  /** Stakeholder feedback asked for a standalone export of every tracked
   * KPI's methodology — independent of the builder's current filters, and
   * not saved to Saved Reports history since it isn't a "report" in that
   * sense. */
  async function downloadMethodology(format: ExportFormat) {
    setDownloadingMethodology(format)
    try {
      const generated = await fetchMethodologyReport()
      const blob =
        format === 'pdf'
          ? await buildReportPdf(generated, { orientation: 'landscape' })
          : await buildReportWorkbook(generated)
      downloadBlob(blob, `kpi-methodology.${format}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'The methodology could not be downloaded.')
    } finally {
      setDownloadingMethodology(null)
    }
  }

  async function deleteReport(report: SavedReport) {
    setDeletingId(report.id)
    try {
      await deleteSavedReport.mutateAsync(report.id)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'The saved report could not be deleted.')
    } finally {
      setDeletingId(null)
    }
  }

  function changeSavedSearch(value: string) {
    setSavedSearch(value)
    setSavedPage(1)
  }

  function changeSavedCategory(value: string) {
    setSavedCategory(value)
    setSavedPage(1)
  }

  return {
    // Builder
    config,
    changeReportType,
    changeConfig,
    orientation,
    setOrientation,
    filterOptions: filters.data,
    preview: preview.data,
    isPreviewPending: preview.isPending,
    visibleSections,
    excludedSections,
    toggleSection,
    downloadingFormat,
    downloadFromBuilder,

    // Catalogue / CPR export / saved reports
    isPending: overview.isPending,
    isError: overview.isError,
    error: overview.error ?? new Error('Reports & Exports could not be loaded.'),
    retry: () => void overview.refetch(),
    compactExports: overview.data?.compactExports as CompactExportCard[] | undefined,
    savedReports: overview.data?.savedReports,
    savedSearch,
    savedCategory,
    changeSavedSearch,
    changeSavedCategory,
    setSavedPage,
    compactExportKey,
    exportCompactCard,
    downloadingMethodology,
    downloadMethodology,
    redownloadingId,
    redownloadSavedReport,
    deletingId,
    deleteReport,
  }
}
