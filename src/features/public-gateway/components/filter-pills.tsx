export interface FilterOption {
  readonly id: string
  readonly label: string
  /** Shown after the label, e.g. a count of matching charts. Optional. */
  readonly meta?: string
}

/**
 * A segmented filter, used for every "which slice am I looking at" control on
 * this page — pillar on the evolution charts, zone on the state table.
 *
 * A segmented control rather than a `<select>`, on purpose: the options are few
 * and the reader should be able to see what else is available without opening
 * anything. A dropdown hides the shape of the data; on a page whose job is to
 * show the shape of the data, that is the wrong default.
 *
 * Implemented as real `<button>`s inside a labelled group rather than radios,
 * because activating one re-filters the view immediately — there is no submit.
 */
export function FilterPills({
  label,
  options,
  value,
  onChange,
}: {
  /** Accessible name for the group, e.g. "Filter charts by pillar". */
  label: string
  options: readonly FilterOption[]
  value: string
  onChange: (id: string) => void
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1">
      {options.map((option) => {
        const isActive = option.id === value
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.id)}
            className={
              isActive
                ? 'border border-brand-600 bg-brand-600 px-2.5 py-1 text-[0.75rem] leading-4 font-semibold text-white'
                : 'border border-border-strong bg-surface px-2.5 py-1 text-[0.75rem] leading-4 font-semibold text-text-muted transition-colors hover:border-text-muted hover:text-text-default'
            }
          >
            {option.label}
            {option.meta && (
              <span className={isActive ? 'ml-1.5 text-white/70' : 'ml-1.5 text-text-subtle'}>
                {option.meta}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
