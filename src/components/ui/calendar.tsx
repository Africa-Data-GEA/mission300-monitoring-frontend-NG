import { ChevronLeft, ChevronRight } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'
import { buttonVariants } from './button'

/**
 * Calendar, in the shadcn/ui pattern (react-day-picker), restyled onto the
 * Mission 300 tokens and tightened to the dashboard's density.
 */
export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-1', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-3',
        month: 'flex flex-col gap-3',
        month_caption: 'flex justify-center pt-1 relative items-center h-8',
        caption_label: 'text-sm font-semibold text-text-default',
        nav: 'flex items-center gap-1 absolute inset-x-0 top-1 justify-between px-1',
        button_previous: cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'size-7 text-text-muted',
        ),
        button_next: cn(
          buttonVariants({ variant: 'ghost', size: 'icon' }),
          'size-7 text-text-muted',
        ),
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'text-text-subtle rounded-md w-8 text-2xs font-medium',
        week: 'flex w-full mt-1',
        day: 'size-8 p-0 text-center text-sm',
        day_button: cn(
          'size-8 rounded-control p-0 font-normal text-text-default transition-colors',
          'hover:bg-surface-sunken',
        ),
        selected:
          '[&>button]:bg-brand-700 [&>button]:text-white [&>button]:hover:bg-brand-800',
        today: '[&>button]:font-semibold [&>button]:text-brand-700',
        outside: '[&>button]:text-text-subtle [&>button]:opacity-60',
        disabled: '[&>button]:opacity-40 [&>button]:cursor-not-allowed',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...chevronProps }) =>
          orientation === 'left' ? (
            <ChevronLeft className="size-4" {...chevronProps} />
          ) : (
            <ChevronRight className="size-4" {...chevronProps} />
          ),
      }}
      {...props}
    />
  )
}
