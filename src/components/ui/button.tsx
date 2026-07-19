import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * Button, in the shadcn/ui pattern (Radix Slot + cva), restyled onto the
 * Mission 300 tokens rather than shadcn's default palette.
 */
const buttonVariants = cva(
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-control font-medium whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        primary: 'bg-brand-700 text-white hover:bg-brand-800',
        secondary:
          'border border-border-default bg-surface text-text-default hover:bg-surface-sunken',
        ghost: 'text-text-default hover:bg-surface-sunken',
        danger: 'bg-status-at-risk text-white hover:opacity-90',
      },
      size: {
        sm: 'h-8 px-2.5 text-xs [&_svg]:size-3.5',
        md: 'h-9 px-3 text-sm [&_svg]:size-4',
        lg: 'h-10 px-4 text-base [&_svg]:size-4',
        icon: 'size-9 [&_svg]:size-4',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ComponentPropsWithoutRef<'button'> &
  VariantProps<typeof buttonVariants> & {
    /** Render the child element instead of a <button>, e.g. to style a link. */
    asChild?: boolean
  }) {
  const Component = asChild ? Slot : 'button'

  return (
    <Component
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { buttonVariants }
