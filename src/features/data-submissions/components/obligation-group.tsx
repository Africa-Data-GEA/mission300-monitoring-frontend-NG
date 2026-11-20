import { ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import type { Obligation } from '@/api/schemas/data-submissions'
import { Card } from '@/components/ui/card'
import { ObligationActions } from './obligation-actions'
import { WorkflowStatusBadge } from './workflow-status'

function summarize(items: Obligation[]) {
  const counts = new Map<string, number>()
  for (const item of items) counts.set(item.status.label, (counts.get(item.status.label) ?? 0) + 1)
  return [...counts].map(([label, count]) => `${count} ${label.toLowerCase()}`).join(' · ')
}

export function ObligationGroup({ institution, items }: { institution: string; items: Obligation[] }) {
  const [open, setOpen] = useState(false)
  const Chevron = open ? ChevronDown : ChevronRight
  const periods = [...new Set(items.map((item) => item.reportingPeriod))]

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
          <span className="block font-semibold text-text-default">{institution}</span>
          <span className="block text-sm text-text-muted">
            {items.length} dataset{items.length === 1 ? '' : 's'} · {periods.length === 1 ? periods[0] : `${periods.length} periods`}
          </span>
        </span>
        <span className="text-sm text-text-muted">{summarize(items)}</span>
      </button>
      {open && (
        <div className="border-t border-border-default bg-surface-sunken p-4 sm:pl-11">
          <div className="overflow-x-auto rounded-control border border-border-default bg-surface">
            <table className="w-full text-sm">
              <caption className="sr-only">{institution} reporting obligations</caption>
              <thead>
                <tr className="border-b border-border-default text-left text-xs text-text-muted">
                  <th className="px-3 py-2 font-medium">Dataset</th>
                  <th className="px-3 py-2 font-medium">Period</th>
                  <th className="px-3 py-2 font-medium">Frequency</th>
                  <th className="px-3 py-2 font-medium">Due</th>
                  <th className="px-3 py-2 font-medium">Status</th>
                  <th className="px-3 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-3 py-2 font-medium">{item.dataset}</td>
                    <td className="px-3 py-2">{item.reportingPeriod}</td>
                    <td className="px-3 py-2">{item.frequency}</td>
                    <td className="px-3 py-2">{item.dueLabel}</td>
                    <td className="px-3 py-2"><WorkflowStatusBadge status={item.status} /></td>
                    <td className="px-3 py-2"><ObligationActions obligation={item} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  )
}
