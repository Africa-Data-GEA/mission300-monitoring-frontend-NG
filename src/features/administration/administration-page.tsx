import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Card } from '@/components/ui/card'
import { ErrorState } from '@/components/ui/error-state'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { readAuthSession } from '@/features/auth/auth-session'
import { canUserReachModule } from '@/features/auth/role-access'
import { useAdministrationPage } from './use-administration-page'
import { AdministrationFilters } from './components/administration-filters'
import { AdministrationSkeleton } from './components/administration-skeleton'
import { AuditLog } from './components/audit-log'
import { CustomizationPanel } from './components/customization-panel'
import { InviteUserDialog } from './components/invite-user-dialog'
import { RolesAndPermissions } from './components/roles-matrix'
import { ScopeTable } from './components/scope-table'
import { TabCount } from './components/tab-count'
import { UsersTable } from './components/users-table'
import { EditUserDialog } from './components/edit-user-dialog'

/**
 * User Access and Administration — an admin console, not a single flat page.
 * Specification: docs/specs/user-access-administration.md
 *
 * Structured as a lightweight console shell: a vertical sub-nav on the left
 * (Users / Roles / Access scope / Audit log / Customization) and the active
 * panel on the right — still one route, one page, just laid out like a
 * console rather than a horizontal-tab document. Reuses `Tabs` in its
 * vertical orientation rather than a new nav component, so the same
 * value/onValueChange state wiring in use-administration-page.ts still
 * drives which panel is active.
 *
 * Customization (site branding) is gated to system-administrator only — the
 * one panel here with dashboard-wide blast radius, changing colours and the
 * logo for every user, not just this admin's own view.
 *
 * All other state and data-fetching lives in use-administration-page.ts —
 * this component only reads that hook and renders.
 */
export function AdministrationPage() {
  const page = useAdministrationPage()
  const session = readAuthSession()
  const canCustomize = !!session && canUserReachModule(session.user, 'branding')

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

      <Tabs
        value={page.activeTab}
        defaultValue="users"
        onValueChange={page.changeTab}
        className="flex min-w-0 flex-col gap-4 md:flex-row"
      >
        <Card className="w-full min-w-0 self-start p-2 md:w-56 md:shrink-0">
          <TabsList orientation="vertical" aria-label="Administration sections">
            <TabsTrigger orientation="vertical" value="users">
              <span className="flex-1">Users</span>
              <TabCount value={data.users.total} />
            </TabsTrigger>
            <TabsTrigger orientation="vertical" value="roles">
              <span className="flex-1">Roles &amp; permissions</span>
              <TabCount value={data.roles.length} />
            </TabsTrigger>
            <TabsTrigger orientation="vertical" value="scope">
              <span className="flex-1">Access scope</span>
              <TabCount value={data.scopeAssignments.total} />
            </TabsTrigger>
            <TabsTrigger orientation="vertical" value="audit">
              <span className="flex-1">Audit log</span>
              <TabCount value={data.auditLog.total} />
            </TabsTrigger>
            {canCustomize && (
              <TabsTrigger orientation="vertical" value="branding">
                <span className="flex-1">Customization</span>
              </TabsTrigger>
            )}
          </TabsList>
        </Card>

        <Card className="min-w-0 flex-1 overflow-hidden p-0">
          {page.activeTab !== 'branding' && page.filters && (
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
                onPageSizeChange={page.changePageSize}
                onReviewAccess={page.reviewUserAccess}
                onReviewAudit={page.reviewUserAudit}
                onInviteUser={page.openInvite}
                onEditUser={page.openUserEditor}
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
                onPageSizeChange={page.changePageSize}
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
                onPageSizeChange={page.changePageSize}
                onViewUser={page.viewAuditUser}
              />
            </TabsContent>

            {canCustomize && (
              <TabsContent value="branding" className="pt-4">
                <CustomizationPanel />
              </TabsContent>
            )}
          </div>
        </Card>
      </Tabs>

      <InviteUserDialog
        onClose={page.closeInvite}
        onInvited={page.refreshAfterInvite}
        open={page.inviteOpen}
      />
      {page.editUser && (
        <EditUserDialog
          key={page.editUser.id}
          user={page.editUser}
          onClose={page.closeUserEditor}
          onSaved={page.refreshAfterUserEdit}
        />
      )}
    </div>
  )
}
