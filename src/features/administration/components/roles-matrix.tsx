import { Check, Minus, UsersRound } from 'lucide-react'
import {
  PERMISSIONS,
  PERMISSION_LABELS,
  type Permission,
  type RoleDefinition,
} from '@/api/schemas/administration'
import { Card } from '@/components/ui/card'
import { RowActionMenu } from '@/components/ui/row-action-menu'
import { cn } from '@/lib/utils'

/**
 * Section C — Roles and permissions.
 *
 * Two views of the same data: the matrix answers "who can do what", the
 * catalogue answers "what is this role for". The specification asks for both.
 *
 * Permissions are stored independently of a user's official job designation
 * and applied on a least-privilege basis — the specification is explicit about
 * both, so the matrix is the authority, not someone's job title.
 */
export function RolesAndPermissions({
  roles,
  onViewUsers,
}: {
  roles: readonly RoleDefinition[]
  onViewUsers: (role: RoleDefinition) => void
}) {
  return (
    <Card variant="well" className="p-2 sm:p-4">
      <h2 className="text-lg font-semibold text-text-default">
        Roles and permissions
      </h2>

      <Card className="mt-2 p-2 sm:mt-3 sm:p-4">
        <h3 className="text-sm font-semibold text-text-default">
          Permission matrix
        </h3>

        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">
              Permissions granted to each system role
            </caption>

            <thead>
              <tr className="border-b border-border-default">
                <th
                  scope="col"
                  className="px-3 py-2 text-xs font-medium text-text-muted"
                >
                  Role
                </th>
                {PERMISSIONS.map((permission) => (
                  <th
                    key={permission}
                    scope="col"
                    className="px-2 py-2 text-center text-xs font-medium whitespace-nowrap text-text-muted"
                  >
                    {PERMISSION_LABELS[permission]}
                  </th>
                ))}
                <th scope={'col'} className={'w-12 px-2 py-2'}>
                  <span className={'sr-only'}>Actions</span>
                </th>
              </tr>
            </thead>

            <tbody>
              {roles.map((role) => (
                <tr
                  key={role.role}
                  className="border-b border-border-default last:border-0"
                >
                  <th
                    scope="row"
                    className="px-3 py-2.5 text-sm font-medium whitespace-nowrap text-text-default"
                  >
                    {role.label}
                  </th>
                  {PERMISSIONS.map((permission) => (
                    <PermissionCell
                      key={permission}
                      role={role}
                      permission={permission}
                    />
                  ))}
                  <td className={'px-2 py-1.5 text-right'}>
                    <RowActionMenu
                      label={`Actions for ${role.label}`}
                      actions={[
                        {
                          label: 'View assigned users',
                          icon: UsersRound,
                          onSelect: () => onViewUsers(role),
                        },
                        { label: 'Copy role name', copyText: role.label },
                        { label: 'Copy role ID', copyText: role.role },
                      ]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="mt-2 p-2 sm:mt-3 sm:p-4">
        <h3 className="text-sm font-semibold text-text-default">
          Role catalogue
        </h3>

        <ul aria-label="Role catalogue" className="mt-3 grid gap-3 lg:grid-cols-2">
          {roles.map((role) => (
            <li
              key={role.role}
              className="rounded-control bg-surface-sunken p-3"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="text-sm font-semibold text-text-default">
                  {role.label}
                </h4>
                <span className="text-xs text-text-muted">
                  {role.assignedUsers} user{role.assignedUsers === 1 ? '' : 's'}
                </span>
              </div>

              <p className="mt-1 text-xs text-text-muted">{role.description}</p>

              <p className="mt-2 text-xs text-text-subtle">
                {role.modules.join(' · ')}
              </p>
            </li>
          ))}
        </ul>
      </Card>
    </Card>
  )
}

function PermissionCell({
  role,
  permission,
}: {
  role: RoleDefinition
  permission: Permission
}) {
  const granted = role.permissions.includes(permission)

  return (
    <td className="px-2 py-2.5 text-center">
      {/*
        A tick alone is ambiguous to a screen reader in a grid this wide, so
        each cell states the role, the permission and the outcome.
      */}
      <span className="sr-only">
        {role.label} {granted ? 'can' : 'cannot'}{' '}
        {PERMISSION_LABELS[permission].toLowerCase()}
      </span>
      {granted ? (
        <Check
          aria-hidden="true"
          className={cn(
            'mx-auto size-4',
            permission === 'administer' || permission === 'approve'
              ? 'text-status-lagging'
              : 'text-status-on-track',
          )}
        />
      ) : (
        <Minus aria-hidden="true" className="mx-auto size-3.5 text-text-subtle" />
      )}
    </td>
  )
}
