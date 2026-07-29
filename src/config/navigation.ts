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
import { PILLARS, PILLAR_LABELS } from '@/types/domain'

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
        label: 'Pillar dashboards',
        to: '/pillars',
        icon: BarChart3,
        ready: true,
        children: PILLARS.map((pillar) => ({
          label: PILLAR_LABELS[pillar],
          to: `/pillars/${pillar}`,
        })),
      },
      {
        label: 'State & DisCo',
        to: '/state-disco',
        icon: MapPin,
        ready: true,
      },
    ],
  },
  {
    label: 'Delivery tracking',
    items: [
      { label: 'Programs', to: '/programs', icon: ClipboardList, ready: true },
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
      },
      {
        label: 'Reports & exports',
        to: '/reports',
        icon: FileBarChart,
        ready: true,
      },
    ],
  },
  {
    label: 'Analytics',
    items: [
      { label: 'KPI Directory', to: '/kpis', icon: LayoutGrid, ready: true },
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
      },
      {
        label: 'User access',
        to: '/administration',
        icon: ShieldCheck,
        ready: true,
      },
    ],
  },
]
