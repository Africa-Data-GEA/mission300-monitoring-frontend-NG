import { ClipboardList, MapPin, Pencil } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { ErrorState } from '@/components/ui/error-state'
import { formatDate } from '@/lib/format'
import { PILLAR_LABELS } from '@/types/domain'
import { BottleneckRegister } from '@/features/bottlenecks/components/bottleneck-register'
import { CreateBottleneckDialog } from '@/features/bottlenecks/components/create-bottleneck-dialog'
import { useBottlenecksFilters } from '@/features/bottlenecks/api'
import { ExecutionStatusBadge } from './components/execution-status-badge'
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

      <div className="overflow-hidden rounded-card border border-border-default bg-surface">
        <div className="flex flex-wrap items-start justify-between gap-4 bg-landing-deep-navy px-5 py-5 sm:px-7">
          <div className="flex items-start gap-3.5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-control bg-white/10 text-landing-gold">
              <ClipboardList aria-hidden="true" className="size-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  {project.name}
                </h1>
                <ExecutionStatusBadge status={project.currentStatus} />
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-white/70">
                <MapPin aria-hidden="true" className="size-3.5 shrink-0" />
                {project.location} · {PILLAR_LABELS[project.pillar]}
              </p>
            </div>
          </div>
          <Button asChild size="sm" variant="secondary">
            <Link to={`/programs/projects/${project.id}/edit`}>
              <Pencil aria-hidden="true" />
              Edit project
            </Link>
          </Button>
        </div>

        <dl className="grid grid-cols-2 gap-4 px-5 py-4 sm:grid-cols-4 sm:px-7">
          <div>
            <dt className="text-2xs font-medium tracking-wide text-text-subtle uppercase">Programme</dt>
            <dd className="mt-0.5 truncate text-sm font-medium text-text-default">{project.programmeName}</dd>
          </div>
          <div>
            <dt className="text-2xs font-medium tracking-wide text-text-subtle uppercase">Owner</dt>
            <dd className="mt-0.5 truncate text-sm font-medium text-text-default">{project.owner}</dd>
          </div>
          <div>
            <dt className="text-2xs font-medium tracking-wide text-text-subtle uppercase">End date</dt>
            <dd className="mt-0.5 text-sm font-medium text-text-default">
              {project.endDate ? formatDate(project.endDate) : 'Not set'}
            </dd>
          </div>
          <div>
            <dt className="text-2xs font-medium tracking-wide text-text-subtle uppercase">ID</dt>
            <dd className="mt-0.5 truncate text-sm font-medium text-text-default">{project.id}</dd>
          </div>
        </dl>
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
