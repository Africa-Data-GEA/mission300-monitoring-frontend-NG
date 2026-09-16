import { SYSTEM_ROLE_LABELS, type UserAccount } from '@/api/schemas/administration'
import type { Column } from '@/components/ui/data-table'
import { formatDate, formatRelativeTime } from '@/lib/format'
import { AccountStatusBadge } from './account-status-badge'

/** Column definitions for the user accounts table (Section B). */
export const USERS_TABLE_COLUMNS: readonly Column<UserAccount>[] = [
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
    sortValue: (user) => (user.roles?.length ? user.roles : [user.role]).map((role) => SYSTEM_ROLE_LABELS[role]).join(', '),
    cell: (user) => (
      <span>{(user.roles?.length ? user.roles : [user.role]).map((role) => SYSTEM_ROLE_LABELS[role]).join(', ')}</span>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    sortValue: (user) => user.status,
    cell: (user) => <AccountStatusBadge status={user.status} />,
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
