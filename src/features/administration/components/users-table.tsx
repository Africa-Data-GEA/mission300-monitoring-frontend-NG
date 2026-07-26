import { History, Plus, ShieldCheck } from 'lucide-react'
import {
  ACCOUNT_STATUS_LABELS,
  SYSTEM_ROLE_LABELS,
  type AccountStatus,
  type UserAccount,
} from '@/api/schemas/administration'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { RowActionMenu } from '@/components/ui/row-action-menu'
import { formatDate, formatRelativeTime } from '@/lib/format'
import { cn } from '@/lib/utils'

/** Account status colouring. Suspended is the only one that reads as a problem. */
const STATUS_STYLES: Record<AccountStatus, string> = {
  active: 'bg-status-on-track-bg text-status-on-track',
  pending: 'bg-status-lagging-bg text-status-lagging',
  inactive: 'bg-status-no-data-bg text-status-no-data',
  suspended: 'bg-status-at-risk-bg text-status-at-risk',
}

function StatusBadge({ status }: { status: AccountStatus }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-pill px-2 py-0.5 text-xs font-medium whitespace-nowrap',
        STATUS_STYLES[status],
      )}
    >
      {ACCOUNT_STATUS_LABELS[status]}
    </span>
  )
}

const COLUMNS: readonly Column<UserAccount>[] = [
  {
    id: 'name',
    header: 'Name',
    sortValue: (user) => user.name,
    cell: (user) => (
      <div className="min-w-0">
        <p className="font-medium text-text-default">{user.name}</p>
        <p className="truncate text-xs text-text-muted">{user.email}</p>
      </div>
    ),
  },
  {
    id: 'institution',
    header: 'Institution',
    sortValue: (user) => user.institution,
    cell: (user) => (
      <div className="min-w-0">
        <p className="text-text-default">{user.institution}</p>
        <p className="truncate text-xs text-text-muted">{user.designation}</p>
      </div>
    ),
  },
  {
    id: 'role',
    header: 'System role',
    sortValue: (user) => SYSTEM_ROLE_LABELS[user.role],
    cell: (user) => (
      <span className="whitespace-nowrap">{SYSTEM_ROLE_LABELS[user.role]}</span>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    sortValue: (user) => user.status,
    cell: (user) => <StatusBadge status={user.status} />,
  },
  {
    id: 'lastLogin',
    header: 'Last login',
    // Null sorts last — "never signed in" is not a date.
    sortValue: (user) => user.lastLogin,
    cell: (user) =>
      user.lastLogin ? (
        <span className="whitespace-nowrap text-text-muted">
          {formatRelativeTime(user.lastLogin)}
        </span>
      ) : (
        // An invited account that has never signed in must say so rather than
        // showing a dash that reads as missing data.
        <span className="text-xs text-text-subtle">Never signed in</span>
      ),
  },
  {
    id: 'createdAt',
    header: 'Created',
    sortValue: (user) => user.createdAt,
    cell: (user) => (
      <span className="whitespace-nowrap text-text-muted">
        {formatDate(user.createdAt)}
      </span>
    ),
  },
]

/** Section B — the user account table. */
export function UsersTable({
  users,
  page,
  pageSize,
  total,
  onPageChange,
  onReviewAccess,
  onReviewAudit,
  onInviteUser,
}: {
  users: readonly UserAccount[]
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onReviewAccess: (user: UserAccount) => void
  onReviewAudit: (user: UserAccount) => void
  onInviteUser: () => void
}) {
  return (
    <Card variant="well" className="p-2 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-text-default">Users</h2>
        <Button onClick={onInviteUser} size="sm" type="button">
          <Plus aria-hidden="true" />
          Invite new user
        </Button>
      </div>

      <Card className="mt-2 p-0 sm:mt-3 sm:p-1">
        <DataTable
          caption="Dashboard user accounts and institutional links"
          columns={COLUMNS}
          rows={users}
          getRowId={(user) => user.id}
          rowActions={(user) => (
            <RowActionMenu
              label={`Actions for ${user.name}`}
              actions={[
                {
                  label: 'Review access',
                  icon: ShieldCheck,
                  onSelect: () => onReviewAccess(user),
                },
                {
                  label: 'Review audit history',
                  icon: History,
                  onSelect: () => onReviewAudit(user),
                },
                { label: 'Copy email', copyText: user.email },
                { label: 'Copy user ID', copyText: user.id },
              ]}
            />
          )}
          emptyMessage="No users match the current filters."
        />
      </Card>

      <Pagination
        page={page}
        pageSize={pageSize}
        total={total}
        onPageChange={onPageChange}
      />
    </Card>
  )
}
