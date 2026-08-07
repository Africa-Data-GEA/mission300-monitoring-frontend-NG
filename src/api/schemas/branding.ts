import { z } from 'zod'

/**
 * A hex colour, always 6 digits with a leading `#` — matches what an
 * `<input type="color">` produces, so the frontend never has to normalise.
 */
const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a 6-digit hex colour, e.g. #008751')

/** Google Fonts family name, e.g. "Inter" or "Noto Sans". */
const fontFamilySchema = z.string().min(1)

/**
 * One Google Fonts family per heading level plus body text — deliberately
 * per-level (not a single "heading font" shared by h1-h6) so an admin can,
 * say, give h1 a display face while h2-h6 stay on the body face.
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
})

export const updateBrandFontsRequestSchema = z.object({
  fonts: brandFontsSchema,
})

export type BrandFonts = z.infer<typeof brandFontsSchema>
export type BrandConfig = z.infer<typeof brandConfigSchema>
export type UpdateBrandColorsRequest = z.infer<typeof updateBrandColorsRequestSchema>
export type UpdateBrandFontsRequest = z.infer<typeof updateBrandFontsRequestSchema>
