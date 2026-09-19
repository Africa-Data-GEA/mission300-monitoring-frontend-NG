import { NavLink } from 'react-router'
import type { ReactNode } from 'react'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { readAuthSession } from '@/features/auth/auth-session'
import { grantedRoles } from '@/features/auth/role-access'
import { cn } from '@/lib/utils'

const REVIEW_ROLES = ['data-reviewer', 'validator', 'system-administrator']

const links = [
  { to: '/data-submissions', label: 'Overview', end: true },
  { to: '/data-submissions/obligations', label: 'Reporting obligations' },
  { to: '/data-submissions/submissions', label: 'Submission history' },
  // Only the validation-queue route requires a reviewer/validator role (see
  // rolePage(REVIEWERS, ...) in routes.tsx) — filtered out below for anyone
  // else so this shared tab strip never links to a page that then bounces
  // the user to /access-denied.
  { to: '/data-submissions/validation', label: 'Validation queue', reviewOnly: true },
  { to: '/data-submissions/overdue', label: 'Overdue & missing' },
  { to: '/data-submissions/gaps', label: 'Data gaps' },
]

export function WorkflowShell({ title, description, actions, children }: {
  title: string
  description: string
  actions?: ReactNode
  children: ReactNode
}) {
  const session = readAuthSession()
  const canReview = !!session && grantedRoles(session.user).some((role) => REVIEW_ROLES.includes(role))
  const visibleLinks = links.filter((link) => !link.reviewOnly || canReview)

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div>
        <Breadcrumb items={[{ label: 'Data operations' }, { label: title }]} />
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-text-default">{title}</h1>
            <p className="mt-1 max-w-3xl text-sm text-text-muted">{description}</p>
          </div>
          {actions}
        </div>
      </div>
      <nav aria-label="Submission workflow" className="overflow-x-auto border-b border-border-default">
        <div className="flex min-w-max gap-1">
          {visibleLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => cn(
              'border-b-2 px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'border-brand-700 text-brand-800'
                : 'border-transparent text-text-muted hover:text-text-default',
            )}>
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>
      {children}
    </div>
  )
}
