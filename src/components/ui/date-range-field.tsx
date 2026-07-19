import { CalendarDays } from 'lucide-react'
import { useId, useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { cn } from '@/lib/utils'
import { formatDate } from '@/lib/format'
import { Button } from './button'
import { Calendar } from './calendar'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

/**
 * Custom reporting-period picker.
 *
 * The Executive Overview filter specification allows "month, quarter, year or
 * custom-period selection"; the preset periods are handled by SelectField and
 * this covers the custom-range case.
 */
export function DateRangeField({
  label,
  value,
  onChange,
  placeholder = 'Select date range',
  className,
}: {
  label: string
  value: DateRange | undefined
  onChange: (range: DateRange | undefined) => void
  placeholder?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const labelId = useId()
  const triggerId = useId()

  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <label
        id={labelId}
        htmlFor={triggerId}
        className="text-xs font-medium text-text-muted"
      >
        {label}
      </label>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={triggerId}
            variant="secondary"
            aria-labelledby={`${labelId} ${triggerId}`}
            className={cn(
              'w-full justify-start gap-2 font-medium',
              !value?.from && 'text-text-subtle',
            )}
          >
            <CalendarDays className="text-text-subtle" />
            {formatRangeLabel(value) ?? placeholder}
          </Button>
        </PopoverTrigger>

        <PopoverContent>
          <Calendar
            mode="range"
            selected={value}
            onSelect={onChange}
            numberOfMonths={2}
            autoFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}

/** Renders the selected range, tolerating a half-open range mid-selection. */
function formatRangeLabel(range: DateRange | undefined): string | null {
  if (!range?.from) return null
  if (!range.to) return formatDate(range.from.toISOString())

  return `${formatDate(range.from.toISOString())} — ${formatDate(range.to.toISOString())}`
}
