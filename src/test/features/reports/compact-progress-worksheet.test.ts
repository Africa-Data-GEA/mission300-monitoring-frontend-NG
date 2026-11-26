// @vitest-environment node
import ExcelJS from 'exceljs'
import { describe, expect, it } from 'vitest'
import type { ReformAction } from '@/api/schemas/reform-actions'
import {
  fillCompactProgressTargets,
  type TargetProfile,
} from '@/features/reports/lib/fill-compact-progress-targets'
import { fillCompactProgressWorksheet } from '@/features/reports/lib/fill-compact-progress-worksheet'

const action: ReformAction = {
  id: 'reform-action-generation-network-01',
  pillar: 'generation-network',
  commitment: 'Integrated least-cost power system planning',
  action:
    'Finalize and adopt the comprehensive Power System Master Plan (PSMP)/Integrated Resource Plan',
  isPriority: false,
  programme: null,
  leadInstitution: 'CDMU',
  referenceDueDate: '2026-07-31',
  dueDate: '2027-07-31',
  completedAt: '2026-11-01',
  status: 'completed',
  previousStatus: 'in-progress-on-track',
  comment: 'Adopted in November.',
  updatedAt: '2026-11-02T00:00:00.000Z',
}

/** A stand-in with the official worksheet's shape; the real one is not in the repository. */
function template() {
  const workbook = new ExcelJS.Workbook()
  workbook.addWorksheet('README')
  const sheet = workbook.addWorksheet('Nigeria Actions')
  sheet.getRow(1).getCell(7).value = 'Action'
  const row = sheet.getRow(3)
  row.getCell(7).value = action.action
  row.getCell(8).value = 'No'
  row.getCell(12).value = 'Delayed'
  row.getCell(13).value = 'On Track'
  return workbook
}

describe('Compact Progress Report worksheet', () => {
  it('updates the row of a listed action', () => {
    const workbook = template()
    const sheet = workbook.getWorksheet('Nigeria Actions')!
    const row = sheet.getRow(3)
    const rowCount = sheet.rowCount

    fillCompactProgressWorksheet(workbook, [action], {
      period: 'q4-2025',
      periodLabel: 'Q4 2025',
      asOfDate: '2026-11-26',
    })

    expect(workbook.getWorksheet('README')!.getCell('B3').text).toBe('Last update: 26/11/2026')
    expect(row.getCell(12).text).toBe('On Track')
    expect(row.getCell(13).text).toBe('Completed')
    expect(row.getCell(16).text).toBe('Adopted in November.')
    expect(row.getCell(11).value).toEqual(new Date('2026-11-01T00:00:00Z'))
    expect(sheet.rowCount).toBe(rowCount)
  })

  it('appends an action the worksheet does not list', () => {
    const workbook = template()
    const sheet = workbook.getWorksheet('Nigeria Actions')!
    const rowCount = sheet.rowCount

    fillCompactProgressWorksheet(workbook, [{ ...action, action: 'A newly recorded action' }])

    expect(sheet.rowCount).toBe(rowCount + 1)
    expect(sheet.getRow(rowCount + 1).getCell(7).text).toBe('A newly recorded action')
  })
})

describe('Compact Progress Report worksheet, removed actions and targets', () => {
  it('hides a listed action the platform no longer holds', () => {
    const workbook = template()
    const sheet = workbook.getWorksheet('Nigeria Actions')!

    fillCompactProgressWorksheet(workbook, [{ ...action, action: 'A newly recorded action' }])

    expect(sheet.getRow(3).hidden).toBe(true)
    expect(sheet.getRow(3).getCell(7).value).toBeNull()
  })

  it('takes every target and actual from the platform', () => {
    const workbook = new ExcelJS.Workbook()
    const sheet = workbook.addWorksheet('Nigeria Targets')
    const labels: Record<number, string> = {
      3: 'Target: Electricity access',
      5: 'Actual # of people provided with electricity access',
      10: 'Target: Clean cooking',
      11: 'Actual clean cooking',
      14: 'Target: renewable energy',
      15: 'Actual share of renewable energy',
      18: 'Target: private capital',
      19: 'Actual private capital',
    }
    for (const [row, label] of Object.entries(labels)) sheet.getRow(Number(row)).getCell(5).value = label
    sheet.getCell('F7').value = 5.6
    sheet.getCell('H15').value = 0.261
    sheet.getCell('H19').value = 999

    const empty: TargetProfile = { baseline: null, target: null, targets: [], annualValues: [] }
    fillCompactProgressTargets(workbook, {
      electricity: { ...empty, annualValues: [{ period: '2026', value: 154400000 }] },
      cooking: empty,
      renewables: {
        baseline: 26,
        target: 50,
        targets: [{ period: '2026', value: 34, label: '34% by 2026' }],
        annualValues: [{ period: '2026', value: 34 }],
      },
      capital: empty,
    })

    expect(sheet.getCell('H14').value).toBe(0.34)
    expect(sheet.getCell('F15').value).toBe(0.26)
    expect(sheet.getCell('H15').value).toBe(0.34)
    expect(sheet.getCell('M14').value).toBe(0.5)
    expect(sheet.getCell('H5').value).toBe(154400000)
    expect(sheet.getCell('H6').value).toBe(27571429)
    expect(sheet.getCell('H19').value).toBeNull()
  })
})
