import { UsersRound } from 'lucide-react'
import {
  PERMISSIONS,
  PERMISSION_LABELS,
  type RoleDefinition,
} from '@/api/schemas/administration'
import { Card } from '@/components/ui/card'
import { RowActionMenu } from '@/components/ui/row-action-menu'
import { PermissionCell } from './permission-cell'

/**
 * The role × permission matrix.
 *
 * Permissions are stored independently of a user's official job designation
 * and applied on a least-privilege basis — the specification is explicit
 * about both, so this table is the authority, not someone's job title.
 */
export function PermissionMatrix({
  roles,
  onViewUsers,
}: {
  roles: readonly RoleDefinition[]
  onViewUsers: (role: RoleDefinition) => void
}) {
  return (
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
              <th scope="col" className="w-12 px-2 py-2">
                <span className="sr-only">Actions</span>
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
                <td className="px-2 py-1.5 text-right">
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
  )
}
