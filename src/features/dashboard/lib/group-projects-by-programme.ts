import type { OngoingProject } from '../types'

type Status = OngoingProject['currentStatus']

/** Lower is worse, so blocked and delayed work sorts to the top. */
export const STATUS_SEVERITY: Record<Status, number> = {
  blocked: 0,
  delayed: 1,
  'at-risk': 2,
  'on-track': 3,
  completed: 4,
}

export interface ProgrammeGroup {
  programmeId: string
  programmeName: string
  /** In the order the projects were given. */
  projects: OngoingProject[]
  pillarLabels: string[]
  owners: string[]
  worstStatus: Status
  /** Worst first, only statuses the programme actually has. */
  statusCounts: { status: Status; count: number }[]
  /** The latest projected completion among the projects, null if none is recorded. */
  endDate: string | null
}

const unique = (values: string[]) => [...new Set(values)].filter(Boolean).sort()

/** Groups projects under their programme, keeping first-appearance order. */
export function groupProjectsByProgramme(projects: readonly OngoingProject[]): ProgrammeGroup[] {
  const byProgramme = new Map<string, OngoingProject[]>()
  for (const project of projects) {
    const own = byProgramme.get(project.programmeId)
    if (own) own.push(project)
    else byProgramme.set(project.programmeId, [project])
  }

  return [...byProgramme].map(([programmeId, own]) => {
    const statusCounts = (Object.keys(STATUS_SEVERITY) as Status[])
      .map((status) => ({
        status,
        count: own.filter((project) => project.currentStatus === status).length,
      }))
      .filter((entry) => entry.count > 0)
    const endDates = own
      .map((project) => project.endDate)
      .filter((date): date is string => date !== null)
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

    return {
      programmeId,
      programmeName: own[0]!.programmeName,
      projects: own,
      pillarLabels: unique(own.map((project) => project.pillarLabel)),
      owners: unique(own.map((project) => project.owner)),
      worstStatus: statusCounts[0]!.status,
      statusCounts,
      endDate: endDates.at(-1) ?? null,
    }
  })
}
