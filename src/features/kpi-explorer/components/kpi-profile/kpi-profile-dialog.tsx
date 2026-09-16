import { useState } from 'react'
import type { KpiProfile } from '@/api/schemas/kpi-explorer'
import { Button } from '@/components/ui/button'
import { PILLAR_LABELS } from '@/types/domain'
import { SideDialog } from '@/components/ui/side-dialog'
import { readAuthSession } from '@/features/auth/auth-session'
import { canUserReachModule } from '@/features/auth/role-access'
import { ExternalStandardAlignmentPanel } from './external-standard-alignment-panel'
import { KpiMetadataEditDialog } from './kpi-metadata-edit-dialog'
import { LinkedRecordsPanel } from './linked-records-panel'
import { MetadataPanel } from './metadata-panel'
import { ProfileSkeleton } from './profile-skeleton'
import { RetireKpiButton } from './retire-kpi-button'
import { SetKpiCurrentValueDialog } from './set-kpi-current-value-dialog'
import { TraceabilityPanel } from './traceability-panel'
import { ValuesPanel } from './values-panel'

/**
 * Section C — the KPI profile drill-down.
 *
 * Opened from a catalogue row. Composes the four panels the specification
 * calls for — values, metadata, traceability, linked records — in a side
 * dialog so the catalogue stays in place behind it. Each panel lives in its
 * own file in this folder.
 */
export function KpiProfileDialog({
  open,
  profile,
  isPending,
  onClose,
}: {
  open: boolean
  profile: KpiProfile | undefined
  isPending: boolean
  onClose: () => void
}) {
  const [editOpen, setEditOpen] = useState(false)
  const [setValueOpen, setSetValueOpen] = useState(false)
  const session = readAuthSession()
  const canEditMetadata = !!session && canUserReachModule(session.user, 'kpi-metadata')

  return (
    <SideDialog
      open={open}
      onClose={onClose}
      title={profile?.name ?? 'Indicator profile'}
      description={
        profile ? `${profile.id} · ${PILLAR_LABELS[profile.pillar]}` : undefined
      }
    >
      {isPending || !profile ? (
        <ProfileSkeleton />
      ) : (
        <div className="flex flex-col gap-5">
          {canEditMetadata && (
            <div className="flex flex-wrap justify-end gap-2">
              {/* Retiring an indicator sits beside editing it, because it is
                  the same registry-management concern — review asked for the
                  ability to deactivate a KPI, not only change its definition
                  (docs/M300 Monitoring Platform Feedback.pptx, slide 15).
                  Retiring never deletes: published values stay traceable. */}
              <RetireKpiButton kpiId={profile.id} name={profile.name} />
              {/* Direct admin override of the current value — bypasses Data
                  Submissions & Validation. See SetKpiCurrentValueDialog. */}
              <Button type="button" variant="secondary" size="sm" onClick={() => setSetValueOpen(true)}>
                Set current value
              </Button>
              <Button type="button" variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
                Edit definition &amp; targets
              </Button>
            </div>
          )}
          <ValuesPanel profile={profile} />
          <MetadataPanel profile={profile} />
          <ExternalStandardAlignmentPanel profile={profile} />
          <TraceabilityPanel profile={profile} />
          <LinkedRecordsPanel profile={profile} />
          {canEditMetadata && (
            <>
              <KpiMetadataEditDialog open={editOpen} profile={profile} onClose={() => setEditOpen(false)} />
              <SetKpiCurrentValueDialog open={setValueOpen} profile={profile} onClose={() => setSetValueOpen(false)} />
            </>
          )}
        </div>
      )}
    </SideDialog>
  )
}
