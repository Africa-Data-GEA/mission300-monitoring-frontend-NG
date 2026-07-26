import { createContext, use, useCallback, useMemo, type ReactNode } from 'react'
import { useSearchParams } from 'react-router'
import {
  DEFAULT_FILTER_VALUES,
  FILTER_KEYS,
  type DashboardFilterValues,
} from '@/types/filters'

interface GlobalFiltersContextValue {
  readonly filters: DashboardFilterValues
  readonly setFilters: (next: DashboardFilterValues) => void
  readonly setFilter: <K extends keyof DashboardFilterValues>(
    key: K,
    value: DashboardFilterValues[K],
  ) => void
  readonly reset: () => void
}

const GlobalFiltersContext = createContext<GlobalFiltersContextValue | null>(null)

/**
 * Holds the global filter selection.
 *
 * Backed by the URL query string rather than component state, which buys three
 * things a context-only store would not: a filtered view is shareable as a
 * link, it survives a reload, and the browser back button steps through filter
 * changes. Values matching the default are omitted from the URL so a clean
 * view has a clean address.
 */
export function GlobalFiltersProvider({ children }: { children: ReactNode }) {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo<DashboardFilterValues>(() => {
    const resolved = { ...DEFAULT_FILTER_VALUES }

    for (const key of FILTER_KEYS) {
      const value = searchParams.get(key)
      if (value) resolved[key] = value
    }

    return resolved
  }, [searchParams])

  const setFilters = useCallback(
    (next: DashboardFilterValues) => {
      const params = new URLSearchParams(searchParams)

      for (const key of FILTER_KEYS) {
        if (next[key] === DEFAULT_FILTER_VALUES[key]) {
          params.delete(key)
        } else {
          params.set(key, next[key])
        }
      }

      // `replace` keeps the history stack from filling with every dropdown
      // interaction while still allowing back out of a filtered view.
      setSearchParams(params, { replace: true })
    },
    [searchParams, setSearchParams],
  )

  const setFilter = useCallback(
    <K extends keyof DashboardFilterValues>(
      key: K,
      value: DashboardFilterValues[K],
    ) => setFilters({ ...filters, [key]: value }),
    [filters, setFilters],
  )

  const reset = useCallback(
    () => setFilters(DEFAULT_FILTER_VALUES),
    [setFilters],
  )

  const value = useMemo(
    () => ({ filters, setFilters, setFilter, reset }),
    [filters, setFilters, setFilter, reset],
  )

  return (
    <GlobalFiltersContext value={value}>{children}</GlobalFiltersContext>
  )
}

/**
 * Reads the global filter selection.
 *
 * Every page that fetches data should key its query off this, so a filter
 * change narrows the whole application rather than one page.
 */
export function useGlobalFilters(): GlobalFiltersContextValue {
  const context = use(GlobalFiltersContext)

  if (!context) {
    throw new Error(
      'useGlobalFilters must be used inside a GlobalFiltersProvider. ' +
        'The provider is mounted by AppShell.',
    )
  }

  return context
}
