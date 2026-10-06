import type { KpiProfile } from '@/api/schemas/kpi-explorer'

const RELATION_TEXT = {
  canonical: 'Same measurement as matrix indicator',
  alias: 'Also recorded as',
} as const

/**
 * Indicators that record the same measurement as this one: a matrix
 * indicator and the indicator we added to hold its data. Each is a button
 * that opens the other's profile, so the two can be followed back and forth.
 */
export function RelatedIndicatorsPanel({
  profile,
  onOpenKpi,
}: {
  profile: KpiProfile
  onOpenKpi: (kpiId: string) => void
}) {
  const related = profile.relatedIndicators ?? []
  if (related.length === 0) return null

  return (
    <section className="rounded-control bg-surface-sunken p-4">
      <h3 className="text-sm font-semibold text-text-default">Linked indicators</h3>
      <ul className="mt-3 flex flex-col gap-2 text-sm">
        {related.map((indicator) => (
          <li key={indicator.id} className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-text-muted">{RELATION_TEXT[indicator.relation]}</span>
            <button
              type="button"
              className="font-medium text-brand-600 underline-offset-2 hover:underline"
              onClick={() => onOpenKpi(indicator.id)}
            >
              {indicator.id} {indicator.name}
            </button>
          </li>
        ))}
      </ul>
    </section>
  )
}
