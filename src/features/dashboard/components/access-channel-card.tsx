import { Card } from '@/components/ui/card'
import { InfoPopover } from '@/components/ui/info-popover'
import { ProgressBar } from '@/components/ui/progress-bar'
import { TrendIndicator } from '@/components/ui/trend-indicator'
import type { AccessChannel } from '../types'

/*
 * Urban/rural split toggle — disabled, not deleted. It rendered a fixed
 * 65/35 urban-lean ratio (see ../lib/urban-rural-split.ts) applied to the
 * channel's total, not real disaggregated data, which read as an actual
 * figure. Bring this back once a genuine urban/rural breakdown exists.
 *
 * import { useEffect, useId, useRef, useState } from 'react'
 * import { getLocale } from '@/lib/currency'
 * import { getUrbanRuralBreakdown } from '../lib/urban-rural-split'
 *
 * const numberFormatter = new Intl.NumberFormat(getLocale())
 *
 * function UrbanRuralBreakdownToggle({ channel }: { channel: AccessChannel }) {
 *   const [open, setOpen] = useState(false)
 *   const containerRef = useRef<HTMLDivElement>(null)
 *   const panelId = useId()
 *
 *   useEffect(() => {
 *     if (!open) return
 *
 *     function onPointerDown(event: PointerEvent) {
 *       if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
 *     }
 *     function onKeyDown(event: KeyboardEvent) {
 *       if (event.key === 'Escape') setOpen(false)
 *     }
 *
 *     document.addEventListener('pointerdown', onPointerDown)
 *     document.addEventListener('keydown', onKeyDown)
 *     return () => {
 *       document.removeEventListener('pointerdown', onPointerDown)
 *       document.removeEventListener('keydown', onKeyDown)
 *     }
 *   }, [open])
 *
 *   const rows = getUrbanRuralBreakdown(channel.rawValue)
 *   const maxValue = Math.max(...rows.map((row) => row.value))
 *
 *   return (
 *     <div ref={containerRef} className="relative mt-2 inline-block">
 *       <button
 *         type="button"
 *         aria-expanded={open}
 *         aria-controls={open ? panelId : undefined}
 *         onClick={() => setOpen((value) => !value)}
 *         className="text-2xs font-medium text-text-subtle underline-offset-2 hover:text-brand-700 hover:underline"
 *       >
 *         {open ? 'Hide urban/rural split ▴' : 'Urban / rural split ▾'}
 *       </button>
 *
 *       {open && (
 *         <div
 *           id={panelId}
 *           role="dialog"
 *           aria-label={`${channel.title} by urban and rural area`}
 *           className="absolute bottom-full left-0 z-50 mb-2 w-72 rounded-control border border-border-default bg-surface p-3 text-left shadow-lg"
 *         >
 *           <p className="text-2xs text-text-subtle">
 *             Illustrative split — no disaggregated urban/rural connection data is tracked yet.
 *           </p>
 *           <div className="mt-2 space-y-1.5">
 *             {rows.map((row) => (
 *               <div key={row.id} className="flex items-center gap-2">
 *                 <span className="w-12 shrink-0 text-2xs text-text-muted">{row.name}</span>
 *                 <div className="h-3.5 flex-1 rounded-sm bg-surface-subtle">
 *                   <div
 *                     className="h-full rounded-sm bg-chart-blue-dark"
 *                     style={{ width: `${maxValue > 0 ? (row.value / maxValue) * 100 : 0}%` }}
 *                   />
 *                 </div>
 *                 <span className="w-20 shrink-0 text-right text-2xs font-semibold text-text-default">
 *                   {numberFormatter.format(row.value)}
 *                 </span>
 *               </div>
 *             ))}
 *           </div>
 *         </div>
 *       )}
 *     </div>
 *   )
 * }
 */

/** One Section B delivery channel. */
export function AccessChannelCard({ channel }: { channel: AccessChannel }) {
  return (
    <Card className="flex h-full flex-col p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium text-text-muted">{channel.title}</h3>
        <div className="flex shrink-0 items-center gap-1.5">
          {/* <SourceBadge source={channel.source} /> */}
          <InfoPopover
            provenance={channel.provenance}
            label={channel.title}
            details={[{ label: 'Target', value: channel.targetLabel }]}
          />
        </div>
      </div>

      {/*
        Value and trend share a row rather than stacking — the trend badge is
        a modifier on the value ("this many, up by that much"), not a separate
        fact, so putting them on their own lines only added height without
        adding anything to read.
      */}
      <div className="mt-2 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
        <p className="text-2xl font-semibold tracking-tight text-text-default">
          {channel.value}
        </p>
        {channel.trend && <TrendIndicator trend={channel.trend} />}
      </div>

      {/*
        The specification forbids deriving a grid-connection target from the 9%
        access-rate commitment. Until a target is approved, this channel shows
        period-on-period trend only — no progress bar, and the absence is
        stated rather than left as a silent gap.

        ALIGNMENT: the bar rail and the substitute line occupy the same slot at
        the bottom of the card, pushed there by `mt-auto`, so every card in the
        row ends on the same baseline no matter which branch it takes. An empty
        spacer was not enough — it left the untargeted card looking unfinished
        rather than deliberately blank.
      */}
      <div className="mt-auto pt-3">
        {channel.percentComplete === null ? (
          <p className="text-xs text-text-subtle">Annual target to be confirmed</p>
        ) : (
          <ProgressBar
            barClassName="bg-chart-blue-dark"
            value={channel.percentComplete}
            label={channel.title}
          />
        )}
      </div>

      {/* <UrbanRuralBreakdownToggle channel={channel} /> — see comment above */}
    </Card>
  )
}
