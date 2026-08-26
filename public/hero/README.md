# Hero image

The hero image currently in use is `public/bg.avif`, referenced directly by
`HERO_IMAGE_URL` in
`src/features/public-gateway/components/hero-backdrop.tsx` — not a file in
this folder. This directory is kept as the documented convention for a
*replacement*: drop a new file here, point `HERO_IMAGE_URL` at it, and nothing
else needs to change. The hero renders correctly while no image is set — the
navy field and the data texture stand on their own, so there is no
broken-image gap.

**What belongs here:** a real, credited photograph of Nigerian electrification
work or infrastructure.

**What does not:** a stock-library image of solar panels or of smiling
villagers. `docs/public-gateway-home.md` §01 bans those by name. A generic image
is the fastest way to make a page of real figures look like a brochure that
invented them. If no real photograph has been cleared for publication, leaving
this absent is the better outcome.

Aim for ~1600px wide, under ~300KB. It sits behind a heavy navy scrim, so
detail in the shadows is lost anyway and a larger file buys nothing.
