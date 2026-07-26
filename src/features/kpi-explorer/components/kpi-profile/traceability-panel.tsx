import type { KpiProfile } from '@/api/schemas/kpi-explorer'
import { ValidationBadge } from '../validation-badge'
import { ProfileField } from './profile-field'

/** Origin and review status of the selected value. */
export function TraceabilityPanel({ profile }: { profile: KpiProfile }) {
  return (
    <section className="rounded-control bg-surface-sunken p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-text-default">
          Source &amp; validation
        </h3>
        <ValidationBadge status={profile.validationStatus} />
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
        <ProfileField label="Source institution" value={profile.sourceInstitution} />
        <ProfileField label="Source reference" value={profile.sourceReference} />
        <ProfileField label="Reporting period" value={profile.reportingPeriod} />
        <ProfileField label="Version" value={profile.version} />
        <ProfileField
          label="Validation decision"
          value={profile.validationDecision}
          block
        />
      </dl>
    </section>
  )
}
