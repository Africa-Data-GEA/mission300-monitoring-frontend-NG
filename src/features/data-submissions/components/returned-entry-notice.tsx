import { Card } from '@/components/ui/card'
import type { ReturnedEntry } from '@/api/schemas/data-submissions'

export function ReturnedEntryNotice({ returned }: { returned: ReturnedEntry }) {
  const returnedOn = new Date(returned.returnedAt).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return (
    <Card role="status" className="border-status-at-risk p-4">
      <h2 className="text-sm font-semibold text-text-default">
        Returned for correction — version {returned.version}, {returnedOn}
      </h2>
      <p className="mt-1 text-sm text-text-muted">
        The values below are what you submitted. Correct them and submit again; nothing is sent until you do.
      </p>
      {returned.comment && (
        <blockquote className="mt-3 border-l-2 border-status-at-risk pl-3 text-sm text-text-default">
          {returned.comment}
        </blockquote>
      )}
    </Card>
  )
}
