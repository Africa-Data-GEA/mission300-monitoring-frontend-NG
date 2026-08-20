import { z } from 'zod'

/**
 * A hex colour, always 6 digits with a leading `#` — matches what an
 * `<input type="color">` produces, so the frontend never has to normalise.
 */
const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a 6-digit hex colour, e.g. #008751')

/** Google Fonts family name, e.g. "Inter" or "Noto Sans". */
const fontFamilySchema = z.string().min(1)

/**
 * One Google Fonts family per heading level plus body text. The admin UI
 * only exposes one "Headings" picker (applied to h1-h6 together) and one
 * "Body text" picker — six independent per-level controls was more than
 * anyone actually varied — but the stored shape keeps every level so a
 * future UI could still differentiate them without a data migration.
 */
export const brandFontsSchema = z.object({
  h1: fontFamilySchema,
  h2: fontFamilySchema,
  h3: fontFamilySchema,
  h4: fontFamilySchema,
  h5: fontFamilySchema,
  h6: fontFamilySchema,
  body: fontFamilySchema,
})

/**
 * The single active site-wide brand configuration — one record, not a list
 * of switchable presets. Redeploying this dashboard for another country
 * means editing this one config, the same way a real per-country deployment
 * would ship its own settings, not a picker inside one running app.
 */
export const brandConfigSchema = z.object({
  countryName: z.string().min(1),
  primaryColor: hexColorSchema,
  secondaryColor: hexColorSchema,
  textColor: hexColorSchema,
  /** The sidebar's own background colour — independent of primaryColor,
   * which drives buttons/links/accents. Applied only within the sidebar
   * (see Sidebar.tsx's `.dark` scoping), not site-wide. */
  sidebarColor: hexColorSchema,
  /** A `data:` URL from the mock upload, or a static asset path as the default. */
  logoUrl: z.string().min(1),
  fonts: brandFontsSchema,
  updatedAt: z.iso.datetime(),
})

export const updateBrandColorsRequestSchema = z.object({
  countryName: z.string().min(1),
  primaryColor: hexColorSchema,
  secondaryColor: hexColorSchema,
  textColor: hexColorSchema,
  sidebarColor: hexColorSchema,
})

export const updateBrandFontsRequestSchema = z.object({
  fonts: brandFontsSchema,
})

export type BrandFonts = z.infer<typeof brandFontsSchema>
export type BrandConfig = z.infer<typeof brandConfigSchema>
export type UpdateBrandColorsRequest = z.infer<typeof updateBrandColorsRequestSchema>
export type UpdateBrandFontsRequest = z.infer<typeof updateBrandFontsRequestSchema>
