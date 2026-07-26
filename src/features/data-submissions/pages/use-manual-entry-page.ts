import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useManualEntryDefinition, useSaveManualEntry } from '../api'

/**
 * All state and submission logic for the manual-entry page.
 *
 * Kept separate from manual-entry-page.tsx so the page component is pure
 * presentation: it reads this hook and renders, with no state of its own.
 */
export function useManualEntryPage() {
  const id = useParams().obligationId ?? ''
  const navigate = useNavigate()

  const definition = useManualEntryDefinition(id)
  const save = useSaveManualEntry(id)

  const [values, setValues] = useState<Record<string, string>>({})
  const [sourceReference, setSourceReference] = useState('')
  const [notes, setNotes] = useState('')

  function setFieldValue(fieldId: string, value: string) {
    setValues((current) => ({ ...current, [fieldId]: value }))
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    const result = await save.mutateAsync({ values, sourceReference, notes })
    navigate(result.nextUrl)
  }

  return {
    definition,
    values,
    setFieldValue,
    sourceReference,
    setSourceReference,
    notes,
    setNotes,
    isSaving: save.isPending,
    saveError: save.error,
    submit: (event: FormEvent) => void submit(event),
  }
}
