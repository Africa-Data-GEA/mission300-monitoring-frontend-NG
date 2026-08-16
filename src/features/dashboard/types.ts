/**
 * Executive Overview types.
 *
 * These are inferred from the zod schemas in src/api/schemas — the schema is
 * the single source of truth for the contract, so there is no hand-written
 * interface here that could drift from what is validated at runtime.
 *
 * See src/api/schemas/executive-overview.ts.
 */
export type {
  AccessChannel,
  AccessRateCard,
  Bottleneck,
  BottleneckSeverity,
  BulletMetric,
  CprTarget,
  DeliveryStatusPanel,
  CompactOutcomeCard,
  ExecutiveOverview,
  ExecutiveOverviewQuery,
  GenerationCapacityCard,
  HeadlineCards,
  OngoingProject,
  OutcomeMilestone,
  ProjectStatusSummary,
} from '@/api/schemas/executive-overview'
