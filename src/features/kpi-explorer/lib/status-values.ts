/** Mirrors the backend's status scale (src/common/kpi/status-values.ts). */
export const STATUS_UNITS: ReadonlySet<string> = new Set(['status', 'stage', 'Yes/No', 'Date / status'])

export const STATUS_LEVELS = [
  { value: 0, label: 'Not yet achieved' },
  { value: 1, label: 'In progress' },
  { value: 2, label: 'Achieved' },
] as const

export function isStatusUnit(unit: string): boolean {
  return STATUS_UNITS.has(unit)
}
