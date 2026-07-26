import type { KpiProfile } from '@/api/schemas/kpi-explorer'
import { PILLAR_LABELS } from '@/types/domain'
import { SideDialog } from '@/components/ui/side-dialog'
import { LinkedRecordsPanel } from './linked-records-panel'
import { MetadataPanel } from './metadata-panel'
import { ProfileSkeleton } from './profile-skeleton'
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
          <ValuesPanel profile={profile} />
          <MetadataPanel profile={profile} />
          <TraceabilityPanel profile={profile} />
          <LinkedRecordsPanel profile={profile} />
        </div>
      )}
    </SideDialog>
  )
}
