import type { RoleDefinition } from '@/api/schemas/administration'
import { Card } from '@/components/ui/card'

/** The seven recommended roles, with their permissions and module reach. */
export function RoleCatalogue({ roles }: { roles: readonly RoleDefinition[] }) {
  return (
    <Card className="mt-2 p-2 sm:mt-3 sm:p-4">
      <h3 className="text-sm font-semibold text-text-default">Role catalogue</h3>

      <ul aria-label="Role catalogue" className="mt-3 grid gap-3 lg:grid-cols-2">
        {roles.map((role) => (
          <li key={role.role} className="rounded-control bg-surface-sunken p-3">
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
  )
}
