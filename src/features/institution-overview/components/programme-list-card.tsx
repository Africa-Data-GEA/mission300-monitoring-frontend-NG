import { Link } from 'react-router'
import type { InstitutionProgramme } from '@/api/schemas/institution-overview'
import { Card } from '@/components/ui/card'
import { ExecutionStatusBadge } from '@/features/programs/components/execution-status-badge'
import { PILLAR_LABELS } from '@/types/domain'

export function ProgrammeListCard({ programmes }: { programmes: readonly InstitutionProgramme[] }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-text-default">
          Programmes you lead
          {programmes.length > 0 && (
            <span className="ml-2 rounded-pill bg-surface-sunken px-2 py-0.5 text-xs font-medium text-text-muted">
              {programmes.length}
            </span>
          )}
        </h2>
        <Link to="/programs" className="text-xs font-medium text-link underline underline-offset-4">
          View all programs →
        </Link>
      </div>

      {programmes.length === 0 ? (
        <p className="mt-3 text-sm text-text-muted">No programmes are currently led by your institution.</p>
      ) : (
        <div className="mt-3 space-y-2">
          {programmes.map((programme) => (
            <Link
              key={programme.id}
              to={`/programs/${programme.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border-default bg-surface p-3 transition-colors hover:bg-surface-sunken"
            >
              <div>
                <p className="text-sm font-medium text-text-default">{programme.name}</p>
                <p className="mt-0.5 text-xs text-text-muted">
                  {programme.projectCount} project{programme.projectCount === 1 ? '' : 's'} · {PILLAR_LABELS[programme.pillar]}
                </p>
              </div>
              <ExecutionStatusBadge status={programme.status} />
            </Link>
          ))}
        </div>
      )}
    </Card>
  )
}
