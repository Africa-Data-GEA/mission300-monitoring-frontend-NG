import {
  BarChart3,
  Building2,
  ClipboardList,
  Database,
  FileBarChart,
  Home,
  LayoutGrid,
  MapPin,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'
import type { PillarId } from '@/api/schemas/common'
import { PILLARS, PILLAR_LABELS } from '@/types/domain'

/**
 * Which Compact pillar dashboards are ready to show, shared between the
 * sidebar dropdown and the pillar picker page so the two never disagree.
 * Generation & network and Last-mile access are built out with real
 * analysis; the remaining four are disabled until the same treatment lands.
 */
export const READY_PILLARS: ReadonlySet<PillarId> = new Set<PillarId>([
  'generation-network',
  'last-mile-access',
])

/**
 * Sidebar navigation, transcribed from the approved wireframe.
 *
 * Routes that are not yet built are marked `ready: false` — they render as
 * disabled so the information architecture is visible and reviewable without
 * pretending the pages exist. Flip the flag when a page ships.
 *
 * The wireframe originally listed "Implementation register" and
 * "Bottlenecks & exceptions" as their own top-level items. Both have since
 * been consolidated into Programs, which now covers programmes, their
 * projects, and each project's bottlenecks and milestones as drill-down
 * levels rather than separate pages — so neither has its own nav entry.
 *
 * KPI explorer sits in its own "Analytics" group near the bottom rather than
 * inside Monitoring & Analysis: stakeholder feedback was that it is a
 * reference catalogue, not a primary page, and reads as more important than
 * it is when placed near the top next to Executive Overview.
 */
export interface NavItem {
  readonly label: string
  readonly to: string
  readonly icon: LucideIcon
  readonly ready: boolean
  readonly children?: readonly { readonly label: string; readonly to: string; readonly ready: boolean }[]
  /** Stable key role-based access is checked against — see role-access.ts. Independent of `label`, which can be renamed freely. */
  readonly moduleKey: string
}

export interface NavGroup {
  readonly label: string
  readonly items: readonly NavItem[]
}

export const NAVIGATION: readonly NavGroup[] = [
  {
    label: 'Monitoring & Analysis',
    items: [
      { label: 'Executive Overview', to: '/dashboard', icon: Home, ready: true, moduleKey: 'executive-overview' },
      {
        label: 'Pillar dashboards',
        to: '/pillars',
        icon: BarChart3,
        ready: true,
        moduleKey: 'pillar-dashboards',
        children: PILLARS.map((pillar) => ({
          label: PILLAR_LABELS[pillar],
          to: `/pillars/${pillar}`,
          ready: READY_PILLARS.has(pillar),
        })),
      },
      {
        label: 'State & DisCo',
        to: '/state-disco',
        icon: MapPin,
        ready: true,
        moduleKey: 'state-disco',
      },
    ],
  },
  {
    label: 'Delivery tracking',
    items: [
      { label: 'Programs', to: '/programs', icon: ClipboardList, ready: true, moduleKey: 'programs' },
    ],
  },
  {
    label: 'Data operations',
    items: [
      {
        label: 'Data submissions',
        to: '/data-submissions',
        icon: Database,
        ready: true,
        moduleKey: 'data-submissions',
      },
      {
        label: 'Reports & exports',
        to: '/reports',
        icon: FileBarChart,
        ready: true,
        moduleKey: 'reports',
      },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { label: 'KPI Directory', to: '/kpis', icon: LayoutGrid, ready: true, moduleKey: 'kpi-directory' },
    ],
  },
  {
    label: 'Administration',
    items: [
      {
        label: 'Stakeholders',
        to: '/stakeholders',
        icon: Building2,
        ready: true,
        moduleKey: 'stakeholders',
      },
      {
        label: 'User access',
        to: '/administration',
        icon: ShieldCheck,
        ready: true,
        moduleKey: 'administration',
      },
    ],
  },
]
