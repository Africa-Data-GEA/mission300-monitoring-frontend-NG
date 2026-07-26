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
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react'
import { PILLARS, PILLAR_LABELS } from '@/types/domain'

/**
 * Sidebar navigation, transcribed from the approved wireframe.
 *
 * Routes that are not yet built are marked `ready: false` — they render as
 * disabled so the information architecture is visible and reviewable without
 * pretending the pages exist. Flip the flag when a page ships.
 *
 * Note: the wireframe lists "Implementation register" under both Monitoring &
 * Analysis and Delivery tracking. Treated here as a duplication in the
 * wireframe and placed under Delivery tracking only — worth confirming with
 * the spec owner.
 */
export interface NavItem {
  readonly label: string
  readonly to: string
  readonly icon: LucideIcon
  readonly ready: boolean
  readonly children?: readonly { readonly label: string; readonly to: string }[]
}

export interface NavGroup {
  readonly label: string
  readonly items: readonly NavItem[]
}

export const NAVIGATION: readonly NavGroup[] = [
  {
    label: 'Monitoring & Analysis',
    items: [
      { label: 'Executive Overview', to: '/', icon: Home, ready: true },
      {
        label: 'Compact pillar dashboards',
        to: '/pillars',
        icon: BarChart3,
        ready: false,
        children: PILLARS.map((pillar) => ({
          label: PILLAR_LABELS[pillar],
          to: `/pillars/${pillar}`,
        })),
      },
      { label: 'KPI explorer', to: '/kpis', icon: LayoutGrid, ready: true },
      { label: 'Programs', to: '/programs', icon: ClipboardList, ready: false },
      {
        label: 'State and DisCo performance',
        to: '/state-disco',
        icon: MapPin,
        ready: false,
      },
    ],
  },
  {
    label: 'Delivery tracking',
    items: [
      {
        label: 'Implementation register',
        to: '/implementation-register',
        icon: ClipboardList,
        ready: false,
      },
      {
        label: 'Bottlenecks & exceptions',
        to: '/bottlenecks',
        icon: TriangleAlert,
        ready: false,
      },
    ],
  },
  {
    label: 'Data operations',
    items: [
      {
        label: 'Data submissions & validation',
        to: '/data-submissions',
        icon: Database,
        ready: false,
      },
      {
        label: 'Reports & exports',
        to: '/reports',
        icon: FileBarChart,
        ready: false,
      },
    ],
  },
  {
    label: 'Administration',
    items: [
      {
        label: 'Stakeholders & institutions',
        to: '/stakeholders',
        icon: Building2,
        ready: true,
      },
      {
        label: 'User access & administration',
        to: '/administration',
        icon: ShieldCheck,
        ready: true,
      },
    ],
  },
]
