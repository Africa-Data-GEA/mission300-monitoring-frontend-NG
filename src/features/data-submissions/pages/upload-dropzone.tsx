import { Upload } from 'lucide-react'
import type { UploadDefinition } from '@/api/schemas/data-submissions'

/** The file-picker dropzone plus the source-reference and notes fields. */
export function UploadDropzone({
  definition,
  file,
  onFileChange,
  sourceReference,
  onSourceReferenceChange,
  notes,
  onNotesChange,
}: {
  definition: UploadDefinition
  file: File | null
  onFileChange: (file: File | null) => void
  sourceReference: string
  onSourceReferenceChange: (value: string) => void
  notes: string
  onNotesChange: (value: string) => void
}) {
  return (
    <>
      <div className="rounded-card border border-dashed border-border-strong bg-surface-sunken p-8 text-center">
        <Upload className="mx-auto size-8 text-text-muted" aria-hidden="true" />
        <label className="mt-3 block font-medium" htmlFor="submission-file">
          Choose a completed template
        </label>
        <p className="mt-1 text-sm text-text-muted">
          {definition.acceptedFileTypesLabel}; maximum {definition.maxFileSizeMb} MB
        </p>
        <input
          id="submission-file"
          type="file"
          required
          accept={definition.acceptedFileTypes.join(',')}
          onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
          className="mx-auto mt-4 block max-w-full text-sm"
        />
        {file && <p className="mt-3 text-sm font-medium">{file.name}</p>}
      </div>

      <div className="mt-5 grid gap-4">
        <label className="text-sm font-medium" htmlFor="upload-source">
          Source reference *
          <input
            id="upload-source"
            required
            value={sourceReference}
            onChange={(event) => onSourceReferenceChange(event.target.value)}
            className="mt-1.5 h-10 w-full rounded-control border border-border-default px-3"
          />
        </label>
        <label className="text-sm font-medium" htmlFor="upload-notes">
          Notes
          <textarea
            id="upload-notes"
            value={notes}
            onChange={(event) => onNotesChange(event.target.value)}
            className="mt-1.5 min-h-24 w-full rounded-control border border-border-default px-3 py-2"
          />
        </label>
      </div>
    </>
  )
}
