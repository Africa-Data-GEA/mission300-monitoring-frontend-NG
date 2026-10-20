import { Check } from 'lucide-react'
import { SYSTEM_ROLE_LABELS, type UserAccount } from '@/api/schemas/administration'
import { cn } from '@/lib/utils'

type Role = UserAccount['role']

const ROLE_HINTS: Record<Role, string> = {
  'system-administrator': 'Manages users, institutions and settings',
  'institutional-data-provider': 'Submits data for an institution',
  'data-reviewer': 'Reviews and decides on submissions',
  validator: 'Validates submitted data',
  'dashboard-manager': 'Manages dashboards and indicators',
  'oversight-user': 'Reads data across institutions',
  'read-only-user': 'View-only access',
}

export function RoleSelector({
  value,
  onChange,
  disabled,
  label = 'Roles this user can perform',
}: {
  value: readonly Role[]
  onChange: (roles: Role[]) => void
  disabled?: boolean
  label?: string
}) {
  function toggle(role: Role) {
    onChange(value.includes(role) ? value.filter((entry) => entry !== role) : [...value, role])
  }

  return (
    <div role="group" aria-label={label} className="grid gap-2 sm:grid-cols-2">
      {(Object.keys(SYSTEM_ROLE_LABELS) as Role[]).map((role) => {
        const selected = value.includes(role)
        return (
          <button
            key={role}
            type="button"
            role="checkbox"
            aria-checked={selected}
            aria-label={SYSTEM_ROLE_LABELS[role]}
            disabled={disabled}
            onClick={() => toggle(role)}
            className={cn(
              'flex items-start gap-3 rounded-control border p-3 text-left transition-colors disabled:opacity-50',
              selected
                ? 'border-brand-600 bg-brand-50'
                : 'border-border-default bg-surface hover:bg-surface-sunken',
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-sm border',
                selected ? 'border-brand-600 bg-brand-600 text-white' : 'border-border-strong bg-surface',
              )}
            >
              {selected && <Check className="size-3" />}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium text-text-default">{SYSTEM_ROLE_LABELS[role]}</span>
              <span className="block text-xs text-text-muted">{ROLE_HINTS[role]}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
