import { useState } from 'react'
import type {
  AdministrationQuery,
  AuditEvent,
  RoleDefinition,
  ScopeAssignment,
  UserAccount,
} from '@/api/schemas/administration'
import { useAdministration, useAdministrationFilters } from './api'

const DEFAULT_QUERY: Required<AdministrationQuery> = {
  search: '',
  institution: 'all',
  role: 'all',
  accountStatus: 'all',
  permission: 'all',
  accessScope: 'all',
  module: 'all',
  auditPeriod: 'last-30-days',
}

export type AdministrationTab = 'users' | 'roles' | 'scope' | 'audit'

export function useAdministrationPage() {
  const [query, setQuery] =
    useState<Required<AdministrationQuery>>(DEFAULT_QUERY)
  const [usersPage, setUsersPage] = useState(1)
  const [scopePage, setScopePage] = useState(1)
  const [auditPage, setAuditPage] = useState(1)
  const [activeTab, setActiveTab] = useState<AdministrationTab>('users')
  const [inviteOpen, setInviteOpen] = useState(false)

  const filters = useAdministrationFilters()
  const overview = useAdministration(query, {
    usersPage,
    scopePage,
    auditPage,
    pageSize: 5,
  })
  const activeFilterCount = [
    query.institution !== 'all',
    query.role !== 'all',
    query.accountStatus !== 'all',
    query.permission !== 'all',
    query.accessScope !== 'all',
    query.module !== 'all',
    query.auditPeriod !== 'last-30-days',
  ].filter(Boolean).length

  function changeFilters(next: Required<AdministrationQuery>) {
    setQuery(next)
    setUsersPage(1)
    setScopePage(1)
    setAuditPage(1)
  }

  function reviewUserAccess(user: UserAccount) {
    setQuery((current) => ({ ...current, search: user.name }))
    setScopePage(1)
    setActiveTab('scope')
  }

  function reviewUserAudit(user: UserAccount) {
    setQuery((current) => ({ ...current, search: user.name }))
    setAuditPage(1)
    setActiveTab('audit')
  }

  function viewUsersForRole(role: RoleDefinition) {
    setQuery((current) => ({ ...current, role: role.role, search: '' }))
    setUsersPage(1)
    setActiveTab('users')
  }

  function viewScopeUser(assignment: ScopeAssignment) {
    focusUser(assignment.userName)
  }

  function viewAuditUser(event: AuditEvent) {
    focusUser(event.userName)
  }

  function focusUser(userName: string) {
    setQuery((current) => ({ ...current, search: userName }))
    setUsersPage(1)
    setActiveTab('users')
  }

  return {
    query,
    activeFilterCount,
    filters: filters.data,
    data: overview.data,
    activeTab,
    inviteOpen,
    isPending: filters.isPending || overview.isPending,
    isError: overview.isError,
    error: overview.error ?? new Error('The administration data could not be loaded.'),
    retry: () => void overview.refetch(),
    changeFilters,
    resetFilters: () => changeFilters({ ...DEFAULT_QUERY, search: query.search }),
    changeTab: (value: string) => setActiveTab(value as AdministrationTab),
    setUsersPage,
    setScopePage,
    setAuditPage,
    reviewUserAccess,
    reviewUserAudit,
    viewUsersForRole,
    viewScopeUser,
    viewAuditUser,
    openInvite: () => setInviteOpen(true),
    closeInvite: () => setInviteOpen(false),
    refreshAfterInvite: () => void overview.refetch(),
  }
}
