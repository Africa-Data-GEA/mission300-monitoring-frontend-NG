import { useMemo } from 'react'
import type { UpsertProjectRequest } from '@/api/schemas/programs'
import { SideDialog } from '@/components/ui/side-dialog'
import { usePrograms } from '@/features/programs/api'
import { useUpsertProject } from '../../lib/use-upsert-project'
import { ProjectForm } from './project-form'
import { UpsertProjectSuccess } from './upsert-project-success'

const EMPTY_DEFAULTS: UpsertProjectRequest = {
  name: '',
  programmeId: '',
  owner: '',
  leadName: '',
  location: '',
  pillar: 'generation-network',
  currentStatus: 'on-track',
  endDate: '',
  comment: '',
  pipelineReadiness: null,
}

/** Side-dialog entry point for adding a new priority project, or editing an
 * existing one when `editingProject` is set. */
export function UpsertProjectDialog({
  onClose,
  onSaved,
  open,
  editingProject,
}: {
  onClose: () => void
  onSaved: () => void
  open: boolean
  /** Present in edit mode; null when adding a new project. */
  editingProject: { id: string; values: UpsertProjectRequest } | null
}) {
  const { data: programsData } = usePrograms({}, { page: 1, pageSize: 50 })
  const programmes = useMemo(
    () =>
      (programsData?.programmes.items ?? []).map((programme) => ({
        value: programme.id,
        label: programme.name,
      })),
    [programsData],
  )

  const upsert = useUpsertProject(onSaved, editingProject?.id ?? null, editingProject?.values ?? EMPTY_DEFAULTS)

  return (
    <SideDialog
      description={
        editingProject
          ? "Update this priority project's delivery details."
          : 'Add a new priority project to the delivery-status register.'
      }
      onClose={onClose}
      open={open}
      title={editingProject ? 'Edit priority project' : 'Add priority project'}
    >
      {upsert.successMessage ? (
        <UpsertProjectSuccess message={upsert.successMessage} onDone={onClose} />
      ) : (
        <ProjectForm
          form={upsert.form}
          onSubmit={upsert.submit}
          serverError={upsert.serverError}
          programmes={programmes}
          isEditing={editingProject !== null}
        />
      )}
    </SideDialog>
  )
}
