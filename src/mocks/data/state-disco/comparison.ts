import type { DiscoComparisonRow } from '@/api/schemas/state-disco'

export const discoComparisonRows: DiscoComparisonRow[] = [
  {
    id: 'ikeja', name: 'Ikeja DisCo', rankLabel: '1 of 11',
    activeCustomers: '1.31m', meteredCustomers: '1.02m', unmeteredCustomers: '290k', meteringRate: '77.86%',
    energyReceived: '1,245 GWh', energyBilled: '1,061 GWh', billingEfficiency: '85.22%',
    energyReceivedBarPercent: 100, energyBilledBarPercent: 85.22,
    revenueBilled: '₦92.4bn', revenueCollected: '₦83.7bn', collectionEfficiency: '90.58%',
    revenueBilledBarPercent: 100, revenueCollectedBarPercent: 90.58,
    remittancePerformance: '98.4%', validationLabel: 'Confirmed',
  },
  {
    id: 'eko', name: 'Eko DisCo', rankLabel: '2 of 11',
    activeCustomers: '0.74m', meteredCustomers: '0.51m', unmeteredCustomers: '230k', meteringRate: '68.92%',
    energyReceived: '1,088 GWh', energyBilled: '888 GWh', billingEfficiency: '81.62%',
    energyReceivedBarPercent: 87.4, energyBilledBarPercent: 71.3,
    revenueBilled: '₦81.7bn', revenueCollected: '₦70.2bn', collectionEfficiency: '85.92%',
    revenueBilledBarPercent: 88.4, revenueCollectedBarPercent: 76,
    remittancePerformance: '96.7%', validationLabel: 'Confirmed',
  },
  {
    id: 'kano', name: 'Kano DisCo', rankLabel: '9 of 11',
    activeCustomers: '0.71m', meteredCustomers: '0.29m', unmeteredCustomers: '420k', meteringRate: '40.85%',
    energyReceived: '565 GWh', energyBilled: '382 GWh', billingEfficiency: '67.61%',
    energyReceivedBarPercent: 45.4, energyBilledBarPercent: 30.7,
    revenueBilled: '₦31.6bn', revenueCollected: '₦20.4bn', collectionEfficiency: '64.56%',
    revenueBilledBarPercent: 34.2, revenueCollectedBarPercent: 22.1,
    remittancePerformance: '72.1%', validationLabel: 'Confirmed',
  },
]
