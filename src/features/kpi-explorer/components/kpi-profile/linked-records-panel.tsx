import type { KpiProfile } from '@/api/schemas/kpi-explorer'

/** Delivery records linked to the indicator via its identifier. */
export function LinkedRecordsPanel({ profile }: { profile: KpiProfile }) {
  return (
    <section>
      <h3 className="text-sm font-semibold text-text-default">
        Linked implementation records
      </h3>

      {profile.linkedRecords.length === 0 ? (
        <p className="mt-2 text-sm text-text-muted">
          No implementation records are linked to this indicator.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {profile.linkedRecords.map((record) => (
            <li
              key={record.id}
              className="rounded-control border border-border-default p-3"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm font-medium text-text-default">
                  {record.title}
                </span>
                <span className="text-xs text-text-muted">{record.status}</span>
              </div>
              <p className="mt-0.5 text-xs text-text-muted">
                <span className="capitalize">{record.type}</span> ·{' '}
                {record.institution} ·{' '}
                <span className="font-mono">{record.id}</span>
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
