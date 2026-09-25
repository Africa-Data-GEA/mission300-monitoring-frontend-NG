import { useNavigate } from 'react-router'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Card } from '@/components/ui/card'
import { CreateProgrammeSuccess } from '../components/programme-admin/create-programme-success'
import { ProgrammeForm } from '../components/programme-admin/programme-form'
import { useCreateProgramme } from '../lib/use-create-programme'

/**
 * Full-page "add programme" flow — there was previously no way to add a new
 * programme anywhere in the app; Programmes were a read-only, pre-seeded
 * register. Matches AddProjectPage/EditProjectPage's page-not-modal pattern.
 */
export function AddProgrammePage() {
  const navigate = useNavigate()
  const upsert = useCreateProgramme(() => undefined)

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <Breadcrumb
        items={[
          { label: 'Delivery tracking' },
          { label: 'Programs', to: '/programs' },
          { label: 'Add programme' },
        ]}
      />

      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-text-default">Add programme</h1>
        <p className="mt-1 text-sm text-text-muted">
          Add a new programme to the Mission 300 portfolio.
        </p>
      </div>

      <Card className="mx-auto w-full max-w-2xl p-4 sm:p-6">
        {upsert.successMessage && upsert.savedRecord ? (
          <CreateProgrammeSuccess
            message={upsert.successMessage}
            onDone={() => navigate(`/programs/${upsert.savedRecord!.id}`)}
          />
        ) : (
          <ProgrammeForm form={upsert.form} onSubmit={upsert.submit} serverError={upsert.serverError} />
        )}
      </Card>
    </div>
  )
}
