import { FileSpreadsheet, Keyboard } from 'lucide-react'
import { Link } from 'react-router'
import type { Obligation } from '@/api/schemas/data-submissions'
import { Button } from '@/components/ui/button'
import { TemplateDownloadButton } from './template-download-button'

/** Row actions for an obligation — the paths into guided entry, upload, or
 * downloading the blank template, gated by what the obligation allows. */
export function ObligationActions({ obligation }: { obligation: Obligation }) {
  return (
    <div className="flex justify-end gap-1">
      {obligation.availableActions.includes('download-template') && (
        <TemplateDownloadButton compact template={obligation.template} />
      )}
      {obligation.availableActions.includes('enter-data') && (
        <Button asChild size="sm" variant="secondary">
          <Link to={`/data-submissions/obligations/${obligation.id}/entry`}>
            <Keyboard />
            Enter data
          </Link>
        </Button>
      )}
      {obligation.availableActions.includes('upload-template') && (
        <Button asChild size="sm">
          <Link to={`/data-submissions/obligations/${obligation.id}/upload`}>
            <FileSpreadsheet />
            Upload
          </Link>
        </Button>
      )}
    </div>
  )
}
