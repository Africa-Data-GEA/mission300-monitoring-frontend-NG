/**
 * The default 'Google Sans' body/heading face is self-hosted (see
 * styles/fonts.css) specifically so the app has no runtime CDN dependency
 * out of the box. That constraint can't extend to this feature: an admin
 * choosing freely among ~1,900 Google Fonts families can't be pre-bundled,
 * so a family only ever hits Google's CDN once an admin actively picks a
 * non-default font for a heading/body role — the same "customize now, no
 * rebuild" tradeoff already made for the logo (data: URL) and colours
 * (injected <style>) in brand-provider.tsx.
 */
const LINK_TAG_ID = 'brand-google-fonts'
const WEIGHTS = '400;500;600;700'

/**
 * Injects (or updates) one `<link>` tag loading every distinct family
 * currently assigned to a heading/body role, from Google's font CDN. Only
 * families actually in use are requested — never the full ~1,900-family
 * catalogue the picker searches over (see google-fonts-list.ts).
 */
export function loadGoogleFonts(families: string[]): void {
  const distinct = [...new Set(families)].filter(Boolean)
  if (distinct.length === 0) return

  const href = `https://fonts.googleapis.com/css2?${distinct
    .map((family) => `family=${encodeURIComponent(family).replace(/%20/g, '+')}:wght@${WEIGHTS}`)
    .join('&')}&display=swap`

  let link = document.getElementById(LINK_TAG_ID) as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.id = LINK_TAG_ID
    link.rel = 'stylesheet'
    document.head.appendChild(link)
  }
  if (link.href !== href) link.href = href
}
