/** Small count badge shown beside a tab label, e.g. "Users 12". */
export function TabCount({ value }: { value: number }) {
  return (
    <span className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-pill bg-surface-sunken px-1.5 py-0.5 text-2xs text-text-muted">
      {value}
    </span>
  )
}
