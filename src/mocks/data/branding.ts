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

const DEFAULT_FONT = 'Google Sans'

const DEFAULT_BRAND_CONFIG: BrandConfig = {
  countryName: 'Nigeria',
  // CDMU Convening slide deck palette, per the site owner's request — a
  // deep navy primary and a single gold accent, not the earlier Nigeria
  // flag-green scheme. Still just the stored default: an admin can change
  // any of these from Administration > Customization at any time.
  primaryColor: '#004972',
  secondaryColor: '#ffca05',
  textColor: '#101828',
  sidebarColor: '#004972',
  logoUrl: '/Logos/geapp.png',
  fonts: {
    h1: DEFAULT_FONT,
    h2: DEFAULT_FONT,
    h3: DEFAULT_FONT,
    h4: DEFAULT_FONT,
    h5: DEFAULT_FONT,
    h6: DEFAULT_FONT,
    body: DEFAULT_FONT,
  },
  updatedAt: new Date().toISOString(),
}

function readStoredConfig(): BrandConfig | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<BrandConfig>
    // A config saved before font roles existed won't have `fonts` — fall
    // back to the default rather than failing `brandConfigSchema` on GET.
    return { ...DEFAULT_BRAND_CONFIG, ...parsed, fonts: parsed.fonts ?? DEFAULT_BRAND_CONFIG.fonts }
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
