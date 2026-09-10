import type { KpiProfile } from '@/api/schemas/kpi-explorer'

/**
 * How this indicator maps to an outside methodology standard (e.g. SE4ALL's
 * MRL guidance) — added per the SE4ALL MRL alignment review (docs/se4all-
 * mrl-alignment-renewable-private-capital.md). Renders nothing when a KPI
 * has no external standard mapped to it, which is most of the registry
 * today — this is real, decision-backed metadata, not filled in everywhere.
 */
export function ExternalStandardAlignmentPanel({ profile }: { profile: KpiProfile }) {
  const alignment = profile.externalStandardAlignment
  if (!alignment) return null

  return (
    <section className="rounded-control border border-brand-200 bg-brand-50 p-4">
      <h3 className="text-sm font-semibold text-text-default">External standard alignment</h3>
      <p className="mt-1 text-sm text-text-muted">{alignment.standard}</p>

      <dl className="mt-3 space-y-3 text-sm">
        <div>
          <dt className="font-medium text-text-default">Includes</dt>
          <dd>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-text-muted">
              {alignment.inclusions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt className="font-medium text-text-default">Excludes</dt>
          <dd>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-text-muted">
              {alignment.exclusions.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div className="grid grid-cols-1 gap-1">
          <dt className="font-medium text-text-default">Period type</dt>
          <dd className="text-text-muted">{alignment.periodType}</dd>
        </div>
        {alignment.assumptions.length > 0 && (
          <div>
            <dt className="font-medium text-text-default">Assumptions</dt>
            <dd>
              <ul className="mt-1 list-disc space-y-1 pl-4 text-text-muted">
                {alignment.assumptions.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </dd>
          </div>
        )}
      </dl>
    </section>
  )
}
