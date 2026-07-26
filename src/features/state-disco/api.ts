import { keepPreviousData, useQuery } from '@tanstack/react-query'
import {
  discoComparisonSchema,
  stateCoverageSchema,
  stateDetailSchema,
  stateDiscoFiltersSchema,
  stateDiscoOverviewSchema,
  supplyTariffSchema,
  utilityDeliverySchema,
  type StateDiscoQuery,
} from '@/api/schemas/state-disco'
import { api } from '@/lib/api-client'

const keys = {
  filters: ['state-disco', 'filters'] as const,
  page: (name: string, query: StateDiscoQuery) => ['state-disco', name, query] as const,
  state: (id: string) => ['state-disco', 'state', id] as const,
}

function search(query: StateDiscoQuery) {
  const params = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value && value !== 'all') params.set(key, value)
  })
  const serialised = params.toString()
  return serialised ? `?${serialised}` : ''
}

function usePage<T>(name: string, path: string, query: StateDiscoQuery, schema: Parameters<typeof api.get<T>>[1]) {
  return useQuery({
    queryKey: keys.page(name, query),
    queryFn: () => api.get(`${path}${search(query)}`, schema),
    placeholderData: keepPreviousData,
  })
}

export function useStateDiscoFilters() {
  return useQuery({
    queryKey: keys.filters,
    queryFn: () => api.get('/state-disco/filters', stateDiscoFiltersSchema),
    staleTime: Infinity,
  })
}

export const useStateDiscoOverview = (query: StateDiscoQuery) =>
  usePage('overview', '/state-disco/overview', query, stateDiscoOverviewSchema)
export const useDiscoComparison = (query: StateDiscoQuery) =>
  usePage('comparison', '/state-disco/comparison', query, discoComparisonSchema)
export const useSupplyTariff = (query: StateDiscoQuery) =>
  usePage('supply-tariff', '/state-disco/supply-tariff', query, supplyTariffSchema)
export const useUtilityDelivery = (query: StateDiscoQuery) =>
  usePage('delivery', '/state-disco/delivery', query, utilityDeliverySchema)
export const useStateCoverage = (query: StateDiscoQuery) =>
  usePage('states', '/state-disco/states', query, stateCoverageSchema)

export function useStateDetail(id: string) {
  return useQuery({
    queryKey: keys.state(id),
    queryFn: () => api.get(`/state-disco/states/${id}`, stateDetailSchema),
    enabled: Boolean(id),
  })
}
