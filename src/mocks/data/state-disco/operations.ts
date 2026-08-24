import type {
  DeliveryRow,
  UtilityOperationsRow,
} from '@/api/schemas/state-disco'

export const utilityOperationsRows: UtilityOperationsRow[] = [
  {
    id: 'ikeja', utility: 'Ikeja DisCo', effectiveOrder: 'MYTO 2025 — effective 1 July 2025',
    bands: [
      { band: 'A', supplyHours: '22.1 h/day', tariff: '₦209.50/kWh', intensityPercent: 92 },
      { band: 'B', supplyHours: '16.4 h/day', tariff: '₦68.20/kWh', intensityPercent: 68 },
      { band: 'C', supplyHours: '12.1 h/day', tariff: '₦56.10/kWh', intensityPercent: 50 },
      { band: 'D', supplyHours: '8.3 h/day', tariff: '₦43.40/kWh', intensityPercent: 35 },
      { band: 'E', supplyHours: '4.2 h/day', tariff: '₦32.10/kWh', intensityPercent: 18 },
    ],
  },
  {
    id: 'kano', utility: 'Kano DisCo', effectiveOrder: 'MYTO 2025 — effective 1 July 2025',
    bands: [
      { band: 'A', supplyHours: '20.3 h/day', tariff: '₦206.80/kWh', intensityPercent: 85 },
      { band: 'B', supplyHours: '14.2 h/day', tariff: '₦66.40/kWh', intensityPercent: 59 },
      { band: 'C', supplyHours: '10.0 h/day', tariff: '₦54.80/kWh', intensityPercent: 42 },
      { band: 'D', supplyHours: '6.4 h/day', tariff: '₦41.90/kWh', intensityPercent: 27 },
      { band: 'E', supplyHours: '3.1 h/day', tariff: '₦30.70/kWh', intensityPercent: 13 },
    ],
  },
]

export const utilityDeliveryRows: DeliveryRow[] = [
  {
    id: 'del-001', utility: 'Ikeja DisCo', milestone: 'Deploy 170,000 additional meters',
    serviceBand: 'A', dueDate: '2025-12-31T00:00:00Z',
    dueDateLabel: '31 Dec 2025', executionStatus: 'On track', achievedLabel: '112,400 installed',
    evidenceLabel: 'Monthly metering return', reportingCompliance: 'Complete',
    bottleneck: 'Port clearance delays for meter components',
  },
  {
    id: 'del-002', utility: 'Kano DisCo', milestone: 'Reduce feeder technical losses',
    serviceBand: 'C', dueDate: '2025-09-30T00:00:00Z',
    dueDateLabel: '30 Sep 2025', executionStatus: 'Delayed', achievedLabel: '4 of 9 feeders completed',
    evidenceLabel: 'PIP progress report', reportingCompliance: 'Late',
    bottleneck: 'Contractor mobilization and transformer availability',
  },
  /* Additional bands so the Service band filter has more than one value to
   * resolve to — with only bands A and C present the control could not be
   * meaningfully exercised. */
  {
    id: 'del-003', utility: 'Abuja DisCo', milestone: 'Upgrade 33kV injection substations',
    serviceBand: 'B', dueDate: '2026-03-31T00:00:00Z',
    dueDateLabel: '31 Mar 2026', executionStatus: 'On track', achievedLabel: '6 of 11 substations energised',
    evidenceLabel: 'Quarterly capital works return', reportingCompliance: 'Complete',
    bottleneck: '',
  },
  {
    id: 'del-004', utility: 'Ibadan DisCo', milestone: 'Extend Band D feeder supply hours',
    serviceBand: 'D', dueDate: '2026-06-30T00:00:00Z',
    dueDateLabel: '30 Jun 2026', executionStatus: 'At risk', achievedLabel: '9.2 of 12 target hours',
    evidenceLabel: 'Monthly supply-hours return', reportingCompliance: 'Late',
    bottleneck: 'Gas supply constraints limiting available generation',
  },
  {
    id: 'del-005', utility: 'Jos DisCo', milestone: 'Rural Band E network densification',
    serviceBand: 'E', dueDate: '2026-01-31T00:00:00Z',
    dueDateLabel: '31 Jan 2026', executionStatus: 'Delayed', achievedLabel: '3 of 14 communities connected',
    evidenceLabel: 'Rural electrification progress report', reportingCompliance: 'Outstanding',
    bottleneck: 'Right-of-way disputes across two local government areas',
  },
]
