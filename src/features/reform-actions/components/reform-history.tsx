import { REFORM_STATUS_LABELS, type ReformActionDetail } from '@/api/schemas/reform-actions'

function when(value: string) {
  return new Date(value).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function ReformHistory({ history }: { history: ReformActionDetail['history'] }) {
  if (history.length === 0) return null

  return (
    <section className="mt-2">
      <h3 className="text-sm font-semibold text-text-default">Status history</h3>
      <ul className="mt-2 flex flex-col gap-2">
        {history.map((change) => (
          <li key={change.id} className="rounded-control border border-border-default p-3 text-sm">
            <p className="font-medium text-text-default">
              {change.fromStatus ? `${REFORM_STATUS_LABELS[change.fromStatus]} → ` : ''}
              {REFORM_STATUS_LABELS[change.toStatus]}
            </p>
            <p className="mt-0.5 text-xs text-text-muted">
              {when(change.changedAt)} by {change.changedBy}
            </p>
            {change.comment ? <p className="mt-1 text-text-muted">{change.comment}</p> : null}
          </li>
        ))}
      </ul>
    </section>
  )
}
