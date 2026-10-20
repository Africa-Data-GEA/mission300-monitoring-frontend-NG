import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

/** The sticky sidebar summarising what is being submitted, plus the save
 * action. A refused save is shown as a toast. */
export function SubmissionContextCard({
  institution,
  dataset,
  reportingPeriod,
  isSaving,
  wide,
}: {
  institution: string
  dataset: string
  reportingPeriod: string
  isSaving: boolean
  wide?: boolean
}) {
  return (
    <Card className={wide ? 'h-fit p-4' : 'h-fit p-4 xl:sticky xl:top-4'}>
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
          <dt className="text-text-muted">{wide ? 'Rows' : 'Period'}</dt>
          <dd>{reportingPeriod}</dd>
        </div>
      </dl>

      <Button className="mt-5 w-full" disabled={isSaving} type="submit">
        {isSaving ? 'Submitting…' : 'Submit for review'}
      </Button>
    </Card>
  )
}
