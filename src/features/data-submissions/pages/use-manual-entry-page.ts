import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import type { ManualEntryDefinition } from '@/api/schemas/data-submissions'
import { destinationAfterSubmit } from '../lib/after-submit'
import { gridPayload, newGridRow, rowsMissingChoices, type EntryGridRow } from '../lib/entry-grid'
import { periodChoices } from '../lib/period-options'
import { toastDraftDiscarded, toastDraftSaved, toastRefused, toastSubmitted } from '../lib/submit-toast'
import {
  useDiscardEntryDraft,
  useEntryDraft,
  useManualEntryDefinition,
  useSaveEntryDraft,
  useSaveManualEntry,
} from '../api'

function wantsGrid(definition: ManualEntryDefinition | undefined): boolean {
  return Boolean(definition && (definition.consolidated || (definition.periods?.length ?? 0) > 1))
}

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
  const draftQuery = useEntryDraft(id)
  const saveDraft = useSaveEntryDraft(id)
  const discardDraft = useDiscardEntryDraft(id)
  const draft = draftQuery.data?.draft ?? null

  const [typedValues, setValues] = useState<Record<string, string> | null>(null)
  const [gridRows, setGridRows] = useState<EntryGridRow[] | null>(null)
  const [typedReference, setSourceReference] = useState<string | null>(null)
  const [typedNotes, setNotes] = useState<string | null>(null)

  const draftRows = useMemo(
    () =>
      draft?.rows?.map((row) => ({
        ...newGridRow(row.period ?? '', row.institution ?? ''),
        values: row.values,
      })) ?? null,
    [draft],
  )
  const values = typedValues ?? draft?.values ?? {}
  const sourceReference = typedReference ?? draft?.sourceReference ?? ''
  const notes = typedNotes ?? draft?.notes ?? ''

  const data = definition.data
  const grid = wantsGrid(data)
  const consolidated = data?.consolidated === true
  const periods = data
    ? consolidated
      ? periodChoices(data.frequency ?? 'Quarterly', data.reportingPeriod)
      : (data.periods ?? [])
    : []
  const rows = gridRows ?? draftRows ?? (data ? [newGridRow(data.reportingPeriod)] : [])

  function setFieldValue(fieldId: string, value: string) {
    setValues({ ...values, [fieldId]: value })
  }

  function changeRow(key: string, patch: Partial<EntryGridRow>) {
    setGridRows(rows.map((row) => (row.key === key ? { ...row, ...patch } : row)))
  }

  function removeRow(key: string) {
    setGridRows(rows.filter((row) => row.key !== key))
  }

  function addRow() {
    const last = rows.at(-1)
    setGridRows([...rows, newGridRow(last?.period ?? data?.reportingPeriod ?? '')])
  }

  function addAllDiscos() {
    const period = rows.at(-1)?.period ?? data?.reportingPeriod ?? ''
    const present = new Set(rows.map((row) => row.institution).filter(Boolean))
    const blank = rows.filter((row) => row.institution || Object.keys(row.values).length > 0)
    const missing = (data?.institutions ?? []).filter((name) => !present.has(name))
    setGridRows([...blank, ...missing.map((name) => newGridRow(period, name))])
  }

  function currentPayload() {
    return grid
      ? { rows: gridPayload(rows, consolidated), sourceReference, notes }
      : { values, sourceReference, notes }
  }

  async function saveAsDraft() {
    try {
      const result = await saveDraft.mutateAsync(currentPayload())
      toastDraftSaved(result.message)
    } catch (error) {
      toastRefused(error)
    }
  }

  async function discard() {
    try {
      await discardDraft.mutateAsync()
    } catch (error) {
      toastRefused(error)
      return
    }
    setValues({})
    setGridRows(null)
    setSourceReference('')
    setNotes('')
    toastDraftDiscarded()
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (grid) {
      const problem = rowsMissingChoices(rows, consolidated)
      if (problem) {
        toastRefused(new Error(problem))
        return
      }
    }
    let result
    try {
      result = await save.mutateAsync(currentPayload())
    } catch (error) {
      toastRefused(error)
      return
    }
    toastSubmitted(result.message)
    navigate(destinationAfterSubmit(result.nextUrl))
  }

  return {
    definition,
    grid,
    rows,
    periods,
    changeRow,
    removeRow,
    addRow,
    addAllDiscos,
    values,
    setFieldValue,
    sourceReference,
    setSourceReference,
    notes,
    setNotes,
    isSaving: save.isPending,
    draft,
    isSavingDraft: saveDraft.isPending,
    isDiscardingDraft: discardDraft.isPending,
    saveDraft: () => void saveAsDraft(),
    discardDraft: () => void discard(),
    submit: (event: FormEvent) => void submit(event),
  }
}
