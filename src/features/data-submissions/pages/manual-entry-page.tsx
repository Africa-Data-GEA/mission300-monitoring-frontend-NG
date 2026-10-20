import { EntryGrid } from '../components/entry-grid'
import { ListState } from '../components/list-state'
import { SourceReferenceCard } from '../components/source-reference-card'
import { WorkflowShell } from '../components/workflow-shell'
import { EntrySections } from './entry-sections'
import { SubmissionContextCard } from './submission-context-card'
import { useManualEntryPage } from './use-manual-entry-page'

/**
 * Manual data entry for a single reporting obligation.
 *
 * All state and submission logic lives in use-manual-entry-page.ts — this
 * component only reads that hook and renders. A dataset reported per DisCo, or
 * one with several open periods, is entered as a grid of rows; every other
 * dataset keeps the single form.
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
            className={page.grid ? 'space-y-4' : 'grid gap-4 xl:grid-cols-[1fr_20rem]'}
            onSubmit={page.submit}
          >
            {page.grid ? (
              <>
                <EntryGrid
                  definition={definition.data}
                  rows={page.rows}
                  periods={page.periods}
                  onRowChange={page.changeRow}
                  onRowRemove={page.removeRow}
                  onAddRow={page.addRow}
                  onAddAllDiscos={page.addAllDiscos}
                />
                <SourceReferenceCard
                  sourceReference={page.sourceReference}
                  onSourceReferenceChange={page.setSourceReference}
                  notes={page.notes}
                  onNotesChange={page.setNotes}
                />
              </>
            ) : (
              <EntrySections
                sections={definition.data.sections}
                values={page.values}
                onFieldChange={page.setFieldValue}
                sourceReference={page.sourceReference}
                onSourceReferenceChange={page.setSourceReference}
                notes={page.notes}
                onNotesChange={page.setNotes}
              />
            )}
            <SubmissionContextCard
              institution={definition.data.institution}
              dataset={definition.data.dataset}
              reportingPeriod={
                page.grid ? `${page.rows.length} row${page.rows.length === 1 ? '' : 's'}` : definition.data.reportingPeriod
              }
              isSaving={page.isSaving}
              wide={page.grid}
            />
          </form>
        )}
      </ListState>
    </WorkflowShell>
  )
}
