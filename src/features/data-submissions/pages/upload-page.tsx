import { Card } from '@/components/ui/card'
import { ListState } from '../components/list-state'
import { WorkflowShell } from '../components/workflow-shell'
import { RequiredTemplateCard } from './required-template-card'
import { UploadDropzone } from './upload-dropzone'
import { useUploadPage } from './use-upload-page'

/**
 * Controlled-template upload for a single reporting obligation.
 *
 * All state and submission logic lives in use-upload-page.ts — this
 * component only reads that hook and renders.
 */
export function UploadPage() {
  const page = useUploadPage()
  const { definition } = page

  return (
    <WorkflowShell
      title="Upload submission template"
      description="Upload the controlled template. Structural and business validation is performed by the server."
    >
      <ListState
        pending={definition.isPending}
        error={definition.error}
        retry={() => void definition.refetch()}
      >
        {definition.data && (
          <form
            className="grid gap-4 lg:grid-cols-[1fr_20rem]"
            onSubmit={page.submit}
          >
            <Card className="p-5">
              <UploadDropzone
                definition={definition.data}
                file={page.file}
                onFileChange={page.setFile}
                sourceReference={page.sourceReference}
                onSourceReferenceChange={page.setSourceReference}
                notes={page.notes}
                onNotesChange={page.setNotes}
              />
            </Card>
            <RequiredTemplateCard
              template={definition.data.template}
              canSubmit={page.canSubmit}
              isUploading={page.isUploading}
              uploadError={page.uploadError}
            />
          </form>
        )}
      </ListState>
    </WorkflowShell>
  )
}
