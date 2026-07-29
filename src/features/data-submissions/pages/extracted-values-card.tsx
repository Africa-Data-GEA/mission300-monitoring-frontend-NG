import { Link } from 'react-router'
import type { SubmissionDetail } from '@/api/schemas/data-submissions'
import { Card } from '@/components/ui/card'

/**
 * Shows what this submission would publish to the KPI Explorer, before the
 * reviewer decides. Approving or provisionally accepting the submission
 * writes these values to the linked indicators; returning or rejecting it
 * never does.
 */
export function ExtractedValuesCard({ submission }: { submission: SubmissionDetail }) {
  return (
    <Card className="p-4">
      <h2 className="font-semibold text-text-default">Will publish to</h2>

      {submission.extractedValues.length === 0 ? (
        <p className="mt-2 text-sm text-text-muted">
          No values have been extracted from this version yet — resolving any
          validation issues below is what would populate this list.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {submission.extractedValues.map((extraction) => (
            <li
              key={extraction.kpiId}
              className="flex items-center justify-between gap-3 rounded-control bg-surface-sunken px-3 py-2 text-sm"
            >
              <div className="min-w-0">
                <Link
                  className="font-medium text-brand-700 underline underline-offset-2"
                  to={`/kpis?kpi=${extraction.kpiId}`}
                >
                  {extraction.kpiName}
                </Link>
                <p className="text-xs text-text-muted">{extraction.reportingPeriod}</p>
              </div>
              <span className="font-mono text-text-default">{extraction.value}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
