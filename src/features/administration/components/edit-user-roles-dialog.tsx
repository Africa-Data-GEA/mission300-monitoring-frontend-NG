import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { SYSTEM_ROLE_LABELS, type UserAccount } from '@/api/schemas/administration'
import { Button } from '@/components/ui/button'
import { SideDialog } from '@/components/ui/side-dialog'
import { readAuthSession, saveAuthSession } from '@/features/auth/auth-session'
import { landingPathForUser } from '@/features/auth/role-access'
import { ApiError } from '@/lib/api-client'
import { dashboardToast } from '@/lib/dashboard-toast'
import { updateUserRoles } from '../api'

export function EditUserRolesDialog({
  user,
  onClose,
  onSaved,
}: {
  user: UserAccount
  onClose: () => void
  onSaved: () => void
}) {
  const navigate = useNavigate()
  const [roles, setRoles] = useState<UserAccount['role'][]>(user.roles?.length ? user.roles : [user.role])
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const editingOwnAccess = readAuthSession()?.user.id === user.id

  function toggle(role: UserAccount['role'], checked: boolean) {
    setRoles((current) => checked
      ? current.includes(role) ? current : [...current, role]
      : current.filter((entry) => entry !== role))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!roles.length) return setError('Select at least one role.')
    setPending(true)
    setError('')
    try {
      const updated = await updateUserRoles(user.id, roles)
      const session = readAuthSession()
      if (session?.user.id === updated.id) {
        const nextUser = {
          ...session.user,
          role: updated.role,
          roles: updated.roles?.length ? updated.roles : [updated.role],
        }
        saveAuthSession({ ...session, user: nextUser })
        if (!nextUser.roles.includes('system-administrator')) {
          navigate(landingPathForUser(nextUser), { replace: true })
        }
      }
      onSaved()
      onClose()
      dashboardToast.success(`Roles updated for ${updated.name}`)
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.message : 'Could not save this user’s roles.')
    } finally {
      setPending(false)
    }
  }

  return (
    <SideDialog open onClose={onClose} title={`Edit roles — ${user.name}`}
      description="Checked roles grant their combined capabilities to this account.">
      <form onSubmit={submit} className="max-w-xl space-y-5">
        <p className="text-sm text-text-muted">{user.email}</p>
        <fieldset className="space-y-3 rounded-control border border-border-strong p-4">
          <legend className="px-1 font-medium text-text-default">Roles this user can perform</legend>
          {Object.entries(SYSTEM_ROLE_LABELS).map(([value, label]) => {
            const role = value as UserAccount['role']
            return (
              <label key={role} className="flex items-center gap-3 text-sm text-text-default">
                <input type="checkbox" checked={roles.includes(role)} disabled={pending}
                  onChange={(event) => toggle(role, event.target.checked)} />
                {label}
              </label>
            )
          })}
        </fieldset>
        {editingOwnAccess && !roles.includes('system-administrator') && (
          <p className="text-sm text-status-at-risk">
            Saving this change will remove your access to Administration immediately.
          </p>
        )}
        {error && <p role="alert" className="text-sm text-status-at-risk">{error}</p>}
        <div className="flex justify-end gap-3 border-t border-border-default pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={pending}>Cancel</Button>
          <Button type="submit" disabled={pending || roles.length === 0}>
            {pending ? 'Saving…' : 'Save roles'}
          </Button>
        </div>
      </form>
    </SideDialog>
  )
}
