import { kpiProfileSchema } from '@/api/schemas/kpi-explorer'
import { reformActionsOverviewSchema } from '@/api/schemas/reform-actions'
import { api } from '@/lib/api-client'
import type { CompactReportParameters } from './compact-report-parameters'
import {
  fillCompactProgressTargets,
  TARGET_KPI_CODES,
  type TargetProfiles,
} from './fill-compact-progress-targets'
import { fillCompactProgressWorksheet } from './fill-compact-progress-worksheet'

const TEMPLATE_PATH = '/reports/compact-progress-worksheet-template'
const REFORM_PAGE_SIZE = 200

async function loadTargetProfiles(): Promise<TargetProfiles> {
  const entries = await Promise.all(
    Object.entries(TARGET_KPI_CODES).map(async ([key, code]) => [
      key,
      await api.get(`/kpi-explorer/kpis/${code}`, kpiProfileSchema),
    ]),
  )
  return Object.fromEntries(entries) as TargetProfiles
}

/**
 * The Compact Progress Report as Excel: the official CDMU worksheet (its
 * sheets, design and drop-down lists) filled with the platform's reform actions,
 * targets and actual figures.
 *
 * The template carries internal CDMU comments, so it is fetched from the backend
 * behind sign-in and never shipped with the frontend.
 */
export async function buildCompactProgressWorksheet(
  parameters?: CompactReportParameters,
): Promise<Blob> {
  const [{ default: ExcelJS }, template, reforms, profiles] = await Promise.all([
    import('exceljs'),
    api.download(TEMPLATE_PATH),
    api.get(`/reform-actions?page=1&pageSize=${REFORM_PAGE_SIZE}`, reformActionsOverviewSchema),
    loadTargetProfiles(),
  ])

  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(await template.arrayBuffer())
  fillCompactProgressWorksheet(workbook, reforms.actions.items, parameters)
  fillCompactProgressTargets(workbook, profiles)

  const buffer = await workbook.xlsx.writeBuffer()
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  })
}
