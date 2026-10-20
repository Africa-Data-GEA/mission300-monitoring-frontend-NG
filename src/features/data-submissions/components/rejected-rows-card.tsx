import { Card } from '@/components/ui/card'
import type { RowProblem } from '../lib/row-problems'

/** The values a refused upload could not accept, so the provider can find and
 * correct each one in the spreadsheet. Shown beside the template card. */
export function RejectedRowsCard({ problems }: { problems: readonly RowProblem[] }) {
  if (problems.length === 0) return null

  return (
    <Card className="p-4" role="alert">
      <h2 className="font-semibold text-text-default">Not accepted</h2>
      <p className="mt-1 text-xs text-text-muted">
        {problems.length === 1 ? '1 value' : `${problems.length} values`} in the file could not be accepted.
        Nothing was submitted. Correct {problems.length === 1 ? 'it' : 'them'} and upload again.
      </p>
      <ul className="mt-3 flex max-h-96 flex-col gap-2 overflow-y-auto">
        {problems.map((problem, index) => (
          <li
            key={`${problem.row}-${problem.field ?? 'row'}-${index}`}
            className="rounded-control border border-border-default bg-surface-sunken p-2.5 text-sm"
          >
            <p className="text-xs font-semibold text-text-default">
              Row {problem.row}
              {problem.period ? ` · ${problem.period}` : ''}
            </p>
            {problem.field && <p className="mt-0.5 text-text-default">{problem.field}</p>}
            <p className="mt-0.5 text-xs text-text-muted">
              You entered:{' '}
              <span className="font-mono text-text-default">
                {problem.value === null || problem.value === '' ? '(blank)' : problem.value}
              </span>
            </p>
            <p className="mt-0.5 text-xs text-status-at-risk">{problem.problem}</p>
          </li>
        ))}
      </ul>
    </Card>
  )
}
