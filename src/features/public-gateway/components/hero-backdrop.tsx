/**
 * Where the hero photograph is read from.
 *
 * `public/bg.avif` — supplied directly rather than dropped into
 * `public/hero/` per that folder's own README, because the file already
 * existed at the project root when this was wired up. Nothing else needs to
 * change if it is replaced later, and nothing breaks while it is absent — the
 * navy field and the data texture below render on their own, so the hero
 * never shows a broken-image gap or a grey box.
 */
export const HERO_IMAGE_URL = '/bg.avif'

/**
 * The layered background of the hero band.
 *
 * Three layers, in order, all behind the text:
 *
 *   1. The photograph, if one has been placed at HERO_IMAGE_URL.
 *   2. A data texture — an ascending plot drawn in near-invisible white. It is
 *      not ornament: it is the shape of the very series the page is about, and
 *      it is what stops the band reading as an empty coloured rectangle on the
 *      days no photograph is cleared.
 *   3. A navy scrim, heaviest on the left where the headline sits and lifting
 *      to the right. This is the layer that makes the text legible over an
 *      arbitrary photograph, and it is why the contrast of the headline does
 *      not depend on which image someone drops in later.
 *
 * `aria-hidden` throughout: none of this carries information the text does not.
 */
export function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-75"
        style={{ backgroundImage: `url('${HERO_IMAGE_URL}')` }}
      />

      <svg
        viewBox="0 0 1200 420"
        preserveAspectRatio="xMaxYMid slice"
        className="absolute inset-y-0 right-0 h-full w-full max-w-[70rem] text-white"
      >
        {/* Gridlines — the axis a reader of this page is used to seeing. */}
        {[80, 160, 240, 320].map((y) => (
          <line key={y} x1="0" y1={y} x2="1200" y2={y} stroke="currentColor" strokeOpacity="0.06" strokeWidth="1" />
        ))}

        {/* The ascending series, drawn as columns then traced by a line —
            baseline at the left, target height at the right. */}
        {Array.from({ length: 26 }, (_, index) => {
          const x = 60 + index * 44
          const height = 30 + index * 11
          return (
            <rect
              key={x}
              x={x}
              y={380 - height}
              width="16"
              height={height}
              fill="currentColor"
              fillOpacity="0.05"
            />
          )
        })}

        <path
          d={Array.from({ length: 26 }, (_, index) => {
            const x = 68 + index * 44
            const y = 380 - (30 + index * 11)
            return `${index === 0 ? 'M' : 'L'}${x},${y}`
          }).join(' ')}
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.14"
          strokeWidth="2"
        />
      </svg>

      {/* Scrim last, so it sits over both the photograph and the texture. */}
      <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(0,32,54,0.9)_0%,rgba(0,32,54,0.7)_45%,rgba(0,32,54,0.22)_100%)]" />
    </div>
  )
}
