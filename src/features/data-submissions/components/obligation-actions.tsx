import { FileSpreadsheet, Keyboard } from 'lucide-react'
import { Link } from 'react-router'
import type { Obligation } from '@/api/schemas/data-submissions'
import { Button } from '@/components/ui/button'
import { readAuthSession } from '@/features/auth/auth-session'
import { grantedRoles } from '@/features/auth/role-access'
import { TemplateDownloadButton } from './template-download-button'

/** Row actions for an obligation — the paths into guided entry, upload, or
 * downloading the blank template, gated by what the obligation allows.
 * Entry/upload are the institutional-data-provider's own submission actions
 * (see obligations/:id/entry and /upload routes in routes.tsx, both gated to
 * PROVIDER there) — hidden here too so a reviewer/validator who can also
 * reach this shared obligations table never sees a button that only leads
 * to an access-denied screen. */
export function ObligationActions({ obligation }: { obligation: Obligation }) {
  const session = readAuthSession()
  const canSubmit = !!session && grantedRoles(session.user).includes('institutional-data-provider')

  return (
    <div className="flex justify-end gap-1">
      {obligation.availableActions.includes('download-template') && (
        <TemplateDownloadButton compact template={obligation.template} />
      )}
      {canSubmit && obligation.availableActions.includes('enter-data') && (
        <Button asChild size="sm" variant="secondary">
          <Link to={`/data-submissions/obligations/${obligation.id}/entry`}>
            <Keyboard />
            Enter data
          </Link>
        </Button>
      )}
      {canSubmit && obligation.availableActions.includes('upload-template') && (
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
