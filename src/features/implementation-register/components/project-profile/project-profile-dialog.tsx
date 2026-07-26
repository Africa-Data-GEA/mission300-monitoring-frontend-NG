import type { ProjectRecord } from '@/api/schemas/implementation-register'
import { SideDialog } from '@/components/ui/side-dialog'
import { DocumentsPanel } from './documents-panel'
import { OverviewPanel } from './overview-panel'
import { UpdatesPanel } from './updates-panel'

/**
 * Section C — the project profile drill-down.
 *
 * Opened from a row in the Projects table. The profile is embedded in the
 * project record the table already holds, so there is no separate fetch —
 * unlike the KPI Explorer's profile dialog, which loads a heavier payload on
 * demand.
 */
export function ProjectProfileDialog({
  project,
  onClose,
}: {
  project: ProjectRecord | null
  onClose: () => void
}) {
  return (
    <SideDialog
      open={project !== null}
      onClose={onClose}
      title={project ? `${project.id} — ${project.programmeName}` : 'Project profile'}
      description={project ? `${project.owner} · ${project.location}` : undefined}
    >
      {project && (
        <div className="flex flex-col gap-5">
          <OverviewPanel project={project} />
          <DocumentsPanel project={project} />
          <UpdatesPanel project={project} />
        </div>
      )}
    </SideDialog>
  )
}
