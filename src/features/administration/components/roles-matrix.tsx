import type { RoleDefinition } from '@/api/schemas/administration'
import { Card } from '@/components/ui/card'
import { PermissionMatrix } from './permission-matrix'
import { RoleCatalogue } from './role-catalogue'

/**
 * Section C — Roles and permissions.
 *
 * Two views of the same data: the matrix (permission-matrix.tsx) answers
 * "who can do what", the catalogue (role-catalogue.tsx) answers "what is this
 * role for". The specification asks for both.
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

      <PermissionMatrix roles={roles} onViewUsers={onViewUsers} />
      <RoleCatalogue roles={roles} />
    </Card>
  )
}
