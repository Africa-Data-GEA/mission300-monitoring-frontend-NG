import { useState } from 'react'
import { useProject, useProjectBottlenecks, useProjectMilestones } from './api'

export function useProjectDetailPage(projectId: string) {
  const [milestonePage, setMilestonePage] = useState(1)
  const [bottleneckPage, setBottleneckPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)

  const project = useProject(projectId)
  const milestones = useProjectMilestones(projectId, milestonePage)
  const bottlenecks = useProjectBottlenecks(projectId, bottleneckPage)

  return {
    project: project.data,
    milestones: milestones.data,
    bottlenecks: bottlenecks.data,
    isPending: project.isPending || milestones.isPending || bottlenecks.isPending,
    isError: project.isError,
    error: project.error ?? new Error('The project could not be loaded.'),
    retry: () => void project.refetch(),
    setMilestonePage,
    setBottleneckPage,
    createOpen,
    openCreate: () => setCreateOpen(true),
    closeCreate: () => setCreateOpen(false),
    refreshAfterCreate: () => void bottlenecks.refetch(),
  }
}
