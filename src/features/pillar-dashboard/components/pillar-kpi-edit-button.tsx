import { Pencil } from 'lucide-react'
import { useState } from 'react'
import { readAuthSession } from '@/features/auth/auth-session'
import { canUserReachModule } from '@/features/auth/role-access'
import { useKpiProfile } from '@/features/kpi-explorer/api'
import { KpiMetadataEditDialog } from '@/features/kpi-explorer/components/kpi-profile/kpi-metadata-edit-dialog'

/**
 * Reuses KPI Explorer's own "Edit definition & targets" capability directly
 * on a pillar card, rather than requiring a detour through the KPI's full
 * profile — stakeholder feedback asked for admins to add/edit granular
 * indicator info "where relevant/possible" from the pillar view itself.
 * Same role gate as KpiProfileDialog (see role-access.ts); the profile is
 * only fetched once the dialog is actually opened.
 */
export function PillarKpiEditButton({ kpiId, name }: { kpiId: string; name: string }) {
  const [open, setOpen] = useState(false)
  const session = readAuthSession()
  const canEdit = !!session && canUserReachModule(session.user, 'kpi-metadata')
  const { data: profile } = useKpiProfile(open ? kpiId : null)

  if (!canEdit) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Edit ${name}`}
        title={`Edit ${name}`}
        className="inline-flex size-5 items-center justify-center rounded-full text-text-subtle transition-colors hover:text-text-muted"
      >
        <Pencil aria-hidden="true" className="size-3.5" />
      </button>
      {open && profile && (
        <KpiMetadataEditDialog open={open} profile={profile} onClose={() => setOpen(false)} />
      )}
    </>
  )
}
