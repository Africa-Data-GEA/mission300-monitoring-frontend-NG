import { useState } from 'react'
import { FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { environment } from '@/config/environment'
import { Card } from '@/components/ui/card'

/**
 * Downloads the real "National Energy Compact Progress Report" workbook —
 * generated server-side by cloning the actual GEAPP Reporting.xlsx (same
 * fonts, fills, merges, column widths, and the full Nigeria Actions
 * tracker) and writing in the current Compact-outcome figures. This is a
 * direct file download from the real backend, not a client-side generated
 * report like the builder above — only shown when a live backend is
 * configured (VITE_SUBMISSIONS_BACKEND_URL).
 */
export function NigeriaProgressReportSection() {
  const backendUrl = environment.hybridBackendUrl
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!backendUrl) return null

  async function handleDownload() {
    setIsDownloading(true)
    setError(null)
    try {
      const response = await fetch(
        `${backendUrl}/api/reports/national-energy-compact-progress-report.xlsx`,
      )
      if (!response.ok) throw new Error(`Download failed with status ${response.status}`)

      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'National Energy Compact Progress Report - Nigeria.xlsx'
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Card variant="well" className="p-3 sm:p-4">
      <h2 className="text-lg font-semibold text-text-default">
        National Energy Compact Progress Report
      </h2>
      <p className="mt-1 text-sm text-text-muted">
        The official GEAPP Reporting workbook — same design, sheets and Nigeria Actions
        tracker — regenerated with the current Compact-outcome figures.
      </p>

      <div className="mt-3 flex items-center gap-3">
        <Button type="button" size="sm" onClick={() => void handleDownload()} disabled={isDownloading}>
          <FileSpreadsheet aria-hidden="true" />
          {isDownloading ? 'Generating…' : 'Download Excel'}
        </Button>
        {error && <p className="text-xs text-status-at-risk">{error}</p>}
      </div>
    </Card>
  )
}
