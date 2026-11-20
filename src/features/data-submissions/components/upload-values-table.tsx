import { ClipboardCheck } from 'lucide-react'
import { Link } from 'react-router'
import type { UploadBatch } from '@/api/schemas/data-submissions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { WorkflowStatusBadge } from './workflow-status'

type Dataset = UploadBatch['datasets'][number]

export function UploadValuesTable({
  dataset,
  selected,
  onToggle,
  onSelectAll,
}: {
  dataset: Dataset
  selected: ReadonlySet<string>
  onToggle: (id: string) => void
  onSelectAll: (ids: string[]) => void
}) {
  const decidable = dataset.rows.filter((row) => row.canDecide).map((row) => row.id)

  return (
    <Card className="p-0">
      <div className="flex flex-wrap items-center justify-between gap-2 p-4">
        <div>
          <h2 className="font-semibold text-text-default">{dataset.name}</h2>
          <p className="text-sm text-text-muted">{dataset.rows.length} submissions</p>
        </div>
        {decidable.length > 0 && (
          <Button size="sm" variant="secondary" type="button" onClick={() => onSelectAll(decidable)}>
            Select pending ({decidable.length})
          </Button>
        )}
      </div>
      <div className="overflow-x-auto border-t border-border-default">
        <table className="w-full text-sm">
          <caption className="sr-only">{dataset.name} values</caption>
          <thead>
            <tr className="text-left text-xs text-text-muted">
              <th className="w-10 px-3 py-2" />
              <th className="px-3 py-2 font-medium">Institution</th>
              <th className="px-3 py-2 font-medium">Period</th>
              {dataset.columns.map((column) => (
                <th key={column.id} className="px-3 py-2 text-right font-medium">
                  {column.name}
                  {column.unit ? <span className="block font-normal">{column.unit}</span> : null}
                </th>
              ))}
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {dataset.rows.map((row) => (
              <tr key={row.id}>
                <td className="px-3 py-2">
                  {row.canDecide && (
                    <input
                      aria-label={`Select ${row.institution} ${row.period}`}
                      checked={selected.has(row.id)}
                      className="size-4"
                      onChange={() => onToggle(row.id)}
                      type="checkbox"
                    />
                  )}
                </td>
                <td className="px-3 py-2 font-medium">{row.institution}</td>
                <td className="px-3 py-2">{row.period}</td>
                {dataset.columns.map((column) => {
                  const value = row.values[column.id]
                  return (
                    <td key={column.id} className="px-3 py-2 text-right tabular-nums">
                      {value === undefined ? '-' : value.toLocaleString()}
                    </td>
                  )
                })}
                <td className="px-3 py-2"><WorkflowStatusBadge status={row.status} /></td>
                <td className="px-3 py-2 text-right">
                  <Button asChild size="sm" variant="ghost">
                    <Link to={`/data-submissions/validation/${row.id}`}><ClipboardCheck />Review</Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
