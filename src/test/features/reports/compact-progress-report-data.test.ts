import { describe, expect, it } from 'vitest'
import {
  buildCompactProgressReportData,
  type CompactProgressSource,
} from '@/features/reports/lib/compact-progress-report-data'
import { defaultCompactReportParameters } from '@/features/reports/lib/compact-report-parameters'

const card = (value: string, baselineLabel: string, targetLabel: string) => ({
  title: 't',
  icon: 'access',
  value,
  baselineLabel,
  targetLabel,
})

function source(overrides: Partial<CompactProgressSource> = {}): CompactProgressSource {
  return {
    overview: {
      lastUpdated: '2026-05-05T10:00:00.000Z',
      headlineCards: {
        peopleWithElectricityAccess: card('154.4M', '137.0M baseline', '236.7M by 2030'),
        cleanCookingAccess: card('29.0%', '25.6% baseline', '100% by 2030'),
      },
    } as unknown as CompactProgressSource['overview'],
    renewables: { baselineLabel: '26%', currentLabel: '26.1 %', targetLabel: '75% by 2030' },
    privateCapital: { baselineLabel: 'TBC', currentLabel: 'No current value', targetLabel: 'USD 15.5B by 2030' },
    actions: [
      { pillar: 'last-mile-access', status: 'in-progress-on-track', isPriority: true },
      { pillar: 'last-mile-access', status: 'delayed', isPriority: false },
      { pillar: 'clean-cooking', status: 'completed', isPriority: false },
    ],
    priorityActions: [
      {
        id: 'p1',
        pillar: 'last-mile-access',
        commitment: 'DARES',
        action: 'Roll out mini-grids',
        deadline: '2027-12-31T00:00:00.000Z',
        status: 'in-progress-on-track',
        previousStatus: null,
      },
    ],
    ...overrides,
  }
}

describe('buildCompactProgressReportData', () => {
  it('reports renewables as the share of generation', () => {
    const renewables = buildCompactProgressReportData(source()).keyTargets[2]!
    expect(renewables.label).toBe('Share of renewable energy in national generation')
    expect(renewables.currentLabel).toBe('26.1 %')
  })

  it('says no data was provided when private capital has no value', () => {
    const privateCapital = buildCompactProgressReportData(source()).keyTargets[3]!
    expect(privateCapital.currentLabel).toBe('No data provided yet')
  })

  it('counts every action and the priority ones', () => {
    const data = buildCompactProgressReportData(source())
    expect(data.totalActions).toBe(3)
    expect(data.totalPriorityActions).toBe(1)
    expect(data.statusTotals.find((row) => row.status === 'delayed')?.count).toBe(1)
    expect(data.statusTotals.find((row) => row.status === 'in-progress')?.count).toBe(1)
    expect(data.statusTotals.find((row) => row.status === 'completed')?.count).toBe(1)
    expect(data.statusByPriority.priority.find((row) => row.status === 'in-progress')?.count).toBe(1)
  })

  it('has no previous status to show where none is recorded', () => {
    expect(buildCompactProgressReportData(source()).priorityActions[0]!.previousStatusLabel).toBe('N/A')
  })

  it('words a priority action by its reform status', () => {
    const action = buildCompactProgressReportData(source()).priorityActions[0]!
    expect(action.currentStatusLabel).toBe('In progress, on track')
    expect(action.deadlineLabel).toBe('31 Dec 2027')
  })

  it('carries the chosen reporting parameters onto the cover', () => {
    const parameters = {
      ...defaultCompactReportParameters([{ value: 'q1-2026', label: 'Q1 2026' }]),
      cycle: 'Second',
      dataYear: '2025',
      reportMonth: '2026-04',
      asOfDate: '2026-05-05',
    }
    const data = buildCompactProgressReportData(source(), 'Nigeria', parameters)
    expect(data.reportingPeriod).toBe('Q1 2026')
    expect(data.cycleLabel).toBe('Second cycle of data collection 2025')
    expect(data.reportDateLabel).toBe('April 2026')
    expect(data.generatedAtLabel).toBe('05 May 2026')
  })
})
