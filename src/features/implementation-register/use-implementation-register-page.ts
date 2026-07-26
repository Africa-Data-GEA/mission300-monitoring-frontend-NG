import { useState } from 'react'
import type {
  ImplementationRegisterQuery,
  ProjectRecord,
} from '@/api/schemas/implementation-register'
import { useImplementationRegister, useImplementationRegisterFilters } from './api'

const DEFAULT_QUERY: Required<ImplementationRegisterQuery> = {
  search: '',
  recordType: 'all',
  pillar: 'all',
  institution: 'all',
  lifecycleStage: 'all',
  executionStatus: 'all',
  priority: 'all',
  bottleneckCategory: 'all',
  validationStatus: 'all',
  reportingPeriod: 'q3-2025',
}

export type ImplementationRegisterTab = 'programmes' | 'projects' | 'milestones' | 'actions'

export function useImplementationRegisterPage() {
  const [query, setQuery] = useState<Required<ImplementationRegisterQuery>>(DEFAULT_QUERY)
  const [activeTab, setActiveTab] = useState<ImplementationRegisterTab>('programmes')
  const [programmePage, setProgrammePage] = useState(1)
  const [projectPage, setProjectPage] = useState(1)
  const [milestonePage, setMilestonePage] = useState(1)
  const [actionPage, setActionPage] = useState(1)
  const [importOpen, setImportOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<ProjectRecord | null>(null)

  const filters = useImplementationRegisterFilters()
  const overview = useImplementationRegister(query, {
    pageSize: 10,
    programmePage,
    projectPage,
    milestonePage,
    actionPage,
  })

  const activeFilterCount = [
    query.recordType !== 'all',
    query.pillar !== 'all',
    query.institution !== 'all',
    query.lifecycleStage !== 'all',
    query.executionStatus !== 'all',
    query.priority !== 'all',
    query.bottleneckCategory !== 'all',
    query.validationStatus !== 'all',
  ].filter(Boolean).length

  function changeFilters(next: Required<ImplementationRegisterQuery>) {
    setQuery(next)
    // A narrowed result set makes every table's current page number meaningless.
    setProgrammePage(1)
    setProjectPage(1)
    setMilestonePage(1)
    setActionPage(1)
  }

  function resetFilters() {
    changeFilters({ ...DEFAULT_QUERY, search: query.search })
  }

  return {
    query,
    activeFilterCount,
    filters: filters.data,
    data: overview.data,
    isPending: filters.isPending || overview.isPending,
    isError: overview.isError,
    error:
      overview.error ?? new Error('The implementation register could not be loaded.'),
    retry: () => void overview.refetch(),
    changeFilters,
    resetFilters,
    activeTab,
    changeTab: (value: string) => setActiveTab(value as ImplementationRegisterTab),
    setProgrammePage,
    setProjectPage,
    setMilestonePage,
    setActionPage,
    importOpen,
    openImport: () => setImportOpen(true),
    closeImport: () => setImportOpen(false),
    refreshAfterImport: () => void overview.refetch(),
    selectedProject,
    viewProjectProfile: (project: ProjectRecord) => setSelectedProject(project),
    closeProjectProfile: () => setSelectedProject(null),
  }
}
