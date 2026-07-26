import type { KpiProfile } from '@/api/schemas/kpi-explorer'
import { ProfileField } from './profile-field'

/** Official indicator metadata, shown exactly as configured. */
export function MetadataPanel({ profile }: { profile: KpiProfile }) {
  return (
    <section className="rounded-control bg-surface-sunken p-4">
      <h3 className="text-sm font-semibold text-text-default">
        Definition &amp; methodology
      </h3>
      <dl className="mt-3 space-y-3 text-sm">
        <ProfileField label="Definition" value={profile.definition} block />
        <ProfileField label="Formula" value={profile.formula} mono block />
        <div className="grid grid-cols-2 gap-3">
          <ProfileField label="Unit" value={profile.unit} />
          <ProfileField label="Frequency" value={profile.frequency} />
          <ProfileField label="Aggregation" value={profile.aggregation} />
          <ProfileField label="Disaggregation" value={profile.disaggregation} />
        </div>
        <ProfileField label="Limitations" value={profile.limitations} block />
      </dl>
    </section>
  )
}
