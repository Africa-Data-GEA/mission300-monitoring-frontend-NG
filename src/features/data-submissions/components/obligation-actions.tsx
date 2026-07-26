import { Download, FileSpreadsheet, Keyboard } from 'lucide-react'
import { Link } from 'react-router'
import type { Obligation } from '@/api/schemas/data-submissions'
import { Button } from '@/components/ui/button'

/** Row actions for an obligation — the paths into guided entry, upload, or
 * downloading the blank template, gated by what the obligation allows. */
export function ObligationActions({ obligation }: { obligation: Obligation }) {
  return (
    <div className="flex justify-end gap-1">
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
      {obligation.availableActions.includes('download-template') && (
        <Button asChild size="icon" variant="ghost">
          <a
            aria-label={`Download ${obligation.dataset} template`}
            href={obligation.template.downloadUrl}
            download
          >
            <Download />
          </a>
        </Button>
      )}
    </div>
  )
}
