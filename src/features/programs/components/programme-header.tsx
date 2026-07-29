import type { ProgrammeRecord } from '@/api/schemas/programs'
import { Card } from '@/components/ui/card'
import { ProfileField } from '@/components/ui/profile-field'
import { ValidationBadge } from '@/components/ui/validation-badge'
import { formatDate } from '@/lib/format'
import { PILLAR_LABELS } from '@/types/domain'
import { ExecutionStatusBadge } from './execution-status-badge'
import { PriorityBadge } from './priority-badge'

/** Programme identity, status and key facts. */
export function ProgrammeHeader({ programme }: { programme: ProgrammeRecord }) {
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-text-default">
            {programme.name}
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {programme.id} · {PILLAR_LABELS[programme.pillar]}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PriorityBadge priority={programme.priority} />
          <ExecutionStatusBadge status={programme.status} />
          <ValidationBadge status={programme.validationStatus} />
        </div>
      </div>

      <p className="mt-3 text-sm text-text-muted">{programme.objectives}</p>

      <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ProfileField label="Lead institution" value={programme.leadInstitution} />
        <ProfileField
          label="Supporting institutions"
          value={programme.supportingInstitutions.join(', ') || 'None'}
        />
        <ProfileField label="Financing" value={programme.financing ?? 'Not disclosed'} />
        <ProfileField
          label="Dates"
          value={`${formatDate(programme.startDate)} – ${formatDate(programme.endDate)}`}
        />
      </dl>
    </Card>
  )
}
