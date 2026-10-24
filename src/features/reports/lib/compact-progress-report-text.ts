import type { CompactProgressReportData } from './compact-progress-report-data'

export function shortLabel(label: string): string {
  return label.replace(/\s*\([^)]*\)/g, '').replace(/\s+%/, '%').trim()
}

function actionCount(count: number): string {
  return `${count} ${count === 1 ? 'action is' : 'actions are'}`
}

function countOf(rows: readonly { status: string; count: number }[], status: string): number {
  return rows.find((row) => row.status === status)?.count ?? 0
}

export function keyTargetParagraphs(data: CompactProgressReportData): string[] {
  const [people, cooking, renewables, capital] = data.keyTargets
  const paragraphs = [`The reporting period covers progress until ${data.generatedAtLabel}.`]
  if (people) {
    paragraphs.push(
      `${data.countryName} has provided electricity access to ${shortLabel(people.currentLabel)} people, against a baseline of ${shortLabel(people.baselineLabel)} and a target of ${shortLabel(people.targetLabel)}.`,
    )
  }
  if (cooking) {
    paragraphs.push(
      `Clean cooking access stands at ${shortLabel(cooking.currentLabel)}, up from the baseline of ${shortLabel(cooking.baselineLabel)}, with a target of ${shortLabel(cooking.targetLabel)}.`,
    )
  }
  if (renewables) {
    paragraphs.push(
      `Renewable energy accounts for ${shortLabel(renewables.currentLabel)} of national electricity generation, against a baseline of ${shortLabel(renewables.baselineLabel)} and a target of ${shortLabel(renewables.targetLabel)}.`,
    )
  }
  if (capital) {
    paragraphs.push(
      capital.currentLabel === 'No data provided yet'
        ? `Private capital mobilized: no progress data has been provided yet. ${shortLabel(capital.targetLabel)}.`
        : `Private capital mobilized stands at ${shortLabel(capital.currentLabel)}. ${shortLabel(capital.targetLabel)}.`,
    )
  }
  return paragraphs
}

export function actionsParagraphs(data: CompactProgressReportData): string[] {
  const priority = data.statusByPriority.priority
  const completed = countOf(data.statusTotals, 'completed')
  const delayed = countOf(data.statusTotals, 'delayed')
  const open = countOf(data.statusTotals, 'in-progress')
  const byPillar = data.statusByPillar
    .filter((row) => row.total > 0)
    .map((row) => `${row.pillarLabel} - ${row.total} (${row.priorityCount} priority)`)
    .join('; ')
  return [
    `${data.countryName}'s National Energy Compact tracks ${data.totalActions} reform actions, of which ${data.totalPriorityActions} are Priority actions subject to enhanced monitoring, while all remaining actions continue to be tracked by the CDMU.`,
    byPillar ? `By pillar, the distribution is as follows: ${byPillar}.` : 'No actions are currently recorded against a pillar.',
    `In terms of status, as of ${data.generatedAtLabel}, ${actionCount(completed)} completed, ${open} in progress and ${delayed} reported as delayed, including ${countOf(priority, 'delayed')} priority.`,
  ]
}
