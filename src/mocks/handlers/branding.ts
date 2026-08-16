import { delay, http, HttpResponse } from '../local-router'
import { updateBrandColorsRequestSchema, updateBrandFontsRequestSchema } from '@/api/schemas/branding'
import { getBrandConfig, setBrandConfig } from '../data/branding'

/** Reads a File into a `data:` URL — stands in for uploading to real object storage. */
async function fileToDataUrl(file: File): Promise<string> {
  const buffer = await file.arrayBuffer()
  let binary = ''
  for (const byte of new Uint8Array(buffer)) {
    binary += String.fromCharCode(byte)
  }
  const base64 = btoa(binary)
  return `data:${file.type || 'image/png'};base64,${base64}`
}

export const brandingHandlers = [
  /** GET /api/branding — the single active site-wide brand configuration. */
  http.get('/api/branding', async () => {
    await delay(80)
    return HttpResponse.json(getBrandConfig())
  }),

  /** PUT /api/branding — updates country name and the three colours. Logo is a separate endpoint. */
  http.put('/api/branding', async ({ request }) => {
    await delay(150)
    const body = await request.json()
    const result = updateBrandColorsRequestSchema.safeParse(body)
    if (!result.success) {
      return HttpResponse.json(
        { message: result.error.issues[0]?.message ?? 'Invalid brand configuration.' },
        { status: 400 },
      )
    }
    const updated = setBrandConfig({
      ...getBrandConfig(),
      ...result.data,
      updatedAt: new Date().toISOString(),
    })
    return HttpResponse.json(updated)
  }),

  /** PUT /api/branding/fonts — updates the h1-h6 + body Google Fonts family assignments. */
  http.put('/api/branding/fonts', async ({ request }) => {
    await delay(150)
    const body = await request.json()
    const result = updateBrandFontsRequestSchema.safeParse(body)
    if (!result.success) {
      return HttpResponse.json(
        { message: result.error.issues[0]?.message ?? 'Invalid font configuration.' },
        { status: 400 },
      )
    }
    const updated = setBrandConfig({
      ...getBrandConfig(),
      fonts: result.data.fonts,
      updatedAt: new Date().toISOString(),
    })
    return HttpResponse.json(updated)
  }),

  /** POST /api/branding/logo — multipart upload, field `file`. */
  http.post('/api/branding/logo', async ({ request }) => {
    await delay(300)
    const form = await request.formData()
    const file = form.get('file')
    if (!(file instanceof File)) {
      return HttpResponse.json({ message: 'Select a logo image to upload.' }, { status: 400 })
    }
    if (!file.type.startsWith('image/')) {
      return HttpResponse.json({ message: 'The logo must be an image file.' }, { status: 400 })
    }
    const logoUrl = await fileToDataUrl(file)
    const updated = setBrandConfig({
      ...getBrandConfig(),
      logoUrl,
      updatedAt: new Date().toISOString(),
    })
    return HttpResponse.json(updated)
  }),
]
