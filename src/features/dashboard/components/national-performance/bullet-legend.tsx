/** Explains the current fill, remaining track and approved target marker. */
export function BulletLegend() {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-muted">
      <li className="flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="h-2.5 w-5 rounded-pill bg-chart-blue-dark"
        />
        Current value
      </li>
      <li className="flex items-center gap-1.5">
        <span
          aria-hidden="true"
          className="h-2.5 w-5 rounded-pill bg-surface-sunken"
        />
        Remaining range
      </li>
      <li className="flex items-center gap-1.5">
        <span aria-hidden="true" className="h-3 w-1 rounded-full bg-text-default" />
        Target marker
      </li>
    </ul>
  )
}
