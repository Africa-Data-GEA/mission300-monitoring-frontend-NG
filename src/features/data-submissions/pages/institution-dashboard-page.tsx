import { FileSpreadsheet, Keyboard } from 'lucide-react'
import { Link } from 'react-router'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { readAuthSession } from '@/features/auth/auth-session'
import { findAccountById } from '@/features/auth/role-access'
import { useDataGaps, useObligations, useSubmissions } from '../api'
import { ObligationActions } from '../components/obligation-actions'
import { WorkflowStatusBadge } from '../components/workflow-status'

const FETCH_ALL = { pageSize: 100 }

/**
 * The landing view for an institutional data provider — what they see first
 * at /data-submissions (and, per the post-login redirect in
 * use-password-login.ts, right after signing in). Scoped to their own
 * institution rather than the full cross-institution register the other
 * Data Submissions pages show: obligations due or overdue, recent
 * submissions and their status, and data gaps affecting them — the three
 * things a data-providing institution actually needs to act on, plus a
 * shortcut into the two ways to submit.
 *
 * Institution comes from the signed-in account (`readAuthSession` +
 * `findAccountById`), not a picker — there is no server-side "who am I"
 * endpoint yet, so this reads the same session/account lookup the sidebar
 * already uses for role-based nav gating.
 */
export function InstitutionDashboardPage() {
  const session = readAuthSession()
  const account = session ? findAccountById(session.user.id) : undefined
  const institution = account?.institution ?? null

  const obligations = useObligations(FETCH_ALL)
  const submissions = useSubmissions(FETCH_ALL)
  const gaps = useDataGaps(FETCH_ALL)

  const myObligations = (obligations.data?.items ?? [])
    .filter((row) => !institution || row.institution === institution)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

  const mySubmissions = (submissions.data?.items ?? [])
    .filter((row) => !institution || row.institution === institution)
    .sort((a, b) => new Date(b.submittedAt ?? 0).getTime() - new Date(a.submittedAt ?? 0).getTime())
    .slice(0, 5)

  const myGaps = (gaps.data?.items ?? []).filter((row) => !institution || row.institution === institution)

  const dueOrOverdue = myObligations.filter((row) => row.status.code === 'due' || row.status.code === 'overdue')
  const nextObligation = dueOrOverdue[0] ?? myObligations[0] ?? null

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div>
        <Breadcrumb items={[{ label: 'Data operations' }, { label: 'Overview' }]} />
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-default">
          {institution ? `${institution}'s submissions` : 'Your submissions'}
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-text-muted">
          {account
            ? `Signed in as ${account.name}. Obligations, recent submissions and data gaps for ${institution}.`
            : 'Sign in as an institutional data provider to see obligations, submissions and data gaps scoped to your institution.'}
        </p>
      </div>

      {nextObligation && (
        <Card className="flex flex-wrap items-center justify-between gap-3 border-brand-200 bg-brand-50 p-4">
          <div>
            <p className="text-xs font-medium text-brand-700">Next up</p>
            <p className="mt-0.5 text-sm font-semibold text-text-default">
              {nextObligation.dataset} · {nextObligation.reportingPeriod}
            </p>
            <p className="mt-0.5 text-xs text-text-muted">{nextObligation.dueLabel}</p>
          </div>
          <div className="flex gap-2">
            {nextObligation.availableActions.includes('enter-data') && (
              <Button asChild size="sm" variant="secondary">
                <Link to={`/data-submissions/obligations/${nextObligation.id}/entry`}>
                  <Keyboard aria-hidden="true" />
                  Enter data
                </Link>
              </Button>
            )}
            {nextObligation.availableActions.includes('upload-template') && (
              <Button asChild size="sm">
                <Link to={`/data-submissions/obligations/${nextObligation.id}/upload`}>
                  <FileSpreadsheet aria-hidden="true" />
                  Upload
                </Link>
              </Button>
            )}
          </div>
        </Card>
      )}

      <Card variant="well" className="p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-text-default">
            Obligations due or overdue
            {dueOrOverdue.length > 0 && (
              <span className="ml-2 rounded-pill bg-status-at-risk/10 px-2 py-0.5 text-xs font-medium text-status-at-risk">
                {dueOrOverdue.length}
              </span>
            )}
          </h2>
          <Link to="/data-submissions/obligations" className="text-xs font-medium text-link underline underline-offset-4">
            View all obligations →
          </Link>
        </div>

        {obligations.isPending ? (
          <p className="mt-3 text-sm text-text-muted">Loading…</p>
        ) : dueOrOverdue.length === 0 ? (
          <p className="mt-3 text-sm text-text-muted">Nothing due right now.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {dueOrOverdue.slice(0, 5).map((row) => (
              <div
                key={row.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border-default bg-surface p-3"
              >
                <div>
                  <p className="text-sm font-medium text-text-default">
                    {row.dataset} · {row.reportingPeriod}
                  </p>
                  <p className="mt-0.5 flex items-center gap-2 text-xs text-text-muted">
                    <WorkflowStatusBadge status={row.status} />
                    {row.dueLabel}
                  </p>
                </div>
                <ObligationActions obligation={row} />
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card variant="well" className="p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-text-default">Recent submissions</h2>
          <Link to="/data-submissions/submissions" className="text-xs font-medium text-link underline underline-offset-4">
            View submission history →
          </Link>
        </div>

        {submissions.isPending ? (
          <p className="mt-3 text-sm text-text-muted">Loading…</p>
        ) : mySubmissions.length === 0 ? (
          <p className="mt-3 text-sm text-text-muted">No submissions yet.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {mySubmissions.map((row) => (
              <Link
                key={row.id}
                to={`/data-submissions/validation/${row.id}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border-default bg-surface p-3 transition-colors hover:bg-surface-sunken"
              >
                <div>
                  <p className="text-sm font-medium text-text-default">
                    {row.dataset} · {row.reportingPeriod}
                  </p>
                  <p className="mt-0.5 text-xs text-text-muted">
                    v{row.version} · {row.submittedAtLabel}
                  </p>
                </div>
                <WorkflowStatusBadge status={row.status} />
              </Link>
            ))}
          </div>
        )}
      </Card>

      <Card variant="well" className="p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-text-default">
            Data gaps
            {myGaps.length > 0 && (
              <span className="ml-2 rounded-pill bg-status-at-risk/10 px-2 py-0.5 text-xs font-medium text-status-at-risk">
                {myGaps.length}
              </span>
            )}
          </h2>
          <Link to="/data-submissions/gaps" className="text-xs font-medium text-link underline underline-offset-4">
            View all data gaps →
          </Link>
        </div>

        {gaps.isPending ? (
          <p className="mt-3 text-sm text-text-muted">Loading…</p>
        ) : myGaps.length === 0 ? (
          <p className="mt-3 text-sm text-text-muted">No known data gaps for your institution.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {myGaps.slice(0, 5).map((row) => (
              <div key={row.id} className="rounded-card border border-border-default bg-surface p-3">
                <p className="text-sm font-medium text-text-default">
                  {row.kpiName} · {row.reportingPeriod}
                </p>
                <p className="mt-0.5 text-xs text-text-muted">{row.nextAction}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
