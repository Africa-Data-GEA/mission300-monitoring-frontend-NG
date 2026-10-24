import { Plus } from 'lucide-react'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/ui/error-state'
import { ReportPageHeader } from '../components/report-page-header'
import { ReportsSkeleton } from '../components/reports-skeleton'
import { SavedReportsFilters } from '../components/saved-reports-filters'
import { SavedReportsTable } from '../components/saved-reports-table'
import { useSavedReportsPage } from '../use-saved-reports-page'

export function SavedReportsPage() {
  const page = useSavedReportsPage()

  if (page.isPending) return <ReportsSkeleton />

  if (page.isError) {
    return (
      <ErrorState
        title="Saved reports could not be loaded"
        message={page.error.message}
        onRetry={page.retry}
      />
    )
  }

  if (!page.savedReports) return null

  return (
    <div className="flex flex-col gap-4">
      <ReportPageHeader
        title="Saved reports"
        description="Every report you have generated. Download one again or remove it from the history."
      />

      <div className="flex flex-col gap-4 rounded-card bg-surface-sunken p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold text-text-default">Report history</h2>
            <Button asChild size="sm"><Link to="/reports/builder"><Plus aria-hidden="true" />Create a report</Link></Button>
          </div>
          <span className="rounded-full border border-border-default bg-surface px-3 py-1 text-xs font-medium text-text-muted">{page.savedReports.total} matching {page.savedReports.total === 1 ? 'report' : 'reports'}</span>
        </div>
        <SavedReportsFilters
          search={page.savedSearch}
          category={page.savedCategory}
          onChangeSearch={page.changeSavedSearch}
          onChangeCategory={page.changeSavedCategory}
        />

        <SavedReportsTable
          reports={page.savedReports.items}
          page={page.savedReports.page}
          pageSize={page.savedReports.pageSize}
          total={page.savedReports.total}
          onPageChange={page.setSavedPage}
          onRedownload={page.redownloadSavedReport}
          onDelete={page.deleteReport}
          redownloadingId={page.redownloadingId}
          deletingId={page.deletingId}
        />
      </div>
    </div>
  )
}

