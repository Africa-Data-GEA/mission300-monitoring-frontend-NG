import { useMemo, useState } from 'react'
import type {
  CompactExportCard,
  ExportFormat,
  ReportConfig,
  ReportType,
  SavedReport,
} from '@/api/schemas/reports'
import {
  previewReport,
  useDeleteSavedReport,
  useGenerateReport,
  useReportPreview,
  useReportsFilters,
  useReportsOverview,
} from './api'
import { downloadBlob } from './lib/download'
import { buildReportWorkbook } from './lib/export-excel'
import { buildReportPdf } from './lib/export-pdf'
import type { Orientation } from './lib/types'

export type { Orientation }

const DEFAULT_CONFIG_BASE = {
  period: 'q3-2025',
  pillar: 'all',
  kpiCategory: 'all',
  state: 'all',
  distributionCompany: 'all',
  programmeOrAgency: 'all',
  validationStatus: 'all',
  readinessTier: 'all',
  format: 'pdf',
} as const

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
      const { preview: generated, savedReport } = await generateReport.mutateAsync({ ...config, format })
      const filtered = {
        ...generated,
        sections: generated.sections.filter((section) => !excludedSections.has(section.title)),
      }
      const blob =
        format === 'pdf' ? await buildReportPdf(filtered, { orientation }) : buildReportWorkbook(filtered)
      downloadBlob(blob, savedReport.fileReference)
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
      })
      const blob =
        format === 'pdf' ? await buildReportPdf(generated, { orientation: 'portrait' }) : buildReportWorkbook(generated)
      downloadBlob(blob, savedReport.fileReference)
    } finally {
      setCompactExportKey(null)
    }
  }

  async function redownloadSavedReport(report: SavedReport) {
    setRedownloadingId(report.id)
    try {
      const generated = await previewReport(report.config)
      const blob =
        report.format === 'pdf'
          ? await buildReportPdf(generated, { orientation: 'portrait' })
          : buildReportWorkbook(generated)
      downloadBlob(blob, report.fileReference)
    } finally {
      setRedownloadingId(null)
    }
  }

  async function deleteReport(report: SavedReport) {
    setDeletingId(report.id)
    try {
      await deleteSavedReport.mutateAsync(report.id)
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
    redownloadingId,
    redownloadSavedReport,
    deletingId,
    deleteReport,
  }
}
