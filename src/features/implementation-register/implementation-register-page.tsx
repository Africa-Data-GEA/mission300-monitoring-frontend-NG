import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/ui/error-state'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Upload } from 'lucide-react'
import { ActionTracker } from './components/action-tracker'
import { ExportButton } from './components/export-button'
import { HeadlineCardsSection } from './components/headline-cards-section'
import { ImplementationRegisterSkeleton } from './components/implementation-register-skeleton'
import { ImportRegisterDialog } from './components/import-register-dialog'
import { MilestoneTracker } from './components/milestone-tracker'
import { ProgrammesTable } from './components/programmes-table'
import { ProjectProfileDialog } from './components/project-profile/project-profile-dialog'
import { ProjectsTable } from './components/projects-table'
import { RegisterFilters } from './components/register-filters'
import { useImplementationRegisterPage } from './use-implementation-register-page'

/**
 * Implementation Register.
 * Specification: docs/specs/implementation-register.md
 *
 * Uses its own nine filters rather than the global dashboard filters, so the
 * route opts out of the global filter bar (see src/app/router.tsx). All state
 * and data-fetching lives in use-implementation-register-page.ts — this
 * component only reads that hook and renders.
 */
export function ImplementationRegisterPage() {
  const page = useImplementationRegisterPage()

  if (page.isPending) return <ImplementationRegisterSkeleton />

  if (page.isError) {
    return (
      <ErrorState
        title="Implementation register could not be loaded"
        message={page.error.message}
        onRetry={page.retry}
      />
    )
  }

  if (!page.data) return null

  const { data } = page

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Breadcrumb
            items={[{ label: 'Delivery tracking' }, { label: 'Implementation Register' }]}
          />
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-default">
            Implementation Register
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton activeTab={page.activeTab} data={data} />
          <Button onClick={page.openImport} size="sm" type="button">
            <Upload aria-hidden="true" />
            Import register update
          </Button>
        </div>
      </div>

      {page.filters && (
        <RegisterFilters
          options={page.filters}
          value={page.query}
          activeFilterCount={page.activeFilterCount}
          onChange={page.changeFilters}
          onReset={page.resetFilters}
        />
      )}

      <HeadlineCardsSection cards={data.headlineCards} />

      <Tabs value={page.activeTab} defaultValue="programmes" onValueChange={page.changeTab}>
        <TabsList>
          <TabsTrigger value="programmes">Programmes</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        <TabsContent value="programmes">
          <ProgrammesTable
            records={data.programmes.items}
            page={data.programmes.page}
            pageSize={data.programmes.pageSize}
            total={data.programmes.total}
            onPageChange={page.setProgrammePage}
          />
        </TabsContent>

        <TabsContent value="projects">
          <ProjectsTable
            records={data.projects.items}
            page={data.projects.page}
            pageSize={data.projects.pageSize}
            total={data.projects.total}
            onPageChange={page.setProjectPage}
            onOpenProfile={page.viewProjectProfile}
          />
        </TabsContent>

        <TabsContent value="milestones">
          <MilestoneTracker
            records={data.milestones.items}
            page={data.milestones.page}
            pageSize={data.milestones.pageSize}
            total={data.milestones.total}
            onPageChange={page.setMilestonePage}
          />
        </TabsContent>

        <TabsContent value="actions">
          <ActionTracker
            records={data.actions.items}
            page={data.actions.page}
            pageSize={data.actions.pageSize}
            total={data.actions.total}
            onPageChange={page.setActionPage}
          />
        </TabsContent>
      </Tabs>

      <ProjectProfileDialog project={page.selectedProject} onClose={page.closeProjectProfile} />

      <ImportRegisterDialog
        open={page.importOpen}
        onClose={page.closeImport}
        onImported={page.refreshAfterImport}
      />
    </div>
  )
}
