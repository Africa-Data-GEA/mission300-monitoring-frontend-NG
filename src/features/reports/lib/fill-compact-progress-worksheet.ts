import type { Workbook, Worksheet } from 'exceljs'
import type { ReformAction, ReformStatus } from '@/api/schemas/reform-actions'
import type { CompactReportParameters } from './compact-report-parameters'

/** Columns of the "Nigeria Actions" sheet. */
const COLUMN = {
  serial: 5,
  action: 7,
  priority: 8,
  referenceDate: 9,
  adjustedDate: 10,
  completedDate: 11,
  previousStatus: 12,
  currentStatus: 13,
  lastUpdate: 14,
  comment: 16,
} as const

const FIRST_ACTION_ROW = 3

/** The worksheet's own default font. ExcelJS would otherwise save unstyled cells as Calibri. */
const DEFAULT_FONT = { name: 'Aptos Narrow', size: 11 }

/** The wording of the worksheet's own drop-down lists, trailing space included. */
const SHEET_STATUS: Record<ReformStatus, string> = {
  'not-yet-due': 'Not Yet Due',
  'in-progress-on-track': 'In Progress-On Track',
  'in-progress-minor-delays': 'In Progress-Minor Delays',
  'in-progress-at-risk': 'In Progress-At Risk ',
  delayed: 'Delayed',
  completed: 'Completed',
}

/** Non-priority actions use the shorter list, where on-track work reads "On Track". */
function statusLabel(status: ReformStatus, isPriority: boolean): string {
  if (!isPriority && status === 'in-progress-on-track') return 'On Track'
  return SHEET_STATUS[status]
}

const key = (text: string) => text.toLowerCase().replace(/[^a-z0-9]/g, '')

const day = (date: string) => date.slice(0, 10)

function cellDay(value: unknown): string {
  return value instanceof Date ? value.toISOString().slice(0, 10) : String(value ?? '').slice(0, 10)
}

const toDate = (date: string) => new Date(`${day(date)}T00:00:00Z`)

function writeAction(sheet: Worksheet, rowNumber: number, action: ReformAction) {
  const row = sheet.getRow(rowNumber)
  let changed = false

  function set(column: number, value: string | Date) {
    row.getCell(column).value = value
    changed = true
  }

  const priority = action.isPriority ? 'Yes' : 'No'
  if (row.getCell(COLUMN.priority).text !== priority) set(COLUMN.priority, priority)

  for (const [column, status] of [
    [COLUMN.previousStatus, action.previousStatus],
    [COLUMN.currentStatus, action.status],
  ] as const) {
    if (!status) continue
    const written = key(row.getCell(column).text)
    const matches =
      written === key(statusLabel(status, action.isPriority)) || written === key(SHEET_STATUS[status])
    if (!matches) set(column, statusLabel(status, action.isPriority))
  }

  const sheetDue = cellDay(
    row.getCell(COLUMN.adjustedDate).value ?? row.getCell(COLUMN.referenceDate).value,
  )
  if (action.dueDate && day(action.dueDate) !== sheetDue) {
    set(COLUMN.adjustedDate, toDate(action.dueDate))
  }
  if (
    action.completedAt &&
    day(action.completedAt) !== cellDay(row.getCell(COLUMN.completedDate).value)
  ) {
    set(COLUMN.completedDate, toDate(action.completedAt))
  }
  if (action.comment && key(action.comment) !== key(row.getCell(COLUMN.comment).text)) {
    // A comment equal to the previous report's one is already on the sheet.
    if (key(action.comment) !== key(row.getCell(COLUMN.comment - 1).text)) {
      set(COLUMN.comment, action.comment)
    }
  }

  if (changed) row.getCell(COLUMN.lastUpdate).value = toDate(action.updatedAt)
}

/** Adds an action the official worksheet does not list yet, styled like its last row. */
function appendAction(sheet: Worksheet, templateRow: number, action: ReformAction) {
  const rowNumber = sheet.rowCount + 1
  const source = sheet.getRow(templateRow)
  const row = sheet.getRow(rowNumber)
  source.eachCell({ includeEmpty: true }, (cell, column) => {
    row.getCell(column).style = { ...cell.style }
  })
  row.height = source.height
  row.getCell(COLUMN.serial + 1).value = action.commitment
  row.getCell(COLUMN.action).value = action.action
  if (action.referenceDueDate) {
    row.getCell(COLUMN.referenceDate).value = toDate(action.referenceDueDate)
  }
  writeAction(sheet, rowNumber, action)
}

/**
 * Brings the official Compact Progress Report worksheet up to date with the
 * platform's reform actions. Only cells that differ are written, so the
 * worksheet's own wording, formulas and styling stay as the CDMU prepared them.
 */
export function fillCompactProgressWorksheet(
  workbook: Workbook,
  actions: readonly ReformAction[],
  parameters?: CompactReportParameters,
) {
  for (const sheet of workbook.worksheets) {
    sheet.eachRow({ includeEmpty: true }, (row) => {
      row.eachCell({ includeEmpty: true }, (cell) => {
        if (!cell.font) cell.style = { ...cell.style, font: DEFAULT_FONT }
      })
    })
  }

  const sheet = workbook.getWorksheet('Nigeria Actions')
  if (!sheet) throw new Error('The worksheet template has no "Nigeria Actions" sheet.')

  if (parameters) {
    const [year, month, date] = parameters.asOfDate.split('-')
    const readme = workbook.getWorksheet('README')
    if (readme) readme.getCell('B3').value = `Last update: ${date}/${month}/${year}`
  }

  const rows = new Map<string, number>()
  let lastActionRow = FIRST_ACTION_ROW
  for (let rowNumber = FIRST_ACTION_ROW; rowNumber <= sheet.rowCount; rowNumber += 1) {
    const text = key(sheet.getRow(rowNumber).getCell(COLUMN.action).text)
    if (!text) continue
    rows.set(text, rowNumber)
    lastActionRow = rowNumber
  }

  for (const action of actions) {
    const rowNumber = rows.get(key(action.action))
    if (rowNumber) writeAction(sheet, rowNumber, action)
    else appendAction(sheet, lastActionRow, action)
  }
}
