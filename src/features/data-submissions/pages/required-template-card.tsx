import { Download } from 'lucide-react'
import type { UploadDefinition } from '@/api/schemas/data-submissions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

/** Sidebar summarising the required template, plus the submit action. */
export function RequiredTemplateCard({
  template,
  canSubmit,
  isUploading,
  uploadError,
}: {
  template: UploadDefinition['template']
  canSubmit: boolean
  isUploading: boolean
  uploadError: Error | null
}) {
  return (
    <Card className="h-fit p-4">
      <h2 className="font-semibold text-text-default">Required template</h2>
      <p className="mt-2 text-sm">{template.fileName}</p>
      <p className="text-xs text-text-muted">Version {template.version}</p>

      <Button asChild className="mt-4 w-full" variant="secondary">
        <a href={template.downloadUrl} download>
          <Download />
          Download template
        </a>
      </Button>

      {uploadError && (
        <p className="mt-4 text-sm text-status-at-risk" role="alert">
          {uploadError.message}
        </p>
      )}

      <Button className="mt-3 w-full" disabled={!canSubmit} type="submit">
        {isUploading ? 'Uploading…' : 'Upload and validate'}
      </Button>
    </Card>
  )
}
