import type { ProjectRecord } from '@/api/schemas/implementation-register'
import { formatDate } from '@/lib/format'

/** Chronological progress notes for the project. */
export function UpdatesPanel({ project }: { project: ProjectRecord }) {
  return (
    <section className="rounded-control bg-surface-sunken p-4">
      <h3 className="text-sm font-semibold text-text-default">Updates</h3>

      <ol className="mt-2 space-y-3">
        {project.profile.updates.map((update) => (
          <li key={update.date} className="text-sm">
            <p className="text-xs text-text-muted">{formatDate(update.date)}</p>
            <p className="text-text-default">{update.note}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}
