import type { ReportSchedule, ReportScheduleInput } from '@/api/schemas/report-schedules'
import { SideDialog } from '@/components/ui/side-dialog'
import { ReportScheduleForm } from './report-schedule-form'

/** Creates or edits a schedule for the one-page executive brief. */
export function ReportScheduleDialog({
  open,
  schedule,
  isSaving,
  onClose,
  onSave,
}: {
  open: boolean
  schedule: ReportSchedule | null
  isSaving: boolean
  onClose: () => void
  onSave: (input: ReportScheduleInput) => void
}) {
  return (
    <SideDialog
      open={open}
      onClose={onClose}
      title={schedule ? 'Edit schedule' : 'New scheduled brief'}
      description="The one-page executive brief is generated on the schedule and emailed as a PDF."
    >
      <ReportScheduleForm key={schedule?.id ?? 'new'} schedule={schedule} isSaving={isSaving} onSave={onSave} onCancel={onClose} />
    </SideDialog>
  )
}
