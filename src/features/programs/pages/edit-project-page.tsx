import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router'
import type { ProjectRecord, UpsertProjectRequest } from '@/api/schemas/programs'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Card } from '@/components/ui/card'
import { ErrorState } from '@/components/ui/error-state'
import { ProjectForm } from '../components/project-admin/project-form'
import { UpsertProjectSuccess } from '../components/project-admin/upsert-project-success'
import { usePrograms, useProject } from '../api'
import { useUpsertProject } from '../lib/use-upsert-project'

function toUpsertValues(project: ProjectRecord): UpsertProjectRequest {
  return {
    name: project.name,
    programmeId: project.programmeId,
    owner: project.owner,
    leadName: project.leadName,
    location: project.location,
    pillar: project.pillar,
    currentStatus: project.currentStatus,
    // The register can hold a project with no projected completion date, but
    // the edit form requires one — an empty value here asks the editor to
    // supply it rather than silently re-saving a placeholder.
    endDate: project.endDate ?? '',
    comment: project.comment,
    pipelineReadiness: project.pipelineReadiness,
  }
}

/**
 * Full-page "edit priority project" flow — see AddProjectPage's comment for
 * why this became a page rather than a side-dialog.
 */
export function EditProjectPage() {
  const projectId = useParams().projectId ?? ''
  const navigate = useNavigate()
  const project = useProject(projectId)

  const { data: programsData } = usePrograms({}, { page: 1, pageSize: 50 })
  const programmes = useMemo(
    () =>
      (programsData?.programmes.items ?? []).map((programme) => ({
        value: programme.id,
        label: programme.name,
      })),
    [programsData],
  )

  if (project.isPending) return null

  if (project.isError || !project.data) {
    return (
      <ErrorState
        title="Project could not be loaded"
        message={project.error?.message ?? 'The project was not found.'}
        onRetry={() => void project.refetch()}
      />
    )
  }

  return (
    <EditProjectForm
      project={project.data}
      programmes={programmes}
      onDone={() => navigate(`/programs/projects/${projectId}`)}
    />
  )
}

/**
 * Split out so `useUpsertProject`'s `defaultValues` — read only once, on
 * first render — are captured from the already-loaded project record, not
 * from a still-pending query.
 */
function EditProjectForm({
  project,
  programmes,
  onDone,
}: {
  project: ProjectRecord
  programmes: { value: string; label: string }[]
  onDone: () => void
}) {
  const upsert = useUpsertProject(() => undefined, project.id, toUpsertValues(project))

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <Breadcrumb
        items={[
          { label: 'Delivery tracking' },
          { label: 'Programs', to: '/programs' },
          { label: project.programmeName, to: `/programs/${project.programmeId}` },
          { label: project.name, to: `/programs/projects/${project.id}` },
          { label: 'Edit' },
        ]}
      />

      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-text-default">Edit priority project</h1>
        <p className="mt-1 text-sm text-text-muted">
          Update {project.name}&apos;s delivery details.
        </p>
      </div>

      <Card className="mx-auto w-full max-w-2xl p-4 sm:p-6">
        {upsert.successMessage ? (
          <UpsertProjectSuccess message={upsert.successMessage} onDone={onDone} />
        ) : (
          <ProjectForm
            form={upsert.form}
            onSubmit={upsert.submit}
            serverError={upsert.serverError}
            programmes={programmes}
            isEditing
          />
        )}
      </Card>
    </div>
  )
}
