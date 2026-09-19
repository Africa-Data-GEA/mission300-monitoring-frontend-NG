import { useState, type FormEvent } from 'react'
import type { UserAccount } from '@/api/schemas/administration'
import { Button } from '@/components/ui/button'
import { SideDialog } from '@/components/ui/side-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ApiError } from '@/lib/api-client'
import { dashboardToast } from '@/lib/dashboard-toast'
import { updateUserInstitution, useInstitutionOptions } from '../api'

export function EditUserInstitutionDialog({
  user,
  onClose,
  onSaved,
}: {
  user: UserAccount
  onClose: () => void
  onSaved: () => void
}) {
  const institutionOptions = useInstitutionOptions()
  const [institution, setInstitution] = useState(user.institution)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!institution) return setError('Select an institution.')
    setPending(true)
    setError('')
    try {
      const updated = await updateUserInstitution(user.id, institution)
      onSaved()
      onClose()
      dashboardToast.success(`Institution updated for ${updated.name}`)
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.message : 'Could not save this user’s institution.')
    } finally {
      setPending(false)
    }
  }

  return (
    <SideDialog open onClose={onClose} title={`Edit institution — ${user.name}`}
      description="The institution this user provides or reviews data for.">
      <form onSubmit={submit} className="max-w-xl space-y-5">
        <p className="text-sm text-text-muted">{user.email}</p>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-text-default" htmlFor="user-institution">
            Institution
          </label>
          <Select onValueChange={setInstitution} value={institution}>
            <SelectTrigger className="h-11" id="user-institution">
              <SelectValue
                placeholder={institutionOptions.isLoading ? 'Loading institutions…' : 'Select institution'}
              />
            </SelectTrigger>
            <SelectContent>
              {(institutionOptions.data ?? []).map((item) => (
                <SelectItem key={item.id} value={item.name}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {error && <p role="alert" className="text-sm text-status-at-risk">{error}</p>}
        <div className="flex justify-end gap-3 border-t border-border-default pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={pending}>Cancel</Button>
          <Button type="submit" disabled={pending || !institution}>
            {pending ? 'Saving…' : 'Save institution'}
          </Button>
        </div>
      </form>
    </SideDialog>
  )
}
