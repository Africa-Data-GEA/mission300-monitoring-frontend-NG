import type { ComponentPropsWithoutRef } from 'react'
import { cn } from '@/lib/utils'

/**
 * Base surface for panels and metric cards.
 *
 * Cards carry no border and no shadow. Separation comes entirely from surface
 * contrast — a white card on the grey page, or a white card inside a grey
 * well. Use `variant="well"` for the grey container that groups white cards,
 * as in the Access delivery, National performance and Delivery status
 * sections.
 */
export function Card({
  className,
  variant = 'default',
  ...props
}: ComponentPropsWithoutRef<'div'> & {
  variant?: 'default' | 'well'
}) {
  return (
    <div
      data-slot="card"
      className={cn(
        'rounded-card',
        variant === 'well' ? 'bg-surface-sunken' : 'bg-surface',
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  return <div className={cn('p-4 pb-0', className)} {...props} />
}

export function CardTitle({
  className,
  ...props
}: ComponentPropsWithoutRef<'h2'>) {
  return (
    <h2
      className={cn('text-lg font-semibold text-text-default', className)}
      {...props}
    />
  )
}

export function CardDescription({
  className,
  ...props
}: ComponentPropsWithoutRef<'p'>) {
  return (
    <p className={cn('mt-1 text-sm text-text-muted', className)} {...props} />
  )
}

export function CardContent({
  className,
  ...props
}: ComponentPropsWithoutRef<'div'>) {
  return <div className={cn('p-4', className)} {...props} />
}
