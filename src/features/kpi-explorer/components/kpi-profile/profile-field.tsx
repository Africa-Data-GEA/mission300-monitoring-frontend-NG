import { cn } from '@/lib/utils'

/** A single label/value row inside a profile panel's definition list. */
export function ProfileField({
  label,
  value,
  mono = false,
  block = false,
}: {
  label: string
  value: string
  /** Render the value in a monospace font, e.g. for a formula. */
  mono?: boolean
  /** Span the full grid width rather than a single column. */
  block?: boolean
}) {
  return (
    <div className={cn(block && 'col-span-full')}>
      <dt className="text-xs text-text-muted">{label}</dt>
      <dd
        className={cn(
          'mt-0.5 text-text-default',
          mono ? 'font-mono text-xs' : 'text-sm',
        )}
      >
        {value}
      </dd>
    </div>
  )
}
