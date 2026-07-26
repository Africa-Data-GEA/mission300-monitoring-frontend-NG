import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'

/** Shared card shell for the Institutions and Data custodians tables. */
export function TableShell({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <Card variant="well" className="min-w-0 p-2 sm:p-4">
      <h2 className="mb-3 text-lg font-semibold text-text-default">{title}</h2>
      <Card className="p-0 sm:p-1">{children}</Card>
    </Card>
  )
}
