import { cn } from '@/lib/utils'

/**
 * Horizontal progress bar used for milestone delivery and data submission.
 * Exposed as a real progressbar to assistive technology rather than a bare div.
 */
export function ProgressBar({
  value,
  label,
  className,
  barClassName,
}: {
  /** 0–100. Values outside the range are clamped. */
  value: number
  /** Accessible name, e.g. "Compact milestone delivery". */
  label: string
  className?: string
  barClassName?: string
}) {
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn(
        'h-2 w-full overflow-hidden rounded-pill bg-surface-sunken',
        className,
      )}
    >
      <div
        className={cn(
          'h-full rounded-pill bg-brand-500 transition-[width] duration-500 ease-out motion-reduce:transition-none',
          barClassName,
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  )
}
