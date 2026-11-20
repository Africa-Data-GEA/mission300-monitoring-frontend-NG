import { Link } from 'react-router'
import { Card } from '@/components/ui/card'
import { decidableIdsOf, summarizeRowStatus, type UploadMatrix } from '../lib/upload-matrix'

export function UploadMatrixTable({
  matrix,
  selected,
  onToggle,
}: {
  matrix: UploadMatrix
  selected: ReadonlySet<string>
  onToggle: (ids: string[]) => void
}) {
  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <caption className="sr-only">Everything in this upload</caption>
          <thead>
            <tr className="border-b border-border-default text-left text-xs text-text-muted">
              <th className="w-10 px-3 py-2" rowSpan={2} />
              <th className="px-3 py-2 font-medium" rowSpan={2}>Institution</th>
              <th className="px-3 py-2 font-medium" rowSpan={2}>Period</th>
              {matrix.groups.map((group) => (
                <th
                  key={group.name}
                  className="border-l border-border-default px-3 py-2 text-center font-semibold text-text-default"
                  colSpan={Math.max(group.columns.length, 1)}
                >
                  {group.name}
                </th>
              ))}
              <th className="border-l border-border-default px-3 py-2 font-medium" rowSpan={2}>Status</th>
            </tr>
            <tr className="border-b border-border-default text-left text-xs text-text-muted">
              {matrix.groups.flatMap((group) =>
                (group.columns.length ? group.columns : [{ id: 'none', name: '', unit: '' }]).map((column, index) => (
                  <th
                    key={`${group.name}-${column.id}`}
                    className={`px-3 py-2 text-right font-medium ${index === 0 ? 'border-l border-border-default' : ''}`}
                  >
                    {column.name}
                    {column.unit ? <span className="block font-normal">{column.unit}</span> : null}
                  </th>
                )),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-default">
            {matrix.rows.map((row) => {
              const ids = decidableIdsOf(row)
              const status = summarizeRowStatus(row)
              return (
                <tr key={row.key}>
                  <td className="px-3 py-2">
                    {ids.length > 0 && (
                      <input
                        aria-label={`Select ${row.institution} ${row.period}`}
                        checked={ids.every((id) => selected.has(id))}
                        className="size-4"
                        onChange={() => onToggle(ids)}
                        type="checkbox"
                      />
                    )}
                  </td>
                  <td className="px-3 py-2 font-medium">{row.institution}</td>
                  <td className="px-3 py-2">{row.period}</td>
                  {matrix.groups.flatMap((group) => {
                    const cell = row.cells[group.name]
                    const columns = group.columns.length ? group.columns : [{ id: 'none', name: '', unit: '' }]
                    return columns.map((column, index) => {
                      const value = cell?.values[column.id]
                      return (
                        <td
                          key={`${group.name}-${column.id}`}
                          className={`px-3 py-2 text-right tabular-nums ${index === 0 ? 'border-l border-border-default' : ''}`}
                        >
                          {cell && value !== undefined ? (
                            <Link
                              className="hover:underline"
                              title="Open this submission"
                              to={`/data-submissions/validation/${cell.id}`}
                            >
                              {value.toLocaleString()}
                            </Link>
                          ) : (
                            <span className="text-text-muted">-</span>
                          )}
                        </td>
                      )
                    })
                  })}
                  <td className="border-l border-border-default px-3 py-2 text-xs">{status.label}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
