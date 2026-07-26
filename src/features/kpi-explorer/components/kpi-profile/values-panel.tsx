import type { KpiProfile } from '@/api/schemas/kpi-explorer'
import { Sparkline } from '@/components/ui/sparkline'
import { TrendIndicator } from '@/components/ui/trend-indicator'
import { ProfileField } from '@/components/ui/profile-field'

/** Current value, trend and the baseline/target/variance figures. */
export function ValuesPanel({ profile }: { profile: KpiProfile }) {
  const hasValue = profile.current !== null

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs text-text-muted">Current value</p>
          <p className="mt-0.5 text-3xl font-semibold tracking-tight text-text-default">
            {hasValue ? profile.currentLabel : 'No current value'}
          </p>
        </div>
        {profile.trend && <TrendIndicator trend={profile.trend} />}
      </div>

      {profile.history.length >= 2 && (
        <Sparkline
          points={profile.history.map((point) => point.value)}
          className="mt-3 h-10 w-full text-brand-500"
        />
      )}

      <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <ProfileField label="Baseline" value={profile.baselineLabel} />
        <ProfileField label="Target" value={profile.targetLabel} />
        <ProfileField label="Variance" value={profile.varianceLabel} />
      </dl>
    </section>
  )
}
