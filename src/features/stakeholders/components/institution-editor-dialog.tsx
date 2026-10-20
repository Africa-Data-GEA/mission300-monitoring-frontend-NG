import { useState, type FormEvent } from 'react'
import type { Institution, InstitutionWrite } from '@/api/schemas/stakeholders'
import { Button } from '@/components/ui/button'
import { SelectField } from '@/components/ui/select-field'
import { SideDialog } from '@/components/ui/side-dialog'
import { ApiError } from '@/lib/api-client'

const TYPE_OPTIONS = [
  'Federal Ministry',
  'Federal Agency',
  'Regulator',
  'Disco',
  'State-Owned Enterprise',
  'Regional Body',
  'Federal Coordinating Unit',
  'Federal Programme Unit',
].map((value) => ({ value, label: value }))

export function InstitutionEditorDialog({
  institution,
  onClose,
  onSave,
}: {
  institution: Institution | null
  onClose: () => void
  onSave: (input: InstitutionWrite) => Promise<void>
}) {
  const [name, setName] = useState(institution?.name ?? '')
  const [type, setType] = useState('')
  const [error, setError] = useState('')
  const [pending, setPending] = useState(false)

  async function submit(event: FormEvent) {
    event.preventDefault()
    setPending(true)
    setError('')
    try {
      await onSave({ name: name.trim(), ...(type ? { type } : {}) })
      onClose()
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.message : 'The institution could not be saved.')
    } finally {
      setPending(false)
    }
  }

  return (
    <SideDialog
      open
      onClose={onClose}
      title={institution ? 'Edit institution' : 'Add institution'}
      description="Maintain the official institution registry used across reporting and assignments."
    >
      <form className="w-full space-y-5" onSubmit={submit}>
        <label className="block text-sm font-medium text-text-default">
          Institution name
          <input
            autoFocus
            className="mt-2 h-10 w-full rounded-control border border-border-default bg-surface px-3 text-sm"
            disabled={pending}
            minLength={2}
            onChange={(event) => setName(event.target.value)}
            required
            value={name}
          />
        </label>
        <SelectField
          label="Institution type"
          labelClassName="text-sm text-text-default"
          triggerClassName="h-10"
          value={type}
          options={TYPE_OPTIONS}
          onChange={setType}
          placeholder={institution ? `Keep current type (${institution.type.replace('-', ' ')})` : 'Select a type'}
          disabled={pending}
        />
        {error ? <p className="text-sm text-status-at-risk" role="alert">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <Button disabled={pending} onClick={onClose} type="button" variant="secondary">Cancel</Button>
          <Button disabled={pending || name.trim().length < 2 || (!institution && !type)} type="submit">
            {pending ? 'Saving…' : 'Save institution'}
          </Button>
        </div>
      </form>
    </SideDialog>
  )
}
