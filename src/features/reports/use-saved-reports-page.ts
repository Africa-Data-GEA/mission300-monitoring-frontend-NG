import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import type { SavedReport } from '@/api/schemas/reports'
import { useBrandIdentity } from '@/features/branding/use-brand-identity'
import { fetchSavedReportPreview, useDeleteSavedReport, useReportsOverview } from './api'
import { buildCompactProgressReportPdf } from './lib/build-compact-progress-report-pdf'
import { downloadBlob } from './lib/download'
import { buildReportWorkbook } from './lib/export-excel'
import { buildReportPdf } from './lib/export-pdf'
import { loadCompactReportData } from './lib/load-compact-report-data'

export function useSavedReportsPage() {
  const { country } = useBrandIdentity()
  const [savedSearch, setSavedSearch] = useState('')
  const [savedCategory, setSavedCategory] = useState('all')
  const [savedPage, setSavedPage] = useState(1)
  const [redownloadingId, setRedownloadingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const deleteSavedReport = useDeleteSavedReport()
  const overview = useReportsOverview(
    useMemo(
      () => ({ search: savedSearch || undefined, category: savedCategory, page: savedPage, pageSize: 8 }),
      [savedSearch, savedCategory, savedPage],
    ),
  )

  async function redownloadSavedReport(report: SavedReport) {
    setRedownloadingId(report.id)
    try {
      const { preview: generated, orientation: savedOrientation, compactLayout } = await fetchSavedReportPreview(report.id)
      const blob =
        report.format === 'pdf'
          ? compactLayout
            ? await buildCompactProgressReportPdf(await loadCompactReportData(country))
            : await buildReportPdf(generated, { orientation: savedOrientation })
          : await buildReportWorkbook(generated)
      downloadBlob(blob, report.fileReference)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'The saved report could not be downloaded.')
    } finally {
      setRedownloadingId(null)
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
    isPending: overview.isPending,
    isError: overview.isError,
    error: overview.error ?? new Error('Saved reports could not be loaded.'),
    retry: () => void overview.refetch(),
    savedReports: overview.data?.savedReports,
    savedSearch,
    savedCategory,
    changeSavedSearch,
    changeSavedCategory,
    setSavedPage,
    redownloadingId,
    redownloadSavedReport,
    deletingId,
    deleteReport,
  }
}
