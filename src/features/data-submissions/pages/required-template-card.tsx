import type { UploadDefinition } from '@/api/schemas/data-submissions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { TemplateDownloadButton } from '../components/template-download-button'

/** Sidebar summarising the required template, plus the submit action. */
export function RequiredTemplateCard({
  template,
  canSubmit,
  isUploading,
}: {
  template: UploadDefinition['template']
  canSubmit: boolean
  isUploading: boolean
}) {
  return (
    <Card className="h-fit p-4">
      <h2 className="font-semibold text-text-default">Required template</h2>
      <p className="mt-2 text-sm">{template.fileName}</p>
      <p className="text-xs text-text-muted">Version {template.version}</p>

      <TemplateDownloadButton template={template} />

      <Button className="mt-3 w-full" disabled={!canSubmit} type="submit">
        {isUploading ? 'Uploading…' : 'Upload and validate'}
      </Button>
    </Card>
  )
}
