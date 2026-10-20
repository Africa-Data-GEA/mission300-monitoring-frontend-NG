import { useRef, useState } from 'react'
import type { BrandConfig, BrandFonts } from '@/api/schemas/branding'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  useBrandConfig,
  useResetBrandConfig,
  useUpdateBrandColors,
  useUpdateBrandFonts,
  useUploadBrandCrest,
  useUploadBrandLogo,
} from '@/features/branding/api'
import { ApiError } from '@/lib/api-client'
import { SelectField } from '@/components/ui/select-field'
import { AFRICAN_COUNTRIES } from '../lib/countries'
import { FontPicker } from './font-picker'

const HEADING_ROLES = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const

const TIME_ZONES = (
  (Intl as unknown as { supportedValuesOf?: (key: string) => string[] }).supportedValuesOf?.('timeZone') ?? ['Africa/Lagos']
).map((zone) => ({ value: zone, label: zone }))

const inputClass =
  'h-10 w-full rounded-control border border-border-strong bg-surface px-3 text-sm text-text-default placeholder:text-text-subtle'

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (hex: string) => void
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-text-default">{label}</span>
      <span className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="size-10 shrink-0 cursor-pointer rounded-control border border-border-strong bg-surface p-1"
          aria-label={`${label} colour picker`}
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          pattern="^#[0-9a-fA-F]{6}$"
          className={inputClass}
          aria-label={`${label} hex value`}
        />
      </span>
    </label>
  )
}

/**
 * The branding editor — country name, primary/secondary/text colour and
 * logo. Saving colours applies them across the whole dashboard immediately
 * (see BrandProvider), no rebuild or reload needed. Only ever rendered for
 * system-administrator — see the role gate in administration-page.tsx.
 *
 * Waits here for `brand` to load, then hands it to `CustomizationForm` as a
 * plain prop — the form seeds its editable state directly from it via
 * `useState`'s lazy initializer rather than an effect that copies `brand`
 * into state on every render. That effect pattern also meant any unrelated
 * cache write (e.g. the colour-save mutation's own `setQueryData`) would
 * silently overwrite whatever the admin was mid-typing.
 */
export function CustomizationPanel() {
  const { data: brand } = useBrandConfig()
  if (!brand) return null
  return <CustomizationForm brand={brand} />
}

function CustomizationForm({ brand }: { brand: BrandConfig }) {
  const updateColors = useUpdateBrandColors()
  const updateFonts = useUpdateBrandFonts()
  const uploadLogo = useUploadBrandLogo()
  const uploadCrest = useUploadBrandCrest()
  const crestInputRef = useRef<HTMLInputElement>(null)
  const [crestError, setCrestError] = useState('')
  const resetBrand = useResetBrandConfig()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const countryOptions = (AFRICAN_COUNTRIES.includes(brand.countryName as never)
    ? [...AFRICAN_COUNTRIES]
    : [brand.countryName, ...AFRICAN_COUNTRIES]
  ).map((name) => ({ value: name, label: name }))
  const [countryName, setCountryName] = useState(brand.countryName)
  const [officialName, setOfficialName] = useState(brand.officialName)
  const [agencyName, setAgencyName] = useState(brand.agencyName)
  const [timezone, setTimezone] = useState(brand.timezone)
  const [currencyCode, setCurrencyCode] = useState(brand.currency.code)
  const [currencySymbol, setCurrencySymbol] = useState(brand.currency.symbol)
  const [currencyLocale, setCurrencyLocale] = useState(brand.currency.locale)
  const [primaryColor, setPrimaryColor] = useState(brand.primaryColor)
  const [secondaryColor, setSecondaryColor] = useState(brand.secondaryColor)
  const [textColor, setTextColor] = useState(brand.textColor)
  const [sidebarColor, setSidebarColor] = useState(brand.sidebarColor)
  const [saveMessage, setSaveMessage] = useState('')
  const [logoError, setLogoError] = useState('')

  const [fonts, setFonts] = useState<BrandFonts>(brand.fonts)
  const [fontSaveMessage, setFontSaveMessage] = useState('')

  // Simplified from one picker per heading level (h1..h6) to a single
  // "Headings" picker that sets all six at once — six independent controls
  // for a value that's realistically never varied by level was more choice
  // than anyone actually uses. BrandFonts still carries h1..h6 separately
  // (BrandProvider maps each to its own --font-heading-N token), so this
  // stays compatible — the form just no longer exposes six copies of the
  // same picker.
  function setHeadingFont(family: string) {
    setFonts((prev) => ({
      ...prev,
      ...Object.fromEntries(HEADING_ROLES.map((role) => [role, family])),
    }))
  }

  function setBodyFont(family: string) {
    setFonts((prev) => ({ ...prev, body: family }))
  }

  async function handleSaveFonts() {
    setFontSaveMessage('')
    try {
      await updateFonts.mutateAsync(fonts)
      setFontSaveMessage('Saved. The new typefaces are applied across the dashboard now.')
    } catch (error) {
      setFontSaveMessage(
        error instanceof ApiError ? error.message : 'Could not save the typography changes. Please try again.',
      )
    }
  }

  const isValidHex = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value)
  const canSave =
    countryName.trim().length > 0 &&
    officialName.trim().length > 0 &&
    agencyName.trim().length > 0 &&
    currencyCode.trim().length === 3 &&
    currencySymbol.trim().length > 0 &&
    currencyLocale.trim().length >= 2 &&
    isValidHex(primaryColor) &&
    isValidHex(secondaryColor) &&
    isValidHex(textColor) &&
    isValidHex(sidebarColor)

  async function handleSave() {
    setSaveMessage('')
    try {
      await updateColors.mutateAsync({
        countryName: countryName.trim(),
        officialName: officialName.trim(),
        agencyName: agencyName.trim(),
        timezone,
        currency: { code: currencyCode.trim().toUpperCase(), symbol: currencySymbol.trim(), locale: currencyLocale.trim() },
        primaryColor,
        secondaryColor,
        textColor,
        sidebarColor,
      })
      setSaveMessage('Saved. The new identity and colours are applied across the dashboard now.')
    } catch (error) {
      setSaveMessage(
        error instanceof ApiError ? error.message : 'Could not save the branding changes. Please try again.',
      )
    }
  }

  async function handleReset() {
    setSaveMessage('')
    try {
      const defaults = await resetBrand.mutateAsync()
      setCountryName(defaults.countryName)
      setOfficialName(defaults.officialName)
      setAgencyName(defaults.agencyName)
      setTimezone(defaults.timezone)
      setCurrencyCode(defaults.currency.code)
      setCurrencySymbol(defaults.currency.symbol)
      setCurrencyLocale(defaults.currency.locale)
      setPrimaryColor(defaults.primaryColor)
      setSecondaryColor(defaults.secondaryColor)
      setTextColor(defaults.textColor)
      setSidebarColor(defaults.sidebarColor)
      setFonts(defaults.fonts)
      setSaveMessage('Reset. The shipped default branding is applied across the dashboard now.')
    } catch (error) {
      setSaveMessage(
        error instanceof ApiError ? error.message : 'Could not reset branding. Please try again.',
      )
    }
  }

  async function handleCrestChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setCrestError('')
    try {
      await uploadCrest.mutateAsync(file)
    } catch (error) {
      setCrestError(error instanceof ApiError ? error.message : 'Could not upload the crest. Please try again.')
    } finally {
      event.target.value = ''
    }
  }

  async function handleLogoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setLogoError('')
    try {
      await uploadLogo.mutateAsync(file)
    } catch (error) {
      setLogoError(error instanceof ApiError ? error.message : 'Could not upload the logo. Please try again.')
    } finally {
      event.target.value = ''
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-5">
        <h3 className="text-base font-semibold text-text-default">Site identity</h3>
        <p className="mt-1 text-sm text-text-muted">
          Changing these applies to the whole dashboard immediately — no redeploy needed. Use this to
          switch the deployment from one Compact country to another.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <SelectField
              label="Country name"
              value={countryName}
              options={countryOptions}
              onChange={setCountryName}
              placeholder="Select a country"
            />
          </div>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-text-default">Official name</span>
            <input className={inputClass} value={officialName} onChange={(event) => setOfficialName(event.target.value)} placeholder="e.g. Federal Republic of Nigeria" />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-text-default">Lead agency</span>
            <input className={inputClass} value={agencyName} onChange={(event) => setAgencyName(event.target.value)} placeholder="e.g. Federal Ministry of Power" />
          </label>
          <SelectField label="Timezone" value={timezone} options={TIME_ZONES} onChange={setTimezone} placeholder="Select a timezone" searchable />
          <div className="grid grid-cols-3 gap-3">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-text-default">Currency code</span>
              <input className={inputClass} value={currencyCode} maxLength={3} onChange={(event) => setCurrencyCode(event.target.value.toUpperCase())} placeholder="NGN" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-text-default">Symbol</span>
              <input className={inputClass} value={currencySymbol} maxLength={4} onChange={(event) => setCurrencySymbol(event.target.value)} placeholder="₦" />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-text-default">Locale</span>
              <input className={inputClass} value={currencyLocale} onChange={(event) => setCurrencyLocale(event.target.value)} placeholder="en-NG" />
            </label>
          </div>

          <ColorField label="Primary colour" value={primaryColor} onChange={setPrimaryColor} />
          <ColorField label="Secondary colour" value={secondaryColor} onChange={setSecondaryColor} />
          <ColorField label="Text colour" value={textColor} onChange={setTextColor} />
          <ColorField label="Sidebar colour" value={sidebarColor} onChange={setSidebarColor} />
        </div>

        <p className="mt-4 rounded-control bg-surface-sunken p-3 text-xs text-text-muted">
          The country, official name, agency, crest, currency and timezone appear across the dashboard, the public
          pages, reports and emails. Institutions, KPIs, programmes and the data itself are loaded separately and do not
          change with these settings.
        </p>

        {saveMessage && (
          <p className="mt-4 text-sm text-text-muted" role="status">
            {saveMessage}
          </p>
        )}

        <div className="mt-5 flex items-center justify-between border-t border-border-default pt-5">
          <Button
            type="button"
            variant="ghost"
            onClick={handleReset}
            disabled={resetBrand.isPending}
          >
            {resetBrand.isPending ? 'Resetting…' : 'Reset to default'}
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={!canSave || updateColors.isPending}
          >
            {updateColors.isPending ? 'Saving…' : 'Save identity and colours'}
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-base font-semibold text-text-default">Typography</h3>
        <p className="mt-1 text-sm text-text-muted">
          Assign a Google Fonts family for headings and for body text. Applies across the whole
          dashboard immediately, the same as colours above.
        </p>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <FontPicker label="Headings" value={fonts.h1} onChange={setHeadingFont} />
          <FontPicker label="Body text" value={fonts.body} onChange={setBodyFont} />
        </div>

        {fontSaveMessage && (
          <p className="mt-4 text-sm text-text-muted" role="status">
            {fontSaveMessage}
          </p>
        )}

        <div className="mt-5 flex justify-end border-t border-border-default pt-5">
          <Button type="button" onClick={handleSaveFonts} disabled={updateFonts.isPending}>
            {updateFonts.isPending ? 'Saving…' : 'Save typography'}
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-base font-semibold text-text-default">National crest or flag</h3>
        <p className="mt-1 text-sm text-text-muted">
          Shown on the sign-in page, the public pages and in emails. Leave it unset to use the built-in default.
        </p>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-control border border-border-default bg-surface-sunken p-2">
            <img src={brand.crestUrl || '/Logos/geapp.png'} alt="Current crest" className="max-h-full max-w-full object-contain" />
          </div>
          <div>
            <input ref={crestInputRef} type="file" accept="image/*" onChange={handleCrestChange} className="hidden" />
            <Button type="button" variant="secondary" onClick={() => crestInputRef.current?.click()} disabled={uploadCrest.isPending}>
              {uploadCrest.isPending ? 'Uploading…' : 'Upload crest or flag'}
            </Button>
            {crestError && (
              <p className="mt-2 text-sm text-status-at-risk" role="alert">
                {crestError}
              </p>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-base font-semibold text-text-default">Logo</h3>
        <p className="mt-1 text-sm text-text-muted">
          Shown in the sidebar and on the public landing page. Replace it with the coat of arms or
          service mark for the country this deployment serves.
        </p>

        <div className="mt-4 flex items-center gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center rounded-control border border-border-default bg-surface-sunken p-2">
            <img src={brand.logoUrl} alt="Current logo" className="max-h-full max-w-full object-contain" />
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadLogo.isPending}
            >
              {uploadLogo.isPending ? 'Uploading…' : 'Upload new logo'}
            </Button>
            {logoError && (
              <p className="mt-2 text-sm text-status-at-risk" role="alert">
                {logoError}
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
