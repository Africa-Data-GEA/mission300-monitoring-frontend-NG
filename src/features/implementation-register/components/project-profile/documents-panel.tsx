import { FileText } from 'lucide-react'
import type { ProjectRecord } from '@/api/schemas/implementation-register'

/** Supporting evidence documents attached to the project. */
export function DocumentsPanel({ project }: { project: ProjectRecord }) {
  return (
    <section className="rounded-control bg-surface-sunken p-4">
      <h3 className="text-sm font-semibold text-text-default">Documents</h3>

      {project.profile.documents.length === 0 ? (
        <p className="mt-2 text-sm text-text-muted">No documents attached yet.</p>
      ) : (
        <ul className="mt-2 space-y-2">
          {project.profile.documents.map((document) => (
            <li key={document.url}>
              <a
                className="inline-flex items-center gap-2 text-sm text-brand-700 underline underline-offset-2"
                href={document.url}
                rel="noreferrer"
                target="_blank"
              >
                <FileText aria-hidden="true" className="size-4 shrink-0" />
                {document.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
