import type { EntryDraft } from '@/api/schemas/data-submissions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DraftStatus } from '../components/draft-status'

/** The sticky sidebar summarising what is being submitted, with the two
 * actions: keep the work as a draft, or send it for review. A refused save is
 * shown as a toast. */
export function SubmissionContextCard({
  institution,
  dataset,
  reportingPeriod,
  isSaving,
  wide,
  draft,
  isSavingDraft,
  isDiscardingDraft,
  onSaveDraft,
  onDiscardDraft,
}: {
  institution: string
  dataset: string
  reportingPeriod: string
  isSaving: boolean
  wide?: boolean
  draft: EntryDraft | null
  isSavingDraft: boolean
  isDiscardingDraft: boolean
  onSaveDraft: () => void
  onDiscardDraft: () => void
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

      <Button
        className="mt-5 w-full"
        disabled={isSaving || isSavingDraft}
        onClick={onSaveDraft}
        type="button"
        variant="secondary"
      >
        {isSavingDraft ? 'Saving draft…' : 'Save draft'}
      </Button>
      <Button className="mt-2 w-full" disabled={isSaving || isSavingDraft} type="submit">
        {isSaving ? 'Submitting…' : 'Submit for review'}
      </Button>
      <p className="mt-2 text-xs text-text-muted">
        A draft is kept for you to finish later. Only Submit for review sends it to a reviewer.
      </p>
      {draft && <DraftStatus draft={draft} onDiscard={onDiscardDraft} isDiscarding={isDiscardingDraft} />}
    </Card>
  )
}
