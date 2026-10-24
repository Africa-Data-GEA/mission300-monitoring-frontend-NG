import { useState } from 'react'
import toast from 'react-hot-toast'
import type { CompactExportCard, ExportFormat } from '@/api/schemas/reports'
import { environment } from '@/config/environment'
import { useBrandIdentity } from '@/features/branding/use-brand-identity'
import { useGenerateReport, useReportsFilters, useReportsOverview } from './api'
import { buildCompactProgressReportPdf } from './lib/build-compact-progress-report-pdf'
import type { CompactReportParameters } from './lib/compact-report-parameters'
import { defaultReportConfig } from './lib/default-report-config'
import { downloadBlob } from './lib/download'
import { buildReportWorkbook } from './lib/export-excel'
import { buildReportPdf } from './lib/export-pdf'
import { loadCompactReportData } from './lib/load-compact-report-data'

export function useCompactExportsPage() {
  const { country } = useBrandIdentity()
  const [compactExportKey, setCompactExportKey] = useState<string | null>(null)

  const filters = useReportsFilters()
  const overview = useReportsOverview()
  const generateReport = useGenerateReport()

  async function exportCompactCard(
    card: CompactExportCard,
    format: ExportFormat,
    parameters: CompactReportParameters,
  ) {
    const key = `${card.id}:${format}`
    setCompactExportKey(key)
    try {
      const { preview: generated, savedReport } = await generateReport.mutateAsync({
        ...defaultReportConfig(card.reportType),
        periods: [parameters.period],
        format,
        ...(card.id === 'compact-progress-report' && format === 'pdf' && environment.dataMode === 'mock'
          ? { compactLayout: true }
          : {}),
      })
      const blob =
        card.id === 'compact-progress-report' && format === 'pdf'
          ? await buildCompactProgressReportPdf(await loadCompactReportData(country, parameters))
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

  return {
    isPending: overview.isPending,
    isError: overview.isError,
    error: overview.error ?? new Error('Compact & CPR exports could not be loaded.'),
    retry: () => void overview.refetch(),
    compactExports: overview.data?.compactExports as CompactExportCard[] | undefined,
    periods: filters.data?.reportingPeriods ?? [],
    compactExportKey,
    exportCompactCard,
  }
}
