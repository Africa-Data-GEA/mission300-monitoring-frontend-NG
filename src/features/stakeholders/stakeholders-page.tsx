import { useState } from 'react'
import { Plus } from 'lucide-react'
import type { Institution } from '@/api/schemas/stakeholders'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { ErrorState } from '@/components/ui/error-state'
import { grantedRoles } from '@/features/auth/role-access'
import { readAuthSession } from '@/features/auth/auth-session'
import { dashboardToast } from '@/lib/dashboard-toast'
import { InstitutionEditorDialog } from './components/institution-editor-dialog'
import { InstitutionsTable } from './components/institutions-table'
import { StakeholderFilters } from './components/stakeholder-filters'
import { StakeholdersSkeleton } from './components/stakeholders-skeleton'
import { StakeholdersSummary } from './components/stakeholders-summary'
import { useStakeholderMutations } from './api'
import { useStakeholdersPage } from './use-stakeholders-page'

/**
 * Stakeholders & Institutions.
 *
 * All state and data-fetching lives in use-stakeholders-page.ts — this
 * component only reads that hook and renders.
 */
export function StakeholdersPage() {
  const page = useStakeholdersPage()
  const mutations = useStakeholderMutations()
  const session = readAuthSession()
  const canManage = Boolean(session && grantedRoles(session.user).includes('system-administrator'))
  const [institutionEditor, setInstitutionEditor] = useState<Institution | 'new' | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Institution | null>(null)

  if (page.isPending) return <StakeholdersSkeleton />

  if (page.isError) {
    return (
      <ErrorState
        title="Stakeholders could not be loaded"
        message={page.error.message}
        onRetry={() => void page.refetch()}
      />
    )
  }

  if (!page.data) return null

  const { data } = page

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <Breadcrumb
            items={[
              { label: 'Administration' },
              { label: 'Stakeholders & Institutions' },
            ]}
          />
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-default">
            Stakeholders &amp; Institutions
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            Institution registry, reporting ownership and Mission 300 accountability.
          </p>
        </div>
        {canManage ? (
          <Button onClick={() => setInstitutionEditor('new')} type="button">
            <Plus aria-hidden="true" /> Add stakeholder institution
          </Button>
        ) : null}
      </div>

      <StakeholdersSummary summary={data.summary} />

      <Card className="min-w-0 overflow-hidden p-0">
        <div className="px-2 pt-3 sm:px-4">
          <StakeholderFilters
            activeFilterCount={page.activeFilterCount}
            options={data.filters}
            query={page.query}
            onChange={page.changeQuery}
            onReset={page.resetQuery}
          />
        </div>
        <div className="min-w-0 p-2 pt-0 sm:p-4 sm:pt-0">
          <InstitutionsTable
            items={data.institutions}
            onEdit={canManage ? setInstitutionEditor : undefined}
            onDelete={canManage ? setDeleteTarget : undefined}
          />
        </div>
      </Card>

      {institutionEditor ? (
        <InstitutionEditorDialog
          institution={institutionEditor === 'new' ? null : institutionEditor}
          onClose={() => setInstitutionEditor(null)}
          onSave={async (input) => {
            const result = institutionEditor === 'new'
              ? await mutations.createInstitution.mutateAsync(input)
              : await mutations.updateInstitution.mutateAsync({ id: institutionEditor.id, input })
            dashboardToast.success(result.message)
          }}
        />
      ) : null}

      <ConfirmDialog
        open={deleteTarget !== null}
        title="Remove stakeholder institution?"
        description="Institutions with linked users, datasets, submissions or assignments cannot be removed."
        confirmLabel="Remove"
        isPending={mutations.deleteInstitution.isPending}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return
          void mutations.deleteInstitution.mutateAsync(deleteTarget.id)
            .then((result) => {
              dashboardToast.success(result.message)
              setDeleteTarget(null)
            })
            .catch((failure: unknown) => {
              dashboardToast.error('Could not remove record', {
                description: failure instanceof Error ? failure.message : 'Please try again.',
              })
            })
        }}
      />
    </div>
  )
}
