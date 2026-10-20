import { SideDialog } from '@/components/ui/side-dialog'
import type { FilterOption } from '@/types/filters'
import { useBottlenecksFilters } from '../api'
import { useCreateBottleneck } from '../use-create-bottleneck'
import { CreateBottleneckForm } from './create-bottleneck-form'
import { CreateBottleneckSuccess } from './create-bottleneck-success'

/** Side-dialog entry point for raising a new bottleneck / exception record. */
export function CreateBottleneckDialog({
  onClose,
  onCreated,
  open,
  institutions,
  defaultLinkedRecord,
}: {
  onClose: () => void
  onCreated: () => void
  open: boolean
  institutions: readonly FilterOption[]
  /** Prefills "Linked record" — e.g. a project id, when raised from that project's page. */
  defaultLinkedRecord?: string
}) {
  const creation = useCreateBottleneck(onCreated, defaultLinkedRecord)
  const { data: options } = useBottlenecksFilters()

  return (
    <SideDialog
      description="Add a new delivery constraint or exception to the register."
      onClose={onClose}
      open={open}
      title="Raise a bottleneck"
    >
      {creation.successMessage ? (
        <CreateBottleneckSuccess message={creation.successMessage} onDone={onClose} />
      ) : (
        <CreateBottleneckForm
          form={creation.form}
          onSubmit={creation.submit}
          serverError={creation.serverError}
          institutions={options?.responsibleInstitutions ?? institutions}
          linkKind={creation.linkKind}
          onLinkKindChange={creation.setLinkKind}
          programmes={options?.programmes ?? []}
          projects={options?.projects ?? []}
        />
      )}
    </SideDialog>
  )
}
