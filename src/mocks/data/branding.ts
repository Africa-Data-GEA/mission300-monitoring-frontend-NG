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

/**
 * Bump this whenever DEFAULT_BRAND_CONFIG's colours/logo/fonts change on
 * purpose (e.g. the Nigeria-green → CDMU navy/gold switch). A stored config
 * saved under an older version is treated as stale and discarded in favour
 * of the new default — otherwise a browser that saved a config before that
 * change keeps rendering the old palette forever, silently masking every
 * future default update behind whatever got cached first. An admin's own
 * deliberate customization, saved after this bump, persists normally until
 * the next bump.
 */
const CONFIG_VERSION = 2

interface StoredConfig {
  version: number
  config: BrandConfig
}

const DEFAULT_FONT = 'Google Sans'

const DEFAULT_BRAND_CONFIG: BrandConfig = {
  countryName: 'Nigeria',
  officialName: 'Federal Republic of Nigeria',
  agencyName: 'Federal Ministry of Power',
  timezone: 'Africa/Lagos',
  crestUrl: '',
  // CDMU Convening slide deck palette, per the site owner's request — a
  // deep navy primary and a single gold accent, not the earlier Nigeria
  // flag-green scheme. Still just the stored default: an admin can change
  // any of these from Administration > Customization at any time.
  primaryColor: '#004972',
  secondaryColor: '#ffca05',
  textColor: '#101828',
  sidebarColor: '#004972',
  logoUrl: '',
  currency: { code: 'NGN', symbol: '₦', locale: 'en-NG' },
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
    const parsed = JSON.parse(raw) as Partial<StoredConfig>
    if (parsed.version !== CONFIG_VERSION || !parsed.config) return null
    // A config saved before font roles or currency existed won't carry them —
    // fall back to the default rather than failing `brandConfigSchema` on GET.
    return {
      ...DEFAULT_BRAND_CONFIG,
      ...parsed.config,
      fonts: parsed.config.fonts ?? DEFAULT_BRAND_CONFIG.fonts,
      currency: parsed.config.currency ?? DEFAULT_BRAND_CONFIG.currency,
    }
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
      const stored: StoredConfig = { version: CONFIG_VERSION, config: next }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stored))
    } catch {
      // Storage can fail (quota, private browsing) — the in-memory value
      // still applies for the rest of this session, it just won't survive
      // a reload. Not worth surfacing to the admin as an error.
    }
  }
  return brandConfig
}

/** Discards any saved customization and returns to DEFAULT_BRAND_CONFIG — the "Reset to default" action in Administration > Customization. */
export function resetBrandConfig(): BrandConfig {
  brandConfig = { ...DEFAULT_BRAND_CONFIG, updatedAt: new Date().toISOString() }
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // See setBrandConfig — not worth surfacing to the admin as an error.
    }
  }
  return brandConfig
}
