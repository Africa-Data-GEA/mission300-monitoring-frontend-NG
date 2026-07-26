import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Card } from '@/components/ui/card'
import { ErrorState } from '@/components/ui/error-state'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAdministrationPage } from './use-administration-page'
import { AdministrationFilters } from './components/administration-filters'
import { AdministrationSkeleton } from './components/administration-skeleton'
import { AuditLog } from './components/audit-log'
import { InviteUserDialog } from './components/invite-user-dialog'
import { RolesAndPermissions } from './components/roles-matrix'
import { ScopeTable } from './components/scope-table'
import { TabCount } from './components/tab-count'
import { UsersTable } from './components/users-table'

/**
 * User Access and Administration.
 * Specification: docs/specs/user-access-administration.md
 *
 * Unlike the monitoring modules this is account and permission administration,
 * not performance measurement — the specification says so explicitly. It uses
 * its own eight filters rather than the global dashboard filters, so the route
 * opts out of the global filter bar (see src/app/router.tsx).
 *
 * All state and data-fetching lives in use-administration-page.ts — this
 * component only reads that hook and renders.
 */
export function AdministrationPage() {
  const page = useAdministrationPage()

  if (page.isPending) return <AdministrationSkeleton />

  if (page.isError) {
    return (
      <ErrorState
        title="User access could not be loaded"
        message={page.error.message}
        onRetry={page.retry}
      />
    )
  }

  if (!page.data) return null

  const { data } = page

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div>
        <Breadcrumb
          items={[
            { label: 'Administration' },
            { label: 'User Access & Administration' },
          ]}
        />
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-default">
          User Access &amp; Administration
        </h1>
      </div>

      <Card className="min-w-0 overflow-hidden p-0">
        <Tabs
          value={page.activeTab}
          defaultValue="users"
          onValueChange={page.changeTab}
        >
          <TabsList>
            <TabsTrigger value="users">
              Users
              <TabCount value={data.users.total} />
            </TabsTrigger>
            <TabsTrigger value="roles">
              Roles &amp; permissions
              <TabCount value={data.roles.length} />
            </TabsTrigger>
            <TabsTrigger value="scope">
              Access scope
              <TabCount value={data.scopeAssignments.total} />
            </TabsTrigger>
            <TabsTrigger value="audit">
              Audit log
              <TabCount value={data.auditLog.total} />
            </TabsTrigger>
          </TabsList>

          {page.filters && (
            <div className="px-2 pt-3 sm:px-4">
              <AdministrationFilters
                options={page.filters}
                value={page.query}
                activeFilterCount={page.activeFilterCount}
                onChange={page.changeFilters}
                onReset={page.resetFilters}
              />
            </div>
          )}

          <div className="min-w-0 p-2 pt-0 sm:p-4 sm:pt-0">
            <TabsContent value="users">
              <UsersTable
                users={data.users.items}
                page={data.users.page}
                pageSize={data.users.pageSize}
                total={data.users.total}
                onPageChange={page.setUsersPage}
                onReviewAccess={page.reviewUserAccess}
                onReviewAudit={page.reviewUserAudit}
                onInviteUser={page.openInvite}
              />
            </TabsContent>

            <TabsContent value="roles">
              <RolesAndPermissions
                roles={data.roles}
                onViewUsers={page.viewUsersForRole}
              />
            </TabsContent>

            <TabsContent value="scope">
              <ScopeTable
                assignments={data.scopeAssignments.items}
                page={data.scopeAssignments.page}
                pageSize={data.scopeAssignments.pageSize}
                total={data.scopeAssignments.total}
                onPageChange={page.setScopePage}
                onViewUser={page.viewScopeUser}
              />
            </TabsContent>

            <TabsContent value="audit">
              <AuditLog
                events={data.auditLog.items}
                page={data.auditLog.page}
                pageSize={data.auditLog.pageSize}
                total={data.auditLog.total}
                onPageChange={page.setAuditPage}
                onViewUser={page.viewAuditUser}
              />
            </TabsContent>
          </div>
        </Tabs>
      </Card>
      <InviteUserDialog
        onClose={page.closeInvite}
        onInvited={page.refreshAfterInvite}
        open={page.inviteOpen}
      />
    </div>
  )
}
