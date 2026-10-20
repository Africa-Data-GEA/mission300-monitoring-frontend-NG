import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  createLearningLogEntryRequestSchema,
  type CreateLearningLogEntryRequest,
  type LearningLogEntry,
} from '@/api/schemas/learning-log'
import { ApiError } from '@/lib/api-client'
import { useUpdateLearningLogEntry } from './api'

function toFormValues(entry: LearningLogEntry): CreateLearningLogEntryRequest {
  return {
    entryType: entry.entryType ?? 'decision',
    title: entry.title,
    area: entry.area,
    decision: entry.decision,
    rationale: entry.rationale,
    context: entry.context ?? '',
    lesson: entry.lesson ?? '',
    recommendation: entry.recommendation ?? '',
    evidence: entry.evidence ?? '',
    relatedRecord: entry.relatedRecord ?? '',
    reviewCycle: entry.reviewCycle,
    status: entry.status,
  }
}

/** Form state and submission for editing an existing entry, mirroring
 * use-create-learning-log-entry.ts - same request shape (a full patch, not
 * a partial one), since the form always has every field populated. */
export function useEditLearningLogForm(entry: LearningLogEntry, onUpdated: () => void) {
  const [serverError, setServerError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const mutation = useUpdateLearningLogEntry()

  const form = useForm<CreateLearningLogEntryRequest>({
    resolver: zodResolver(createLearningLogEntryRequestSchema),
    defaultValues: toFormValues(entry),
  })

  const submit = form.handleSubmit(async (values) => {
    setServerError('')
    try {
      const response = await mutation.mutateAsync({ id: entry.id, input: values })
      setSuccessMessage(response.message)
      onUpdated()
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : 'The entry could not be updated. Please try again.',
      )
    }
  })

  return { form, serverError, submit, successMessage }
}
