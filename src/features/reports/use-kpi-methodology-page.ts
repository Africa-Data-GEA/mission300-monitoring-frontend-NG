import { useState } from 'react'
import toast from 'react-hot-toast'
import type { ExportFormat } from '@/api/schemas/reports'
import { fetchMethodologyReport } from './api'
import { downloadBlob } from './lib/download'
import { buildReportWorkbook } from './lib/export-excel'
import { buildReportPdf } from './lib/export-pdf'

export function useKpiMethodologyPage() {
  const [downloadingMethodology, setDownloadingMethodology] = useState<ExportFormat | null>(null)

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

  return { downloadingMethodology, downloadMethodology }
}
