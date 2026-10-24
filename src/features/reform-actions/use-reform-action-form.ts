import { useState, type FormEvent } from 'react'
import { reformActionRequestSchema, type ReformActionDetail, type ReformActionRequest } from '@/api/schemas/reform-actions'
import { useCreateReformAction, useUpdateReformAction } from './api'

function dateOnly(value: string | null | undefined) {
  return value ? value.slice(0, 10) : ''
}

function toStartOfDay(value: string) {
  return value ? new Date(`${value}T00:00:00.000Z`).toISOString() : null
}

export interface ReformActionDraft {
  pillar: string
  commitment: string
  action: string
  isPriority: boolean
  programmeId: string
  leadInstitution: string
  referenceDueDate: string
  dueDate: string
  status: ReformActionRequest['status']
  comment: string
  statusNote: string
}

function initialDraft(action: ReformActionDetail | null, pillar: string): ReformActionDraft {
  return {
    pillar: action?.pillar ?? pillar,
    commitment: action?.commitment ?? '',
    action: action?.action ?? '',
    isPriority: action?.isPriority ?? false,
    programmeId: action?.programme?.id ?? '',
    leadInstitution: action?.leadInstitution ?? '',
    referenceDueDate: dateOnly(action?.referenceDueDate),
    dueDate: dateOnly(action?.dueDate),
    status: action?.status ?? 'not-yet-due',
    comment: action?.comment ?? '',
    statusNote: '',
  }
}

export function useReformActionForm(action: ReformActionDetail | null, defaultPillar: string, onSaved: (message: string) => void) {
  const create = useCreateReformAction()
  const update = useUpdateReformAction(action?.id ?? '')
  const [draft, setDraft] = useState(() => initialDraft(action, defaultPillar))
  const [error, setError] = useState<string | null>(null)

  function change(patch: Partial<ReformActionDraft>) {
    setDraft((current) => ({ ...current, ...patch }))
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    const parsed = reformActionRequestSchema.safeParse({
      pillar: draft.pillar,
      commitment: draft.commitment.trim(),
      action: draft.action.trim(),
      isPriority: draft.isPriority,
      programmeId: draft.programmeId || null,
      leadInstitution: draft.leadInstitution.trim(),
      referenceDueDate: toStartOfDay(draft.referenceDueDate),
      dueDate: toStartOfDay(draft.dueDate),
      status: draft.status,
      comment: draft.comment.trim(),
      statusNote: draft.statusNote.trim() || undefined,
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Check the details and try again.')
      return
    }
    setError(null)
    try {
      const result = action ? await update.mutateAsync(parsed.data) : await create.mutateAsync(parsed.data)
      onSaved(result.message)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The reform action could not be saved.')
    }
  }

  return {
    draft,
    change,
    error,
    isSaving: create.isPending || update.isPending,
    statusChanged: action ? action.status !== draft.status : false,
    submit: (event: FormEvent) => void submit(event),
  }
}
