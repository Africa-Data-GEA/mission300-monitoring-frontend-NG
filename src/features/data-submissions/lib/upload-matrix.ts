import type { UploadBatch } from '@/api/schemas/data-submissions'

type Dataset = UploadBatch['datasets'][number]
type DatasetRow = Dataset['rows'][number]

export interface MatrixCell {
  id: string
  status: DatasetRow['status']
  canDecide: boolean
  values: Record<string, number>
}

export interface MatrixRow {
  key: string
  institution: string
  period: string
  cells: Record<string, MatrixCell | undefined>
}

export interface MatrixGroup {
  name: string
  columns: Dataset['columns']
  decidableIds: string[]
}

export interface UploadMatrix {
  groups: MatrixGroup[]
  rows: MatrixRow[]
  decidableIds: string[]
}

export function buildUploadMatrix(datasets: Dataset[]): UploadMatrix {
  const rows = new Map<string, MatrixRow>()
  const groups: MatrixGroup[] = datasets.map((dataset) => ({
    name: dataset.name,
    columns: dataset.columns,
    decidableIds: dataset.rows.filter((row) => row.canDecide).map((row) => row.id),
  }))

  for (const dataset of datasets) {
    for (const row of dataset.rows) {
      const key = `${row.institution}|${row.period}`
      const entry = rows.get(key) ?? { key, institution: row.institution, period: row.period, cells: {} }
      entry.cells[dataset.name] = { id: row.id, status: row.status, canDecide: row.canDecide, values: row.values }
      rows.set(key, entry)
    }
  }

  const ordered = [...rows.values()].sort(
    (a, b) => a.institution.localeCompare(b.institution) || a.period.localeCompare(b.period, undefined, { numeric: true }),
  )
  return { groups, rows: ordered, decidableIds: groups.flatMap((group) => group.decidableIds) }
}

export function decidableIdsOf(row: MatrixRow): string[] {
  return Object.values(row.cells).flatMap((cell) => (cell?.canDecide ? [cell.id] : []))
}

export function summarizeRowStatus(row: MatrixRow): { label: string; tone: string } {
  const labels = new Map<string, { label: string; tone: string; count: number }>()
  for (const cell of Object.values(row.cells)) {
    if (!cell) continue
    const entry = labels.get(cell.status.label) ?? { label: cell.status.label, tone: cell.status.tone, count: 0 }
    entry.count += 1
    labels.set(cell.status.label, entry)
  }
  const all = [...labels.values()]
  if (all.length === 1 && all[0]) return { label: all[0].label, tone: all[0].tone }
  return { label: all.map((entry) => `${entry.count} ${entry.label.toLowerCase()}`).join(' · '), tone: 'neutral' }
}
