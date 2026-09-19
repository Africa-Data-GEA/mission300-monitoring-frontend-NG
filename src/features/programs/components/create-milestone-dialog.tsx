import { SideDialog } from '@/components/ui/side-dialog'
import { useCreateMilestone } from '../use-create-milestone'
import { CreateMilestoneForm } from './create-milestone-form'
import { CreateMilestoneSuccess } from './create-milestone-success'

/** Side-dialog entry point for adding a milestone to a project. */
export function CreateMilestoneDialog({
  onClose,
  onCreated,
  open,
  projectId,
}: {
  onClose: () => void
  onCreated: () => void
  open: boolean
  projectId: string
}) {
  const creation = useCreateMilestone(projectId, onCreated)

  return (
    <SideDialog
      description="Add a delivery checkpoint to this project's timeline."
      onClose={onClose}
      open={open}
      title="Add milestone"
    >
      {creation.successMessage ? (
        <CreateMilestoneSuccess message={creation.successMessage} onDone={onClose} />
      ) : (
        <CreateMilestoneForm
          form={creation.form}
          onSubmit={creation.submit}
          serverError={creation.serverError}
        />
      )}
    </SideDialog>
  )
}
