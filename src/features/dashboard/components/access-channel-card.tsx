import { Card } from '@/components/ui/card'
import { InfoPopover } from '@/components/ui/info-popover'
import { ProgressBar } from '@/components/ui/progress-bar'
import { TrendIndicator } from '@/components/ui/trend-indicator'
import type { AccessChannel } from '../types'

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
    </Card>
  )
}
