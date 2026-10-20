import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { destinationAfterSubmit } from '../lib/after-submit'
import { readRowProblems, type RowProblem } from '../lib/row-problems'
import { toastRefused, toastSubmitted } from '../lib/submit-toast'
import { useUploadDefinition, useUploadSubmission } from '../api'

/**
 * All state and submission logic for the template-upload page.
 *
 * Kept separate from upload-page.tsx so the page component is pure
 * presentation: it reads this hook and renders, with no state of its own.
 */
export function useUploadPage() {
  const id = useParams().obligationId ?? ''
  const navigate = useNavigate()

  const definition = useUploadDefinition(id)
  const upload = useUploadSubmission(id)

  const [file, setFile] = useState<File | null>(null)
  const [sourceReference, setSourceReference] = useState('')
  const [notes, setNotes] = useState('')
  const [rowProblems, setRowProblems] = useState<RowProblem[]>([])

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!file) return

    setRowProblems([])
    const body = new FormData()
    body.append('file', file)
    body.append('sourceReference', sourceReference)
    body.append('notes', notes)

    let result
    try {
      result = await upload.mutateAsync(body)
    } catch (error) {
      const problems = readRowProblems(error)
      setRowProblems(problems)
      toastRefused(error, problems.length > 0)
      return
    }
    toastSubmitted(result.message)
    navigate(destinationAfterSubmit(result.nextUrl))
  }

  return {
    definition,
    file,
    setFile: (next: File | null) => {
      setRowProblems([])
      setFile(next)
    },
    rowProblems,
    sourceReference,
    setSourceReference,
    notes,
    setNotes,
    isUploading: upload.isPending,
    canSubmit: file !== null && !upload.isPending,
    submit: (event: FormEvent) => void submit(event),
  }
}
