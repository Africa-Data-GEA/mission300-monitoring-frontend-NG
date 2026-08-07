import type { BrandConfig } from '@/api/schemas/branding'

/**
 * Mutable mock "database" for the single active brand config — same pattern
 * as `kpi-explorer.ts`'s `publishKpiValue`: one module-level object the
 * handlers read and write, standing in for a real settings table.
 *
 * Persisted to localStorage so an admin's change survives a page reload —
 * this is the mock layer's own persistence choice; a real backend would use
 * a settings table (colours) plus object storage (the logo file) instead.
 */
const STORAGE_KEY = 'm300-brand-config'

const DEFAULT_BRAND_CONFIG: BrandConfig = {
  countryName: 'Nigeria',
  primaryColor: '#008751',
  secondaryColor: '#e08214',
  textColor: '#101828',
  logoUrl: '/Logos/geapp.png',
  updatedAt: new Date().toISOString(),
}

function readStoredConfig(): BrandConfig | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as BrandConfig) : null
  } catch {
    return null
  }
}

let brandConfig: BrandConfig = readStoredConfig() ?? DEFAULT_BRAND_CONFIG

export function getBrandConfig(): BrandConfig {
  return brandConfig
}

export function setBrandConfig(next: BrandConfig): BrandConfig {
  brandConfig = next
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Storage can fail (quota, private browsing) — the in-memory value
      // still applies for the rest of this session, it just won't survive
      // a reload. Not worth surfacing to the admin as an error.
    }
  }
  return brandConfig
}
