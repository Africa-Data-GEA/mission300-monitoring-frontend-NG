import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  importRegisterRequestSchema,
  type ImportRegisterRequest,
  type ImportRegisterResponse,
} from '@/api/schemas/implementation-register'
import { ApiError } from '@/lib/api-client'
import { importRegister } from './api'

/**
 * Form state and submission for the "import register update" dialog.
 *
 * Mirrors use-create-bottleneck.ts: a react-hook-form instance validated
 * against the same zod schema the server enforces, plus server-error and
 * result state the dialog reads to decide which view to show. The result is
 * the validation report itself (Section E), not a success message, so the
 * dialog can render the error rows when `errorRows > 0`.
 */
export function useImportRegister(onImported: () => void) {
  const [serverError, setServerError] = useState('')
  const [result, setResult] = useState<ImportRegisterResponse | null>(null)
  const form = useForm<ImportRegisterRequest>({
    resolver: zodResolver(importRegisterRequestSchema),
    defaultValues: { fileName: '' },
  })

  const submit = form.handleSubmit(async (values) => {
    setServerError('')
    try {
      const response = await importRegister(values)
      setResult(response)
      if (response.errorRows === 0) onImported()
    } catch (error) {
      setServerError(
        error instanceof ApiError
          ? error.message
          : 'The file could not be validated. Please try again.',
      )
    }
  })

  function reset() {
    form.reset()
    setResult(null)
    setServerError('')
  }

  return { form, serverError, submit, result, reset }
}
