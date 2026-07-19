import * as PopoverPrimitive from '@radix-ui/react-popover'
import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * Popover, in the shadcn/ui pattern (Radix Popover), restyled onto the
 * Mission 300 tokens. Used as the surface for the date picker.
 */
export const Popover = PopoverPrimitive.Root
export const PopoverTrigger = PopoverPrimitive.Trigger
export const PopoverAnchor = PopoverPrimitive.Anchor

export function PopoverContent({
  className,
  align = 'start',
  sideOffset = 4,
  ...props
}: ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-slot="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          'z-50 w-auto rounded-control border border-border-default bg-surface p-3 shadow-lg outline-none',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0',
          className,
        )}
        {...props}
      />
    </PopoverPrimitive.Portal>
  )
}
