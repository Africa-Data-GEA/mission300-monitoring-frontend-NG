import { Check, Minus } from 'lucide-react'
import {
  PERMISSION_LABELS,
  type Permission,
  type RoleDefinition,
} from '@/api/schemas/administration'
import { cn } from '@/lib/utils'

/** One cell of the role × permission matrix. */
export function PermissionCell({
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
