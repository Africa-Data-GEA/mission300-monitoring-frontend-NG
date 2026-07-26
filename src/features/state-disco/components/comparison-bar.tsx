export function ComparisonBar({
  primaryPercent,
  secondaryPercent,
  primaryLabel,
  secondaryLabel,
}: {
  primaryPercent: number
  secondaryPercent: number
  primaryLabel: string
  secondaryLabel: string
}) {
  return (
    <div className="min-w-40 space-y-1.5">
      <div>
        <div className="h-1.5 rounded-pill bg-border-default"><div className="h-full rounded-pill bg-brand-300" style={{ width: `${primaryPercent}%` }} /></div>
        <span className="text-2xs text-text-muted">{primaryLabel}</span>
      </div>
      <div>
        <div className="h-1.5 rounded-pill bg-border-default"><div className="h-full rounded-pill bg-brand-700" style={{ width: `${secondaryPercent}%` }} /></div>
        <span className="text-2xs text-text-muted">{secondaryLabel}</span>
      </div>
    </div>
  )
}
