import type { Workbook, Worksheet } from 'exceljs'
import type { KpiProfile } from '@/api/schemas/kpi-explorer'

export const TARGET_KPI_CODES = {
  electricity: 'M300-P2-024',
  cooking: 'M300-P2-008',
  renewables: 'M300-P1-004',
  capital: 'M300-P4-002',
} as const

export type TargetProfile = Pick<KpiProfile, 'baseline' | 'target' | 'targets' | 'annualValues'>

export type TargetProfiles = Record<keyof typeof TARGET_KPI_CODES, TargetProfile>

const LABEL_COLUMN = 5
const BASELINE_COLUMN = 6
const END_VALUE_COLUMN = 13
const YEAR_COLUMNS = { '2025': 7, '2026': 8, '2027': 9, '2028': 10, '2029': 11, '2030': 12 }
const HOUSEHOLD_ROW = 6
const COEFFICIENT_ROW = 7

const SECTIONS = [
  { key: 'electricity', targetRow: 3, actualRow: 5, label: /electricity/i, scale: 1, hasEndValue: false },
  { key: 'cooking', targetRow: 10, actualRow: 11, label: /clean cooking/i, scale: 0.01, hasEndValue: true },
  { key: 'renewables', targetRow: 14, actualRow: 15, label: /renewable/i, scale: 0.01, hasEndValue: true },
  { key: 'capital', targetRow: 18, actualRow: 19, label: /private capital/i, scale: 1, hasEndValue: true },
] as const

const scaled = (value: number | null | undefined, scale: number) =>
  value === null || value === undefined ? null : Number((value * scale).toFixed(6))

function checkLayout(sheet: Worksheet) {
  for (const section of SECTIONS) {
    for (const row of [section.targetRow, section.actualRow]) {
      if (!section.label.test(sheet.getRow(row).getCell(LABEL_COLUMN).text)) {
        throw new Error(`The worksheet's "Nigeria Targets" sheet has changed at row ${row}.`)
      }
    }
  }
}

export function fillCompactProgressTargets(workbook: Workbook, profiles: TargetProfiles) {
  const sheet = workbook.getWorksheet('Nigeria Targets')
  if (!sheet) throw new Error('The worksheet template has no "Nigeria Targets" sheet.')
  checkLayout(sheet)
  if (Object.values(profiles).some((profile) => !profile.annualValues)) {
    throw new Error('The server has not been updated to supply yearly figures yet.')
  }

  for (const { key, targetRow, actualRow, scale, hasEndValue } of SECTIONS) {
    const profile = profiles[key]
    const targets = sheet.getRow(targetRow)
    const actuals = sheet.getRow(actualRow)

    actuals.getCell(BASELINE_COLUMN).value = scaled(profile.baseline, scale)
    for (const [year, column] of Object.entries(YEAR_COLUMNS)) {
      const target = profile.targets.find((point) => point.period === year)
      const actual = profile.annualValues!.find((point) => point.period === year)
      targets.getCell(column).value = scaled(target?.value, scale)
      actuals.getCell(column).value = scaled(actual?.value, scale)
    }
    if (hasEndValue) targets.getCell(END_VALUE_COLUMN).value = scaled(profile.target, scale)
  }

  const people = sheet.getRow(5)
  const coefficients = sheet.getRow(COEFFICIENT_ROW)
  for (const column of [BASELINE_COLUMN, ...Object.values(YEAR_COLUMNS)]) {
    const count = people.getCell(column).value
    const coefficient =
      Number(coefficients.getCell(column).value) || Number(coefficients.getCell(BASELINE_COLUMN).value)
    sheet.getRow(HOUSEHOLD_ROW).getCell(column).value =
      typeof count === 'number' && coefficient ? Math.round(count / coefficient) : null
  }

  workbook.calcProperties.fullCalcOnLoad = true
}
