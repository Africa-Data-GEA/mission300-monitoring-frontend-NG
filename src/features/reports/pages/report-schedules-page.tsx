import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ErrorState } from '@/components/ui/error-state'
import { ReportPageHeader } from '../components/report-page-header'
import { ReportScheduleDialog } from '../components/report-schedule-dialog'
import { ReportSchedulesTable } from '../components/report-schedules-table'
import { ReportsSkeleton } from '../components/reports-skeleton'
import { useReportSchedulesPage } from '../use-report-schedules-page'

export function ReportSchedulesPage() {
  const page = useReportSchedulesPage()
  const { schedules } = page

  if (schedules.isPending) return <ReportsSkeleton />

  if (schedules.isError) {
    return (
      <ErrorState
        title="Scheduled briefs could not be loaded"
        message={schedules.error.message}
        onRetry={() => void schedules.refetch()}
      />
    )
  }

  const items = schedules.data?.items ?? []

  return (
    <div className="flex flex-col gap-4">
      <ReportPageHeader
        title="Scheduled briefs"
        description="Email the one-page executive brief to ministers and senior stakeholders on a regular schedule. Each send is generated fresh from the latest approved data."
      />

      <div className="flex flex-col gap-4 rounded-card bg-surface-sunken p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-text-default">Schedules</h2>
          <Button size="sm" onClick={page.openNew} type="button">
            <Plus aria-hidden="true" />
            New schedule
          </Button>
        </div>

        {items.length === 0 ? (
          <p className="rounded-card border border-dashed border-border-strong bg-surface p-6 text-sm text-text-muted">
            No briefs are scheduled yet. Create one to email the executive brief automatically, or generate a one-off brief from the Report Builder.
          </p>
        ) : (
          <ReportSchedulesTable
            schedules={items}
            busyId={page.busyId}
            onEdit={page.openEdit}
            onToggle={page.toggle}
            onSendTest={page.sendTest}
            onSendNow={page.sendNow}
            onDelete={page.askDelete}
          />
        )}
      </div>

      <ReportScheduleDialog
        open={page.dialogOpen}
        schedule={page.editing}
        isSaving={page.isSaving}
        onClose={page.closeDialog}
        onSave={page.saveSchedule}
      />

      <ConfirmDialog
        open={page.pendingDelete !== null}
        title="Delete this schedule?"
        description={page.pendingDelete ? `“${page.pendingDelete.name}” will stop sending. Briefs already sent are not affected.` : undefined}
        confirmLabel="Delete schedule"
        isPending={page.isDeleting}
        onConfirm={page.confirmDelete}
        onCancel={page.cancelDelete}
      />
    </div>
  )
}
