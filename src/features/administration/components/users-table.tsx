import { History, Plus, ShieldCheck, UserCog } from 'lucide-react'
import type { UserAccount } from '@/api/schemas/administration'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DataTable } from '@/components/ui/data-table'
import { Pagination } from '@/components/ui/pagination'
import { RowActionMenu } from '@/components/ui/row-action-menu'
import { USERS_TABLE_COLUMNS } from './users-table-columns'

/** Section B — the user account table. */
export function UsersTable({
  users,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onReviewAccess,
  onReviewAudit,
  onInviteUser,
  onEditUser,
}: {
  users: readonly UserAccount[]
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onReviewAccess: (user: UserAccount) => void
  onReviewAudit: (user: UserAccount) => void
  onInviteUser: () => void
  onEditUser: (user: UserAccount) => void
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
          columns={USERS_TABLE_COLUMNS}
          rows={users}
          getRowId={(user) => user.id}
          rowActions={(user) => (
            <RowActionMenu
              label={`Actions for ${user.name}`}
              actions={[
                {
                  label: 'Edit user',
                  icon: UserCog,
                  onSelect: () => onEditUser(user),
                },
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
        onPageSizeChange={onPageSizeChange}
      />
    </Card>
  )
}
