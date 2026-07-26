import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

/** The sticky sidebar summarising what is being submitted, plus the save
 * action and any save error. */
export function SubmissionContextCard({
  institution,
  dataset,
  reportingPeriod,
  isSaving,
  saveError,
}: {
  institution: string
  dataset: string
  reportingPeriod: string
  isSaving: boolean
  saveError: Error | null
}) {
  return (
    <Card className="h-fit p-4 xl:sticky xl:top-4">
      <h2 className="font-semibold text-text-default">Submission context</h2>
      <dl className="mt-3 space-y-3 text-sm">
        <div>
          <dt className="text-text-muted">Institution</dt>
          <dd>{institution}</dd>
        </div>
        <div>
          <dt className="text-text-muted">Dataset</dt>
          <dd>{dataset}</dd>
        </div>
        <div>
          <dt className="text-text-muted">Period</dt>
          <dd>{reportingPeriod}</dd>
        </div>
      </dl>

      {saveError && (
        <p className="mt-4 text-sm text-status-at-risk" role="alert">
          {saveError.message}
        </p>
      )}

      <Button className="mt-5 w-full" disabled={isSaving} type="submit">
        {isSaving ? 'Saving…' : 'Save draft'}
      </Button>
    </Card>
  )
}
