import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
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

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!file) return

    const body = new FormData()
    body.append('file', file)
    body.append('sourceReference', sourceReference)
    body.append('notes', notes)

    const result = await upload.mutateAsync(body)
    navigate(result.nextUrl)
  }

  return {
    definition,
    file,
    setFile,
    sourceReference,
    setSourceReference,
    notes,
    setNotes,
    isUploading: upload.isPending,
    uploadError: upload.error,
    canSubmit: file !== null && !upload.isPending,
    submit: (event: FormEvent) => void submit(event),
  }
}
