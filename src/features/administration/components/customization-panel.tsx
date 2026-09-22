import { useRef, useState } from 'react'
import type { BrandConfig, BrandFonts } from '@/api/schemas/branding'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  useBrandConfig,
  useResetBrandConfig,
  useUpdateBrandColors,
  useUpdateBrandFonts,
  useUploadBrandLogo,
} from '@/features/branding/api'
import { ApiError } from '@/lib/api-client'
import { SelectField } from '@/components/ui/select-field'
import { AFRICAN_COUNTRIES } from '../lib/countries'
import { FontPicker } from './font-picker'

const HEADING_ROLES = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const

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
  const resetBrand = useResetBrandConfig()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const countryOptions = (AFRICAN_COUNTRIES.includes(brand.countryName as never)
    ? [...AFRICAN_COUNTRIES]
    : [brand.countryName, ...AFRICAN_COUNTRIES]
  ).map((name) => ({ value: name, label: name }))
  const [countryName, setCountryName] = useState(brand.countryName)
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
    isValidHex(primaryColor) &&
    isValidHex(secondaryColor) &&
    isValidHex(textColor) &&
    isValidHex(sidebarColor)

  async function handleSave() {
    setSaveMessage('')
    try {
      await updateColors.mutateAsync({
        countryName: countryName.trim(),
        primaryColor,
        secondaryColor,
        textColor,
        sidebarColor,
      })
      setSaveMessage('Saved. The new colours are applied across the dashboard now.')
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

          <ColorField label="Primary colour" value={primaryColor} onChange={setPrimaryColor} />
          <ColorField label="Secondary colour" value={secondaryColor} onChange={setSecondaryColor} />
          <ColorField label="Text colour" value={textColor} onChange={setTextColor} />
          <ColorField label="Sidebar colour" value={sidebarColor} onChange={setSidebarColor} />
        </div>

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
            {updateColors.isPending ? 'Saving…' : 'Save colours'}
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
