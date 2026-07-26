import { Building2, Database, UserRoundPlus } from 'lucide-react'
import { Card } from '@/components/ui/card'

const SUMMARY_ITEMS = [
  ['activeInstitutions', 'Active institutions', Building2],
  ['dataCustodians', 'Institutions with datasets', Database],
  ['pendingOnboarding', 'Pending onboarding', UserRoundPlus],
] as const

/** The three headline summary cards above the institution/custodian tabs. */
export function StakeholdersSummary({
  summary,
}: {
  summary: {
    activeInstitutions: number
    dataCustodians: number
    pendingOnboarding: number
  }
}) {
  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-3">
      {SUMMARY_ITEMS.map(([key, label, Icon]) => (
        <Card key={key} className="flex items-center gap-3 p-3 sm:p-4">
          <span className="flex size-9 items-center justify-center rounded-control bg-brand-50 text-brand-700">
            <Icon aria-hidden="true" className="size-4" />
          </span>
          <div>
            <p className="text-2xl font-semibold text-text-default">
              {summary[key]}
            </p>
            <p className="text-xs text-text-muted">{label}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}
