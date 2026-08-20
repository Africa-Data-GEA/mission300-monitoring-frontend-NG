import { useNavigate, useParams } from 'react-router'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { ErrorState } from '@/components/ui/error-state'
import { ProgrammeDetailSkeleton } from './components/programme-detail-skeleton'
import { ProgrammeHeader } from './components/programme-header'
import { ProjectFilters } from './components/project-filters'
import { ProjectsTable } from './components/projects-table'
import { useProgrammeDetailPage } from './use-programme-detail-page'

/**
 * A programme's detail page: its key facts, and the projects delivering it.
 * Click a project to drill into its bottlenecks and milestones.
 *
 * "Add project" navigates to its own page (/programs/projects/new), with
 * this programme pre-filled — stakeholder feedback asked to be able to add
 * a project still in the pipeline (with a readiness detail) from Programs
 * itself, not only from Overview, and a follow-up ask preferred a full page
 * over a modal for both adding and editing a project.
 */
export function ProgrammeDetailPage() {
  const programmeId = useParams().programmeId ?? ''
  const navigate = useNavigate()
  const page = useProgrammeDetailPage(programmeId)

  if (page.isPending) return <ProgrammeDetailSkeleton />

  if (page.isError) {
    return (
      <ErrorState
        title="Programme could not be loaded"
        message={page.error.message}
        onRetry={page.retry}
      />
    )
  }

  if (!page.programme || !page.projects) return null
  const programme = page.programme

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <Breadcrumb
        items={[
          { label: 'Delivery tracking' },
          { label: 'Programs', to: '/programs' },
          { label: programme.name },
        ]}
      />

      <ProgrammeHeader programme={programme} />

      <ProjectFilters value={page.query} onChange={page.changeQuery} />

      <ProjectsTable
        records={page.projects.items}
        page={page.projects.page}
        pageSize={page.projects.pageSize}
        total={page.projects.total}
        onPageChange={page.setPage}
        onOpenProject={(project) => navigate(`/programs/projects/${project.id}`)}
        onAddProject={() => navigate(`/programs/projects/new?programmeId=${programme.id}`)}
      />
    </div>
  )
}
