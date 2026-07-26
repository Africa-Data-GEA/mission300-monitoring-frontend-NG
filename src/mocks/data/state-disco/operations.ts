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
    dueDateLabel: '31 Dec 2025', executionStatus: 'On track', achievedLabel: '112,400 installed',
    evidenceLabel: 'Monthly metering return', reportingCompliance: 'Complete',
    bottleneck: 'Port clearance delays for meter components',
  },
  {
    id: 'del-002', utility: 'Kano DisCo', milestone: 'Reduce feeder technical losses',
    dueDateLabel: '30 Sep 2025', executionStatus: 'Delayed', achievedLabel: '4 of 9 feeders completed',
    evidenceLabel: 'PIP progress report', reportingCompliance: 'Late',
    bottleneck: 'Contractor mobilization and transformer availability',
  },
]
