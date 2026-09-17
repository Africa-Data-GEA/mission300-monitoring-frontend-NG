import { SideDialog } from '@/components/ui/side-dialog'
import { useInstitutionOptions } from '../api'
import { useInviteUser } from '../use-invite-user'
import { InviteUserForm } from './invite-user-form'
import { InviteUserSuccess } from './invite-user-success'

/** Side-dialog entry point for inviting a new user account. */
export function InviteUserDialog({
  onClose,
  onInvited,
  open,
}: {
  onClose: () => void
  onInvited: () => void
  open: boolean
}) {
  const invitation = useInviteUser(onInvited)
  const institutionOptions = useInstitutionOptions()

  return (
    <SideDialog
      description="Create a pending account and send secure onboarding instructions."
      onClose={onClose}
      open={open}
      title="Invite new user"
    >
      {invitation.successMessage ? (
        <InviteUserSuccess message={invitation.successMessage} onDone={onClose} />
      ) : (
        <InviteUserForm
          form={invitation.form}
          onSubmit={invitation.submit}
          serverError={invitation.serverError}
          institutions={institutionOptions.data ?? []}
          institutionsLoading={institutionOptions.isLoading}
        />
      )}
    </SideDialog>
  )
}
