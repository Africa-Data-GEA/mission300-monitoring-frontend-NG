import { Card } from '@/components/ui/card'
import { InfoPopover } from '@/components/ui/info-popover'
import { ProgressBar } from '@/components/ui/progress-bar'
import { SourceBadge } from '@/components/ui/status-badge'
import { TrendIndicator } from '@/components/ui/trend-indicator'
import type { AccessChannel } from '../types'

/** One Section B delivery channel. */
export function AccessChannelCard({ channel }: { channel: AccessChannel }) {
  return (
    <Card className="flex h-full flex-col p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium text-text-muted">{channel.title}</h3>
        <div className="flex shrink-0 items-center gap-1.5">
          <SourceBadge source={channel.source} />
          <InfoPopover
            provenance={channel.provenance}
            label={channel.title}
            details={[{ label: 'Target', value: channel.targetLabel }]}
          />
        </div>
      </div>

      <p className="mt-2 text-2xl font-semibold tracking-tight text-text-default">
        {channel.value}
      </p>

      {channel.trend && (
        <TrendIndicator trend={channel.trend} className="mt-2.5 self-start" />
      )}

      {/*
        The specification forbids deriving a grid-connection target from the 9%
        access-rate commitment. Until a target is approved, this channel shows
        period-on-period trend only — no progress bar, and the absence is
        stated rather than left as a silent gap.
      */}
      {channel.percentComplete === null ? (
        <p className="mt-3 text-xs text-text-subtle">{channel.targetLabel}</p>
      ) : (
        <div className="mt-3">
          <ProgressBar value={channel.percentComplete} label={channel.title} />
          <p className="mt-1.5 text-xs text-text-muted">
            {channel.percentComplete.toFixed(1)}% of {channel.targetLabel}
          </p>
        </div>
      )}
    </Card>
  )
}
