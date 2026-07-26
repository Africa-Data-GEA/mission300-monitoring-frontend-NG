/** Explains the three bullet-chart tick marks, which are otherwise unlabelled. */
export function BulletLegend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-muted">
      <li className="flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="h-3 w-0.5 rounded-full bg-text-subtle"
        />
        Baseline
      </li>
      <li className="flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="h-3 w-0.5 rounded-full bg-text-muted"
        />
        Expected this period
      </li>
      <li className="flex items-center gap-1.5">
        <span aria-hidden="true" className="h-3 w-1 rounded-full bg-text-default" />
        Target
      </li>
    </ul>
  )
}
