import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { userAccountSchema } from '@/api/schemas/administration'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { readAuthSession } from '@/features/auth/auth-session'
import { grantedRoles } from '@/features/auth/role-access'
import { api } from '@/lib/api-client'
import type { SubmissionListItem } from '@/api/schemas/data-submissions'
import { useDataGaps, useObligations, useSubmissions } from '../api'
import { DEFAULT_WORKFLOW_QUERY } from '../use-workflow-query'
import { TruncationNotice } from '../components/truncation-notice'
import { WorkflowStatusBadge } from '../components/workflow-status'

const FETCH_ALL = { ...DEFAULT_WORKFLOW_QUERY, pageSize: 100 }

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
interface RecentUpload {
  key: string
  title: string
  subtitle: string
  status: SubmissionListItem['status']
  linkId: string
}

function groupRecentUploads(items: SubmissionListItem[]): RecentUpload[] {
  const groups = new Map<string, SubmissionListItem[]>()
  for (const item of items) groups.set(item.batchId ?? item.id, [...(groups.get(item.batchId ?? item.id) ?? []), item])
  return [...groups]
    .map(([key, members]) => {
      const first = members[0]
      if (!first) return null
      const datasets = new Set(members.map((member) => member.dataset))
      const counts = new Map<string, number>()
      for (const member of members) counts.set(member.status.label, (counts.get(member.status.label) ?? 0) + 1)
      return {
        key,
        sortKey: Math.max(...members.map((member) => new Date(member.submittedAt ?? 0).getTime())),
        title:
          members.length === 1
            ? `${first.dataset} · ${first.reportingPeriod}`
            : `${datasets.size === 1 ? first.dataset : `${datasets.size} datasets`} · ${members.length} submissions`,
        subtitle:
          members.length === 1
            ? `v${first.version} · ${first.submittedAtLabel}`
            : `${[...counts].map(([label, count]) => `${count} ${label.toLowerCase()}`).join(' · ')} · ${first.submittedAtLabel}`,
        status: first.status,
        linkId: first.id,
      }
    })
    .filter((entry): entry is RecentUpload & { sortKey: number } => entry !== null)
    .sort((a, b) => b.sortKey - a.sortKey)
}

export function InstitutionDashboardPage() {
  const session = readAuthSession()
  const { data: account } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: () => api.get('/users/me', userAccountSchema),
    enabled: !!session,
  })
  const institution = account?.institution ?? null
  // Kept in sync with the REVIEW_ROLES lists in workflow-shell.tsx and
  // submissions-page.tsx: a multi-role account (e.g. provider +
  // system-administrator) still needs the validation-detail link here to
  // work rather than silently rendering as plain, unlinked text.
  const canReview = !!session && grantedRoles(session.user).some((role) =>
    role === 'data-reviewer' || role === 'validator' || role === 'system-administrator',
  )

  const obligations = useObligations(FETCH_ALL)
  const submissions = useSubmissions(FETCH_ALL)
  const gaps = useDataGaps(FETCH_ALL)

  const myObligations = (obligations.data?.items ?? [])
    .filter((row) => !!institution && row.institution === institution)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

  const recentUploads = groupRecentUploads(submissions.data?.items ?? []).slice(0, 5)

  const myGaps = (gaps.data?.items ?? []).filter((row) => !!institution && row.institution === institution)

  const dueOrOverdue = myObligations.filter((row) => row.status.code === 'due' || row.status.code === 'overdue')

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div>
        <Breadcrumb items={[{ label: 'Data operations' }, { label: 'Overview' }]} />
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-default">
          {institution ?? 'Your submissions'}
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-text-muted">
          {account
            ? `Signed in as ${account.name}. Obligations, recent submissions and data gaps for ${institution}.`
            : 'Sign in as an institutional data provider to see obligations, submissions and data gaps scoped to your institution.'}
        </p>
        {canReview && (
          <Link to="/data-submissions/validation" className="mt-2 inline-block text-sm font-medium text-link underline">
            Open validation queue
          </Link>
        )}
      </div>

      <Card className="flex flex-wrap items-center justify-between gap-3 border-brand-200 bg-brand-50 p-4">
        <div>
          <p className="text-xs font-medium text-brand-700">Submit your data</p>
          <p className="mt-0.5 text-sm font-semibold text-text-default">
            {dueOrOverdue.length > 0
              ? `${dueOrOverdue.length} ${dueOrOverdue.length === 1 ? 'dataset is' : 'datasets are'} due or overdue`
              : 'Everything is up to date'}
          </p>
          <p className="mt-0.5 text-xs text-text-muted">
            One workbook with a sheet per dataset, already listing your open periods.
          </p>
        </div>
        <Button asChild size="sm">
          <Link to="/data-submissions/workbook">Download and upload workbook</Link>
        </Button>
      </Card>

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
              </div>
            ))}
          </div>
        )}

        <TruncationNotice shown={obligations.data?.items.length ?? 0} total={obligations.data?.total ?? 0} />
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
        ) : recentUploads.length === 0 ? (
          <p className="mt-3 text-sm text-text-muted">No submissions yet.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {recentUploads.map((row) => {
              const content = (
                <>
                  <div>
                    <p className="text-sm font-medium text-text-default">{row.title}</p>
                    <p className="mt-0.5 text-xs text-text-muted">{row.subtitle}</p>
                  </div>
                  <WorkflowStatusBadge status={row.status} />
                </>
              )
              return (
                <Link
                  key={row.key}
                  to="/data-submissions/submissions"
                  className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-border-default bg-surface p-3 transition-colors hover:bg-surface-sunken"
                >
                  {content}
                </Link>
              )
            })}
          </div>
        )}

        <TruncationNotice shown={submissions.data?.items.length ?? 0} total={submissions.data?.total ?? 0} />
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

        <TruncationNotice shown={gaps.data?.items.length ?? 0} total={gaps.data?.total ?? 0} />
      </Card>
    </div>
  )
}
