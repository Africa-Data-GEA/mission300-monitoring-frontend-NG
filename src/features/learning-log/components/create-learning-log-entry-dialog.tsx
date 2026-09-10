import { SideDialog } from '@/components/ui/side-dialog'
import { useCreateLearningLogForm } from '../use-create-learning-log-entry'
import { CreateLearningLogEntryForm } from './create-learning-log-entry-form'
import { CreateLearningLogEntrySuccess } from './create-learning-log-entry-success'

/** Side-dialog entry point for logging a new decision or course-correction. */
export function CreateLearningLogEntryDialog({
  onClose,
  onCreated,
  open,
}: {
  onClose: () => void
  onCreated: () => void
  open: boolean
}) {
  const creation = useCreateLearningLogForm(onCreated)

  return (
    <SideDialog
      description="Record a decision, course-correction, or review outcome."
      onClose={onClose}
      open={open}
      title="Log a decision"
    >
      {creation.successMessage ? (
        <CreateLearningLogEntrySuccess message={creation.successMessage} onDone={onClose} />
      ) : (
        <CreateLearningLogEntryForm form={creation.form} onSubmit={creation.submit} serverError={creation.serverError} />
      )}
    </SideDialog>
  )
}
