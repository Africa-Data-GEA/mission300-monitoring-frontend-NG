import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Card } from '@/components/ui/card'

export function UploadGroup({
  title,
  subtitle,
  summary,
  children,
}: {
  title: string
  subtitle: string
  summary: string
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const Chevron = open ? ChevronDown : ChevronRight

  return (
    <Card className="overflow-hidden p-0">
      <button
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-4 text-left hover:bg-surface-sunken"
        onClick={() => setOpen((current) => !current)}
        type="button"
      >
        <Chevron className="size-4 shrink-0 text-text-muted" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-text-default">{title}</span>
          <span className="block text-sm text-text-muted">{subtitle}</span>
        </span>
        <span className="text-sm text-text-muted">{summary}</span>
      </button>
      {open && <div className="border-t border-border-default bg-surface-sunken p-4 sm:pl-11">{children}</div>}
    </Card>
  )
}
