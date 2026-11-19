import { Card } from '@/components/ui/card'
import type { WorkbookUploadResult } from '@/api/schemas/data-submissions'

export function WorkbookResultsCard({ result }: { result: WorkbookUploadResult }) {
  return (
    <Card className="p-4" role="status">
      <h2 className="font-semibold text-text-default">Upload result</h2>
      <p className="mt-1 text-sm text-text-muted">{result.message}</p>

      {result.rejected.length > 0 && (
        <section className="mt-4">
          <h3 className="text-sm font-semibold text-status-at-risk">Refused: fix these sheets and upload again</h3>
          <ul className="mt-2 flex flex-col gap-2">
            {result.rejected.map((sheet) => (
              <li key={sheet.sheet} className="rounded-control border border-border-default bg-surface-sunken p-2.5 text-sm">
                <p className="font-semibold text-text-default">Sheet: {sheet.sheet}</p>
                <p className="mt-0.5 whitespace-pre-line text-xs text-status-at-risk">{sheet.message}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {result.accepted.length > 0 && (
        <section className="mt-4">
          <h3 className="text-sm font-semibold text-text-default">Submitted for review</h3>
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {result.accepted.map((sheet) => (
              <li key={sheet.sheet}>
                {sheet.sheet}: {sheet.submissions} submission{sheet.submissions === 1 ? '' : 's'}
              </li>
            ))}
          </ul>
        </section>
      )}

      {result.skipped.length > 0 && (
        <section className="mt-4">
          <h3 className="text-sm font-semibold text-text-default">Skipped: already waiting for review</h3>
          <ul className="mt-2 flex flex-col gap-1 text-sm text-text-muted">
            {result.skipped.map((sheet) => (
              <li key={sheet.sheet}>{sheet.sheet}</li>
            ))}
          </ul>
        </section>
      )}

      {result.unmatchedSheets.length > 0 && (
        <p className="mt-4 text-xs text-text-muted">Ignored sheets: {result.unmatchedSheets.join(', ')}</p>
      )}
    </Card>
  )
}
