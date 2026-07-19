# Design system

## Re-theming the application

**Edit [`src/styles/theme.css`](../src/styles/theme.css). Nothing else.**

Every colour, font, type step, radius and shadow used anywhere in the product
is declared in that one file. Components reference them through Tailwind
utilities and never hardcode a raw value, so changing a token changes it
everywhere.

```
src/styles/theme.css     ← the whole theme
src/index.css            ← imports the theme, plus base element styles
```

After editing, run `pnpm test` — token names are asserted by component tests,
so a rename that breaks a component fails loudly rather than silently
rendering an unstyled element.

### Token groups

| Group | Prefix | Purpose |
| --- | --- | --- |
| Brand | `--color-brand-50…900` | Active navigation, primary actions |
| Delivery status | `--color-status-*` | On track, at risk, lagging, delayed, blocked, no-data |
| Data confidence | `--color-confidence-*` | Confirmed, requires validation, future gap |
| Trend | `--color-trend-up/down` | Improving vs worsening movement |
| Surfaces | `--surface*`, `--border-*`, `--text-*` | Light/dark swappable, defined in `:root` and `.dark` |
| Type scale | `--text-2xs…4xl` | Tightened one step below stock Tailwind |
| Shape | `--radius-card/control/pill` | |
| Elevation | `--shadow-card/raised` | |

### Light and dark

Surface tokens are declared twice — in `:root` for light and `.dark` for dark —
and re-exported through `@theme inline` so Tailwind utilities such as
`bg-surface` resolve per theme. Adding a dark-mode toggle means toggling the
`dark` class on `<html>`; no component changes are needed.

## Conventions

### Never hardcode a colour

```tsx
// Wrong — invisible to a re-theme, and wrong in dark mode
<div className="bg-white text-[#101828]" />

// Right
<div className="bg-surface text-text-default" />
```

### Cards are borderless

Separation comes from surface contrast plus a soft shadow, per the wireframe.

- `<Card>` — white, soft shadow. The default.
- `<Card variant="well">` — grey container that groups white cards, as in
  Pillar performance and Needs attention.
- `<Card variant="plain">` — white, no shadow, for nesting inside a well.

### Status colour is not a free choice

`DeliveryStatus`, `DataConfidence` and `SourceTag` in
[`src/types/domain.ts`](../src/types/domain.ts) are closed unions, and their
colours are mapped centrally in
[`status-badge.tsx`](../src/components/ui/status-badge.tsx). Adding a status is
a contract change: update the union, the colour map, `docs/API.md`, and the
page specification together.

`limited-data` and `provisional` are deliberately neutral, not red. They mean
"we cannot assert performance yet", which is different from failing — a pillar
with no KPIs assigned must not be presented as at risk.

### Trend arrows encode two things

The **arrow** points in the direction the value moved. The **colour** says
whether that movement is good. For a lower-is-better metric such as ATC&C
losses, a falling value is an improvement: down arrow, green. See
[`src/lib/trend.ts`](../src/lib/trend.ts).

### Icons are named, not imported, by the API

A metric payload carries `icon: MetricIconName` — a semantic name like
`access` or `losses`. Names resolve to Lucide components in
[`src/config/metric-icons.tsx`](../src/config/metric-icons.tsx). The backend
never needs to know about the icon library, and an unknown name degrades to a
neutral icon rather than rendering a blank space.

## Where components live

| Path | Contains |
| --- | --- |
| `src/components/ui/` | Primitives reused across every page: Card, Button, Select, Popover, Calendar, Breadcrumb, badges, ProgressBar, InfoPopover, Skeleton |
| `src/components/layout/` | Application chrome: AppShell, Sidebar, Topbar, RouteFallback |
| `src/config/` | Cross-cutting configuration: navigation tree, icon registry |
| `src/features/<feature>/components/` | Components used by exactly one feature |

A component graduates from `features/` to `components/ui/` the second page it
is used on — not before, to avoid premature abstraction.

## Density

This is a dense operational tool viewed at 100% zoom for long stretches, so
the type scale sits roughly one step below stock Tailwind and card padding is
`p-4` rather than `p-5`.

The root font size is deliberately **not** overridden. Setting `html { font-size: 14px }`
would have been a quicker way to shrink everything, but it breaks the browser
font-size preference for users who rely on it. Tightening the scale instead
keeps rem units honouring user settings.
