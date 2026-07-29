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

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <Breadcrumb
        items={[
          { label: 'Delivery tracking' },
          { label: 'Programs', to: '/programs' },
          { label: page.programme.name },
        ]}
      />

      <ProgrammeHeader programme={page.programme} />

      <ProjectFilters value={page.query} onChange={page.changeQuery} />

      <ProjectsTable
        records={page.projects.items}
        page={page.projects.page}
        pageSize={page.projects.pageSize}
        total={page.projects.total}
        onPageChange={page.setPage}
        onOpenProject={(project) => navigate(`/programs/projects/${project.id}`)}
      />
    </div>
  )
}
