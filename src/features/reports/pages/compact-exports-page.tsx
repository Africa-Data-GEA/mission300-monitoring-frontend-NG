import { ErrorState } from '@/components/ui/error-state'
import { CompactExportsSection } from '../components/compact-exports-section'
import { NigeriaProgressReportSection } from '../components/nigeria-progress-report-section'
import { ReportPageHeader } from '../components/report-page-header'
import { ReportsSkeleton } from '../components/reports-skeleton'
import { useCompactExportsPage } from '../use-compact-exports-page'

export function CompactExportsPage() {
  const page = useCompactExportsPage()

  if (page.isPending) return <ReportsSkeleton />

  if (page.isError) {
    return (
      <ErrorState
        title="Compact & CPR exports could not be loaded"
        message={page.error.message}
        onRetry={page.retry}
      />
    )
  }

  if (!page.compactExports) return null

  return (
    <div className="flex flex-col gap-4">
      <ReportPageHeader
        title="Compact & CPR export"
        description="One-click Compact Progress Report and implementation register exports, each a complete fixed document."
      />

      <div className="mt-2">
        <h2 className="text-lg font-semibold text-text-default">Choose your report</h2>
        <p className="mt-1 text-sm text-text-muted">Select a document, confirm its reporting parameters, then generate your export.</p>
      </div>

      <CompactExportsSection
        cards={page.compactExports}
        periods={page.periods}
        exportingKey={page.compactExportKey}
        onExport={page.exportCompactCard}
      />

      <NigeriaProgressReportSection />
    </div>
  )
}

