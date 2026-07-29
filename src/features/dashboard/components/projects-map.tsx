import { MapPin } from 'lucide-react'
import { Link } from 'react-router'
import { EXECUTION_STATUS_LABELS } from '@/api/schemas/programs'
import { CHART_ACCENT, CHART_BLUE } from '@/config/chart-colors'
import type { OngoingProject } from '../types'

const BOUNDS = { minLongitude: 2.5, maxLongitude: 14.8, minLatitude: 4.1, maxLatitude: 14 }
const NIGERIA_OUTLINE = [
  [3.8, 13.5], [5.5, 13.9], [7.7, 13.3], [9.7, 13.9], [12.4, 13.1],
  [14.6, 12], [14.3, 10.4], [13.5, 9.3], [12.7, 8.1], [12, 7],
  [10.6, 6.8], [9.7, 5.5], [8.4, 4.4], [6.7, 4.3], [5.1, 4.7],
  [4.1, 6.1], [3.3, 6.4], [2.7, 8.6], [3.5, 10.5], [3.6, 12.3],
] as const

const STATUS_COLORS = {
  'on-track': CHART_BLUE.darkest,
  'at-risk': CHART_BLUE.base,
  delayed: CHART_BLUE.light,
  blocked: CHART_ACCENT,
} as const

function position(latitude: number, longitude: number) {
  return {
    left: `${((longitude - BOUNDS.minLongitude) / (BOUNDS.maxLongitude - BOUNDS.minLongitude)) * 86 + 7}%`,
    top: `${(1 - (latitude - BOUNDS.minLatitude) / (BOUNDS.maxLatitude - BOUNDS.minLatitude)) * 86 + 7}%`,
  }
}

function outlinePoint([longitude, latitude]: readonly [number, number]) {
  const point = position(latitude, longitude)
  return `${Number.parseFloat(point.left)},${Number.parseFloat(point.top)}`
}

export function ProjectsMap({ projects }: { projects: readonly OngoingProject[] }) {
  if (projects.length === 0) {
    return <p className="py-10 text-center text-sm text-text-muted">No located ongoing projects.</p>
  }

  return (
    <div>
      <p className="mb-3 text-xs text-text-muted">
        Hover or focus a point for project details. Select it to open the project record.
      </p>
      <div
        role="region"
        aria-label={`Map of Nigeria showing ${projects.length} ongoing project locations`}
        className="relative mx-auto aspect-[1.45/1] w-full max-w-4xl overflow-hidden rounded-xl border border-border-default bg-[#eff6ff]"
      >
        <svg viewBox="0 0 100 100" className="absolute inset-0 size-full" aria-hidden="true">
          <defs>
            <pattern id="project-map-grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#bfdbfe" strokeWidth="0.25" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#project-map-grid)" />
          <polygon
            points={NIGERIA_OUTLINE.map(outlinePoint).join(' ')}
            fill="#dbeafe"
            stroke="#60a5fa"
            strokeWidth="0.8"
            strokeLinejoin="round"
          />
        </svg>

        <div className="absolute top-4 left-4 rounded-md bg-white/90 px-2 py-1 text-xs font-semibold text-brand-800 shadow-sm">
          Nigeria
        </div>

        {projects.map((project) => (
          <div
            key={project.id}
            className="group absolute z-10 -translate-x-1/2 -translate-y-full"
            style={position(project.latitude, project.longitude)}
          >
            <Link
              to={`/programs/projects/${project.id}`}
              aria-label={`Open ${project.name} in ${project.location}`}
              className="block rounded-full outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-brand-700 focus-visible:ring-offset-2"
            >
              <MapPin
                className="size-8 drop-shadow-md"
                fill={STATUS_COLORS[project.currentStatus]}
                color="#ffffff"
                strokeWidth={1.8}
                aria-hidden="true"
              />
            </Link>

            <div className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-64 -translate-x-1/2 rounded-lg bg-text-default p-3 text-white shadow-xl group-hover:block group-focus-within:block">
              <p className="text-sm font-semibold">{project.name}</p>
              <p className="mt-1 text-xs text-white/75">{project.location}</p>
              <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                <dt className="text-white/65">Status</dt>
                <dd className="text-right">{EXECUTION_STATUS_LABELS[project.currentStatus]}</dd>
                <dt className="text-white/65">Programme</dt>
                <dd className="text-right">{project.programmeName}</dd>
                <dt className="text-white/65">Owner</dt>
                <dd className="text-right">{project.owner}</dd>
              </dl>
            </div>
          </div>
        ))}

        <div className="absolute right-3 bottom-3 flex flex-wrap justify-end gap-2 rounded-lg bg-white/90 p-2 text-[11px] text-text-muted shadow-sm">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <span key={status} className="inline-flex items-center gap-1">
              <span className="size-2 rounded-full" style={{ backgroundColor: color }} />
              {EXECUTION_STATUS_LABELS[status as keyof typeof STATUS_COLORS]}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
