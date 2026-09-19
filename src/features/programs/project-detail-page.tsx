import { Pencil } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/ui/error-state'
import { BottleneckRegister } from '@/features/bottlenecks/components/bottleneck-register'
import { CreateBottleneckDialog } from '@/features/bottlenecks/components/create-bottleneck-dialog'
import { useBottlenecksFilters } from '@/features/bottlenecks/api'
import { DocumentsPanel } from './components/project-profile/documents-panel'
import { OverviewPanel } from './components/project-profile/overview-panel'
import { UpdatesPanel } from './components/project-profile/updates-panel'
import { MilestoneSection } from './components/milestone-section'
import { CreateMilestoneDialog } from './components/create-milestone-dialog'
import { ProjectDetailSkeleton } from './components/project-detail-skeleton'
import { useProjectDetailPage } from './use-project-detail-page'

/**
 * A project's detail page: its profile (overview, documents, updates),
 * its milestones, and the bottlenecks linked to it — with a "Raise a
 * bottleneck" flow scoped to this project. This is where the standalone
 * Bottlenecks & Exceptions page's register and create flow now live.
 */
export function ProjectDetailPage() {
  const projectId = useParams().projectId ?? ''
  const page = useProjectDetailPage(projectId)
  const bottleneckFilters = useBottlenecksFilters()

  if (page.isPending) return <ProjectDetailSkeleton />

  if (page.isError) {
    return (
      <ErrorState
        title="Project could not be loaded"
        message={page.error.message}
        onRetry={page.retry}
      />
    )
  }

  if (!page.project || !page.milestones || !page.bottlenecks) return null

  const { project } = page
  const institutionOptions = (bottleneckFilters.data?.institutions ?? []).filter(
    (option) => option.value !== 'all',
  )

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <Breadcrumb
        items={[
          { label: 'Delivery tracking' },
          { label: 'Programs', to: '/programs' },
          { label: project.programmeName, to: `/programs/${project.programmeId}` },
          { label: project.id },
        ]}
      />

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-text-default">
            {project.name}
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {project.id} · {project.programmeName} · {project.owner}
          </p>
        </div>
        <Button asChild size="sm" variant="secondary">
          <Link to={`/programs/projects/${project.id}/edit`}>
            <Pencil aria-hidden="true" />
            Edit project
          </Link>
        </Button>
      </div>

      <OverviewPanel project={project} />
      <DocumentsPanel project={project} />
      <UpdatesPanel project={project} />

      <MilestoneSection
        records={page.milestones.items}
        page={page.milestones.page}
        pageSize={page.milestones.pageSize}
        total={page.milestones.total}
        onPageChange={page.setMilestonePage}
        onAddMilestone={page.openAddMilestone}
      />

      <BottleneckRegister
        records={page.bottlenecks.items}
        page={page.bottlenecks.page}
        pageSize={page.bottlenecks.pageSize}
        total={page.bottlenecks.total}
        onPageChange={page.setBottleneckPage}
        onRaiseBottleneck={page.openCreate}
      />

      <CreateBottleneckDialog
        open={page.createOpen}
        onClose={page.closeCreate}
        onCreated={page.refreshAfterCreate}
        institutions={institutionOptions}
        defaultLinkedRecord={project.id}
      />

      <CreateMilestoneDialog
        open={page.addMilestoneOpen}
        onClose={page.closeAddMilestone}
        onCreated={page.refreshAfterAddMilestone}
        projectId={project.id}
      />
    </div>
  )
}
