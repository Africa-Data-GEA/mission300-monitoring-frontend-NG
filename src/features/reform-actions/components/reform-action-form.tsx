import type { ReformActionDetail, ReformActionsOverview } from '@/api/schemas/reform-actions'
import { REFORM_STATUS_OPTIONS } from '@/api/schemas/reform-actions'
import { Button } from '@/components/ui/button'
import { SelectField } from '@/components/ui/select-field'
import { useReformActionForm } from '../use-reform-action-form'
import { ReformField, REFORM_INPUT_CLASS } from './reform-field'
import { ReformHistory } from './reform-history'

const NO_PROGRAMME = 'none'

export function ReformActionForm({
  action,
  filters,
  defaultPillar,
  onSaved,
  onCancel,
}: {
  action: ReformActionDetail | null
  filters: ReformActionsOverview['filters']
  defaultPillar: string
  onSaved: (message: string) => void
  onCancel: () => void
}) {
  const form = useReformActionForm(action, defaultPillar, onSaved)
  const { draft, change } = form

  return (
    <form className="flex max-w-2xl flex-col gap-4 p-5 sm:p-7" onSubmit={form.submit}>
      <SelectField
        label="Pillar"
        value={draft.pillar}
        options={filters.pillars}
        onChange={(value) => change({ pillar: value })}
      />

      <ReformField label="Commitment / indicator">
        {(id) => (
          <textarea
            id={id}
            className={`${REFORM_INPUT_CLASS} min-h-20 resize-y`}
            value={draft.commitment}
            onChange={(event) => change({ commitment: event.target.value })}
          />
        )}
      </ReformField>

      <ReformField label="Reform action">
        {(id) => (
          <textarea
            id={id}
            className={`${REFORM_INPUT_CLASS} min-h-24 resize-y`}
            value={draft.action}
            onChange={(event) => change({ action: event.target.value })}
          />
        )}
      </ReformField>

      <label className="flex items-center gap-2 text-sm font-medium text-text-default">
        <input
          type="checkbox"
          checked={draft.isPriority}
          onChange={(event) => change({ isPriority: event.target.checked })}
        />
        Priority reform action
      </label>

      <SelectField
        label="Linked programme (optional)"
        value={draft.programmeId || NO_PROGRAMME}
        options={[{ value: NO_PROGRAMME, label: 'No linked programme' }, ...filters.programmes]}
        searchable
        onChange={(value) => change({ programmeId: value === NO_PROGRAMME ? '' : value })}
      />

      <ReformField label="Lead institution">
        {(id) => (
          <input
            id={id}
            className={REFORM_INPUT_CLASS}
            value={draft.leadInstitution}
            onChange={(event) => change({ leadInstitution: event.target.value })}
          />
        )}
      </ReformField>

      <div className="grid gap-4 sm:grid-cols-2">
        <ReformField label="Compact deadline">
          {(id) => (
            <input
              id={id}
              type="date"
              className={REFORM_INPUT_CLASS}
              value={draft.referenceDueDate}
              onChange={(event) => change({ referenceDueDate: event.target.value })}
            />
          )}
        </ReformField>
        <ReformField label="Adjusted deadline">
          {(id) => (
            <input
              id={id}
              type="date"
              className={REFORM_INPUT_CLASS}
              value={draft.dueDate}
              onChange={(event) => change({ dueDate: event.target.value })}
            />
          )}
        </ReformField>
      </div>

      <SelectField
        label="Status"
        value={draft.status}
        options={REFORM_STATUS_OPTIONS}
        onChange={(value) => change({ status: value as typeof draft.status })}
      />

      {form.statusChanged ? (
        <ReformField label="Why is the status changing?">
          {(id) => (
            <input
              id={id}
              className={REFORM_INPUT_CLASS}
              value={draft.statusNote}
              onChange={(event) => change({ statusNote: event.target.value })}
            />
          )}
        </ReformField>
      ) : null}

      <ReformField label="Progress comment">
        {(id) => (
          <textarea
            id={id}
            className={`${REFORM_INPUT_CLASS} min-h-24 resize-y`}
            value={draft.comment}
            onChange={(event) => change({ comment: event.target.value })}
          />
        )}
      </ReformField>

      {form.error ? <p className="text-sm text-status-at-risk">{form.error}</p> : null}

      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={form.isSaving}>
          {form.isSaving ? 'Saving…' : action ? 'Save changes' : 'Record reform action'}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>

      {action ? <ReformHistory history={action.history} /> : null}
    </form>
  )
}
