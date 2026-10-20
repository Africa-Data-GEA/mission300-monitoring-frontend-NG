import { useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { REVIEWER_ONLY_ROLES, type UserAccount } from '@/api/schemas/administration'
import { Button } from '@/components/ui/button'
import { SelectField } from '@/components/ui/select-field'
import { SideDialog } from '@/components/ui/side-dialog'
import { readAuthSession, saveAuthSession } from '@/features/auth/auth-session'
import { landingPathForUser } from '@/features/auth/role-access'
import { ApiError } from '@/lib/api-client'
import { dashboardToast } from '@/lib/dashboard-toast'
import { updateUserAccess, useInstitutionOptions } from '../api'
import { RoleSelector } from './role-selector'

const INPUT_CLASS =
  'mt-1.5 h-11 w-full rounded-control border border-border-strong bg-surface px-3.5 text-base text-text-default placeholder:text-text-subtle disabled:opacity-50'

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="space-y-4 border-b border-border-default pb-6 last:border-b-0 last:pb-0">
      <div>
        <h3 className="text-base font-semibold text-text-default">{title}</h3>
        {description && <p className="mt-0.5 text-sm text-text-muted">{description}</p>}
      </div>
      {children}
    </section>
  )
}

export function EditUserDialog({
  user,
  onClose,
  onSaved,
}: {
  user: UserAccount
  onClose: () => void
  onSaved: () => void
}) {
  const navigate = useNavigate()
  const institutionOptions = useInstitutionOptions()
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [designation, setDesignation] = useState(user.designation)
  const [roles, setRoles] = useState<UserAccount['role'][]>(user.roles?.length ? user.roles : [user.role])
  const [reviewsAll, setReviewsAll] = useState(user.reviewsAllInstitutions === true)
  const [institution, setInstitution] = useState(user.reviewsAllInstitutions ? '' : user.institution)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  const editingOwnAccount = readAuthSession()?.user.id === user.id
  const emailChanged = email.trim().toLowerCase() !== user.email.toLowerCase()

  const reviewerOnly = roles.length > 0 && roles.every((role) => (REVIEWER_ONLY_ROLES as readonly string[]).includes(role))
  const wideScope = reviewerOnly && reviewsAll
  const needsInstitution = !wideScope && (roles.includes('institutional-data-provider') || reviewerOnly)
  const options = (institutionOptions.data ?? []).map((item) => ({ value: item.name, label: item.name }))
  const invalid =
    pending ||
    name.trim().length < 2 ||
    designation.trim().length < 2 ||
    !email.includes('@') ||
    roles.length === 0 ||
    (needsInstitution && !institution)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!roles.length) return setError('Select at least one role.')
    if (needsInstitution && !institution) return setError('Select an institution.')
    setPending(true)
    setError('')
    try {
      const updated = await updateUserAccess(user.id, {
        name: name.trim(),
        email: email.trim(),
        designation: designation.trim(),
        roles,
        ...(wideScope ? { reviewsAllInstitutions: true } : institution ? { institution } : {}),
      })
      const session = readAuthSession()
      if (session?.user.id === updated.id) {
        const nextUser = {
          ...session.user,
          name: updated.name,
          email: updated.email,
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
      dashboardToast.success(`${updated.name} updated`)
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.message : 'Could not save this user.')
    } finally {
      setPending(false)
    }
  }

  return (
    <SideDialog open onClose={onClose} title={`Edit user — ${user.name}`}
      description="Change this person's details, what they can do, and which institution they work for.">
      <form onSubmit={submit} className="w-full space-y-6">
        <Section title="Profile" description="How this person appears in the platform.">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm font-medium text-text-default">
              Full name
              <input className={INPUT_CLASS} value={name} disabled={pending} onChange={(event) => setName(event.target.value)} />
            </label>
            <label className="text-sm font-medium text-text-default">
              Work email
              <input className={INPUT_CLASS} type="email" inputMode="email" value={email} disabled={pending} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <label className="text-sm font-medium text-text-default md:col-span-2">
              Designation
              <input className={INPUT_CLASS} value={designation} disabled={pending} placeholder="e.g. Monitoring Officer" onChange={(event) => setDesignation(event.target.value)} />
            </label>
          </div>
          {emailChanged && (
            <p className="text-sm text-status-at-risk">
              Changing the email changes how this person signs in, and signs them out of every session.
            </p>
          )}
        </Section>

        <Section title="Access" description="Pick every role this person needs. Their combined permissions apply.">
          <RoleSelector value={roles} onChange={setRoles} disabled={pending} />
          {editingOwnAccount && !roles.includes('system-administrator') && (
            <p className="text-sm text-status-at-risk">
              Saving this change will remove your access to Administration immediately.
            </p>
          )}
        </Section>

        <Section title="Institution" description="The institution this person provides or reviews data for.">
          {reviewerOnly && (
            <label className="flex items-start gap-2 text-sm text-text-default">
              <input type="checkbox" className="mt-1" checked={reviewsAll} disabled={pending}
                onChange={(event) => setReviewsAll(event.target.checked)} />
              <span>
                Reviews all institutions
                <span className="block text-xs text-text-muted">A platform-wide reviewer. Untick to limit them to one institution.</span>
              </span>
            </label>
          )}
          {!wideScope && (
            <SelectField
              label="Institution"
              labelClassName="text-sm text-text-default"
              triggerClassName="h-11"
              value={institution}
              options={options}
              onChange={setInstitution}
              placeholder={institutionOptions.isLoading ? 'Loading institutions…' : 'Select institution'}
              disabled={pending || institutionOptions.isLoading}
              searchable
            />
          )}
        </Section>

        {error && <p role="alert" className="text-sm text-status-at-risk">{error}</p>}
        <div className="flex justify-end gap-3 border-t border-border-default pt-4">
          <Button type="button" variant="secondary" onClick={onClose} disabled={pending}>Cancel</Button>
          <Button type="submit" disabled={invalid}>{pending ? 'Saving…' : 'Save changes'}</Button>
        </div>
      </form>
    </SideDialog>
  )
}
