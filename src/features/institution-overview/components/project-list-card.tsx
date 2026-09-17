import { Link } from 'react-router'
import type { InstitutionProject } from '@/api/schemas/institution-overview'
import { Card } from '@/components/ui/card'

export function ProjectListCard({ projects }: { projects: readonly InstitutionProject[] }) {
  return (
    <Card variant="well" className="p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-text-default">
          Projects you own
          {projects.length > 0 && (
            <span className="ml-2 rounded-pill bg-surface-sunken px-2 py-0.5 text-xs font-medium text-text-muted">
              {projects.length}
            </span>
          )}
        </h2>
        <Link to="/programs" className="text-xs font-medium text-link underline underline-offset-4">
          View all projects →
        </Link>
      </div>

      {projects.length === 0 ? (
        <p className="mt-3 text-sm text-text-muted">No projects are currently owned by your institution.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {projects.slice(0, 8).map((project) => (
            <Link
              key={project.id}
              to={`/programs/projects/${project.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border-default bg-surface p-3 transition-colors hover:bg-surface-sunken"
            >
              <div>
                <p className="text-sm font-medium text-text-default">{project.name}</p>
                <p className="mt-0.5 text-xs text-text-muted">
                  {project.programme} · {project.pillar}
                </p>
              </div>
              <span className="text-xs font-medium text-text-muted">{project.currentStatus.replace(/_/g, ' ')}</span>
            </Link>
          ))}
        </div>
      )}
    </Card>
  )
}
