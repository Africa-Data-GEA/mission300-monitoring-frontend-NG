import type { LearningLogType } from '@/api/schemas/learning-log'
import { SideDialog } from '@/components/ui/side-dialog'
import { useLearningLogOptions } from '../api'
import { useCreateLearningLogForm } from '../use-create-learning-log-entry'
import { CreateLearningLogEntryForm } from './create-learning-log-entry-form'
import { CreateLearningLogEntrySuccess } from './create-learning-log-entry-success'

/** Side-dialog entry point for logging a new decision or learning. */
export function CreateLearningLogEntryDialog({
  onClose,
  onCreated,
  open,
  entryType,
}: {
  onClose: () => void
  onCreated: () => void
  open: boolean
  entryType: LearningLogType
}) {
  const creation = useCreateLearningLogForm(entryType, onCreated)
  const isLearning = entryType === 'learning'
  const options = useLearningLogOptions()

  return (
    <SideDialog
      description={
        isLearning
          ? 'Record what happened, what was learned and what to do differently.'
          : 'Record a decision, course-correction, or review outcome.'
      }
      onClose={onClose}
      open={open}
      title={isLearning ? 'Log a learning' : 'Log a decision'}
    >
      {creation.successMessage ? (
        <CreateLearningLogEntrySuccess message={creation.successMessage} onDone={onClose} />
      ) : (
        <CreateLearningLogEntryForm
          form={creation.form}
          onSubmit={creation.submit}
          serverError={creation.serverError}
          options={options.data}
        />
      )}
    </SideDialog>
  )
}
