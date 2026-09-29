import type { ReactNode } from 'react'
import { Breadcrumb } from '@/components/ui/breadcrumb'

/**
 * Single-page layout — no internal tab navigation. State & DisCo used to
 * split Overview / Comparison / Supply & tariff / Delivery / States across
 * five separate routes behind tabs; all of that now lives on one scrollable
 * page (see state-disco-page.tsx), so this shell is just the shared header.
 */
export function StateDiscoShell({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div>
        <Breadcrumb items={[{ label: 'Monitoring & Analysis' }, { label: 'State & DisCo Performance' }]} />
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-default">{title}</h1>
        {description && <p className="mt-1 max-w-3xl text-sm text-text-muted">{description}</p>}
      </div>
      {children}
    </div>
  )
}
