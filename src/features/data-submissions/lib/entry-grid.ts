export interface EntryGridRow {
  key: string
  period: string
  institution: string
  values: Record<string, string>
}

let counter = 0

export function newGridRow(period: string, institution = ''): EntryGridRow {
  counter += 1
  return { key: `row-${counter}`, period, institution, values: {} }
}

export function gridPayload(rows: readonly EntryGridRow[], consolidated: boolean) {
  return rows.map((row) => ({
    period: row.period,
    ...(consolidated ? { institution: row.institution } : {}),
    values: row.values,
  }))
}

export function rowsMissingChoices(rows: readonly EntryGridRow[], consolidated: boolean): string | null {
  if (rows.length === 0) return 'Add at least one row.'
  const unfinished = rows.findIndex((row) => !row.period || (consolidated && !row.institution))
  if (unfinished === -1) return null
  return `Row ${unfinished + 1}: choose ${consolidated ? 'the DisCo and the period' : 'the period'}.`
}
