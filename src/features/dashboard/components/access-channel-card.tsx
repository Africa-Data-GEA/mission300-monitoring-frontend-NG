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
      */}
      {channel.percentComplete === null ? (
        <div className="mt-3 h-2" />
      ) : (
        <ProgressBar
          className="mt-3"
          barClassName="bg-[#1d4ed8]"
          value={channel.percentComplete}
          label={channel.title}
        />
      )}
    </Card>
  )
}
