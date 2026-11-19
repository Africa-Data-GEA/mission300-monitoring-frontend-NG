import { Button } from '@/components/ui/button'

const PAGE_SIZES = [10, 50, 100]

export function QueueSelectionBar({
  pageCount,
  passedCount,
  selectedCount,
  pageSize,
  onSelectPage,
  onSelectPassed,
  onPageSizeChange,
}: {
  pageCount: number
  passedCount: number
  selectedCount: number
  pageSize: number
  onSelectPage: () => void
  onSelectPassed: () => void
  onPageSizeChange: (pageSize: number) => void
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
      <Button size="sm" variant="secondary" disabled={pageCount === 0} onClick={onSelectPage} type="button">
        Select all on this page ({pageCount})
      </Button>
      <Button size="sm" variant="secondary" disabled={passedCount === 0} onClick={onSelectPassed} type="button">
        Select all that passed checks ({passedCount})
      </Button>
      {selectedCount > 0 && <span className="text-text-muted">{selectedCount} selected</span>}
      <label className="ml-auto flex items-center gap-2 text-text-muted">
        Rows per page
        <select
          className="h-8 rounded-control border border-border-default bg-surface px-2 text-sm text-text-default"
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
        >
          {PAGE_SIZES.map((size) => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>
      </label>
    </div>
  )
}
