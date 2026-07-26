import { ListState } from '../components/list-state'
import { WorkflowShell } from '../components/workflow-shell'
import { EntrySections } from './entry-sections'
import { SubmissionContextCard } from './submission-context-card'
import { useManualEntryPage } from './use-manual-entry-page'

/**
 * Manual data entry for a single reporting obligation.
 *
 * All state and submission logic lives in use-manual-entry-page.ts — this
 * component only reads that hook and renders.
 */
export function ManualEntryPage() {
  const page = useManualEntryPage()
  const { definition } = page

  return (
    <WorkflowShell
      title="Manual data entry"
      description="Enter source values only. KPI calculations and publication decisions remain server-owned."
    >
      <ListState
        pending={definition.isPending}
        error={definition.error}
        retry={() => void definition.refetch()}
      >
        {definition.data && (
          <form
            className="grid gap-4 xl:grid-cols-[1fr_20rem]"
            onSubmit={page.submit}
          >
            <EntrySections
              sections={definition.data.sections}
              values={page.values}
              onFieldChange={page.setFieldValue}
              sourceReference={page.sourceReference}
              onSourceReferenceChange={page.setSourceReference}
              notes={page.notes}
              onNotesChange={page.setNotes}
            />
            <SubmissionContextCard
              institution={definition.data.institution}
              dataset={definition.data.dataset}
              reportingPeriod={definition.data.reportingPeriod}
              isSaving={page.isSaving}
              saveError={page.saveError}
            />
          </form>
        )}
      </ListState>
    </WorkflowShell>
  )
}
