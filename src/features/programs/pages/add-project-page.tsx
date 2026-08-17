import { useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import type { UpsertProjectRequest } from '@/api/schemas/programs'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Card } from '@/components/ui/card'
import { ProjectForm } from '../components/project-admin/project-form'
import { UpsertProjectSuccess } from '../components/project-admin/upsert-project-success'
import { usePrograms, useProgramme } from '../api'
import { useUpsertProject } from '../lib/use-upsert-project'

const BASE_DEFAULTS: UpsertProjectRequest = {
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

/**
 * Full-page "add priority project" flow, replacing the earlier side-dialog
 * — stakeholder feedback (relayed as a follow-up ask, not the original
 * review) preferred adding/editing a project as its own page rather than a
 * modal. Reachable either from a specific programme's page (?programmeId=…
 * pre-fills and locks the programme picker) or from Overview, where no
 * programme is yet chosen.
 */
export function AddProjectPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const presetProgrammeId = searchParams.get('programmeId') ?? ''

  const { data: programsData } = usePrograms({}, { page: 1, pageSize: 50 })
  const programmes = useMemo(
    () =>
      (programsData?.programmes.items ?? []).map((programme) => ({
        value: programme.id,
        label: programme.name,
      })),
    [programsData],
  )

  // Only fetched to prefill `pillar` when arriving from a specific
  // programme's page — the picker itself already offers the right options
  // without this.
  const presetProgramme = useProgramme(presetProgrammeId)

  const defaultValues: UpsertProjectRequest = {
    ...BASE_DEFAULTS,
    programmeId: presetProgrammeId,
    pillar: presetProgramme.data?.pillar ?? BASE_DEFAULTS.pillar,
  }

  const upsert = useUpsertProject(() => undefined, null, defaultValues)

  // Waits for the preset programme's pillar before mounting the form, so
  // react-hook-form's defaultValues aren't captured before that fetch
  // resolves — the form only reads defaultValues once, on first render.
  if (presetProgrammeId && presetProgramme.isPending) return null

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <Breadcrumb
        items={[
          { label: 'Delivery tracking' },
          { label: 'Programs', to: '/programs' },
          ...(presetProgramme.data
            ? [{ label: presetProgramme.data.name, to: `/programs/${presetProgramme.data.id}` }]
            : []),
          { label: 'Add project' },
        ]}
      />

      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-text-default">Add priority project</h1>
        <p className="mt-1 text-sm text-text-muted">
          Add a new priority project to the delivery-status register.
        </p>
      </div>

      <Card className="max-w-2xl p-4 sm:p-6">
        {upsert.successMessage && upsert.savedRecord ? (
          <UpsertProjectSuccess
            message={upsert.successMessage}
            onDone={() => navigate(`/programs/projects/${upsert.savedRecord!.id}`)}
          />
        ) : (
          <ProjectForm
            form={upsert.form}
            onSubmit={upsert.submit}
            serverError={upsert.serverError}
            programmes={programmes}
            isEditing={false}
          />
        )}
      </Card>
    </div>
  )
}
