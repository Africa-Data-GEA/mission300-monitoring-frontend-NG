import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import type { ExportFormat, ReportConfig, ReportType } from '@/api/schemas/reports'
import { useGenerateReport, useReportPreview, useReportsFilters } from './api'
import { defaultReportConfig } from './lib/default-report-config'
import { downloadBlob } from './lib/download'
import { buildReportWorkbook } from './lib/export-excel'
import { buildReportPdf } from './lib/export-pdf'
import type { Orientation } from './lib/types'

export function useReportBuilderPage() {
  const [config, setConfig] = useState<ReportConfig>(defaultReportConfig('compact-progress'))
  const [orientation, setOrientation] = useState<Orientation>('portrait')
  const [excludedSections, setExcludedSections] = useState<ReadonlySet<string>>(new Set())
  const [downloadingFormat, setDownloadingFormat] = useState<ExportFormat | null>(null)

  const filters = useReportsFilters()
  const preview = useReportPreview(config, true)
  const generateReport = useGenerateReport()

  function changeReportType(reportType: ReportType) {
    setConfig(defaultReportConfig(reportType))
    setExcludedSections(new Set())
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
        ...config,
        format,
        orientation,
        excludedSections: [...excludedSections],
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

  return {
    config,
    changeReportType,
    changeConfig: setConfig,
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
  }
}
