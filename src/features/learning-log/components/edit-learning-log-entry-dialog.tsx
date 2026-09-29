import { SideDialog } from '@/components/ui/side-dialog'
import type { LearningLogEntry } from '@/api/schemas/learning-log'
import { useEditLearningLogForm } from '../use-edit-learning-log-entry'
import { CreateLearningLogEntryForm } from './create-learning-log-entry-form'
import { CreateLearningLogEntrySuccess } from './create-learning-log-entry-success'

/** Side-dialog entry point for editing an existing decision, mirroring
 * CreateLearningLogEntryDialog - same form, pre-filled and PATCHed instead
 * of POSTed. */
export function EditLearningLogEntryDialog({
  entry,
  onClose,
  onUpdated,
}: {
  entry: LearningLogEntry | null
  onClose: () => void
  onUpdated: () => void
}) {
  return (
    <SideDialog
      description="Update this decision's details, or move it to its next status."
      onClose={onClose}
      open={entry !== null}
      title="Edit decision"
    >
      {entry && <EditLearningLogEntryDialogBody entry={entry} onClose={onClose} onUpdated={onUpdated} />}
    </SideDialog>
  )
}

// Split out so useEditLearningLogForm (and the form it drives) only ever
// mounts once a real entry exists - the dialog's own open/close animation
// stays driven by entry !== null above, matching SideDialog's own pattern
// for every other create/edit dialog in this app.
function EditLearningLogEntryDialogBody({
  entry,
  onClose,
  onUpdated,
}: {
  entry: LearningLogEntry
  onClose: () => void
  onUpdated: () => void
}) {
  const editing = useEditLearningLogForm(entry, onUpdated)

  return editing.successMessage ? (
    <CreateLearningLogEntrySuccess heading="Entry updated" message={editing.successMessage} onDone={onClose} />
  ) : (
    <CreateLearningLogEntryForm form={editing.form} isEditing onSubmit={editing.submit} serverError={editing.serverError} />
  )
}
