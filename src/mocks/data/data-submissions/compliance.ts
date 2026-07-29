import type { DataGap, OverdueItem } from '@/api/schemas/data-submissions'
import { statuses } from './statuses'

export const overdueItems: OverdueItem[] = [
  {
    id: 'ovd-001', institution: 'Transmission Company of Nigeria',
    dataset: 'Generation availability', reportingPeriod: 'Q3 2026',
    dueDate: '2026-10-10T17:00:00Z', dueDateLabel: '10 Oct 2026',
    overdueLabel: '8 days overdue', owner: 'Funmilayo Adeyemi',
    status: statuses.overdue, availableActions: ['contact-owner', 'upload-template'],
  },
  {
    id: 'ovd-002', institution: 'Rural Electrification Agency',
    dataset: 'Mini-grid connections', reportingPeriod: 'August 2026',
    dueDate: '2026-09-07T17:00:00Z', dueDateLabel: '7 Sep 2026',
    overdueLabel: '41 days overdue', owner: 'Ibrahim Suleiman',
    status: statuses.missing, availableActions: ['contact-owner'],
  },
  {
    id: 'ovd-003', institution: 'NERC', dataset: 'Metering performance',
    reportingPeriod: 'Q3 2026', dueDate: '2026-10-15T17:00:00Z',
    dueDateLabel: '15 Oct 2026', overdueLabel: 'Due in 2 days',
    owner: 'Ngozi Okafor', status: statuses.due,
    availableActions: ['contact-owner', 'enter-data', 'upload-template'],
  },
]

export const dataGaps: DataGap[] = [
  {
    id: 'gap-001', kpiId: 'M300-RI-001', kpiName: 'Cross-border energy traded',
    pillar: 'Regional integration', institution: 'Transmission Company of Nigeria',
    reportingPeriod: 'Q3 2026', category: 'Missing source', readinessTier: 'Core',
    owner: 'System Operations', nextAction: 'Confirm the WAPP settlement source and reporting owner.',
    status: statuses.open, availableActions: ['contact-owner'],
  },
  {
    id: 'gap-002', kpiId: 'M300-LMA-004', kpiName: 'Electricity service quality tier',
    pillar: 'Last-mile access', institution: 'Federal Ministry of Power',
    reportingPeriod: '2026', category: 'Incomplete breakdown', readinessTier: 'Future',
    owner: 'Access Monitoring Team', nextAction: 'Extend survey coverage beyond the seven available states.',
    status: statuses.inProgress, availableActions: ['view'],
  },
  {
    id: 'gap-003', kpiId: 'M300-P3-004', kpiName: 'Metering Rate',
    pillar: 'Financially viable utilities', institution: 'NERC',
    reportingPeriod: 'Q3 2026', category: 'Failed validation', readinessTier: 'Core',
    owner: 'Ngozi Okafor', nextAction: 'Resolve the Kano DisCo registered-customer discrepancy.',
    status: statuses.open, availableActions: ['view', 'contact-owner'],
  },
]
