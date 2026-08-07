import { z } from 'zod'

/**
 * A hex colour, always 6 digits with a leading `#` — matches what an
 * `<input type="color">` produces, so the frontend never has to normalise.
 */
const hexColorSchema = z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a 6-digit hex colour, e.g. #008751')

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
  updatedAt: z.iso.datetime(),
})

export const updateBrandColorsRequestSchema = z.object({
  countryName: z.string().min(1),
  primaryColor: hexColorSchema,
  secondaryColor: hexColorSchema,
  textColor: hexColorSchema,
})

export type BrandConfig = z.infer<typeof brandConfigSchema>
export type UpdateBrandColorsRequest = z.infer<typeof updateBrandColorsRequestSchema>
