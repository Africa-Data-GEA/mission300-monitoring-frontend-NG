import { cn } from '@/lib/utils'
import type { DataConfidence } from '@/types/domain'

const DOT_COLOURS: Record<DataConfidence, string> = {
  confirmed: 'bg-confidence-confirmed',
  'requires-validation': 'bg-confidence-validation',
  'future-gap': 'bg-confidence-gap',
}

/** Colour key beside a data-confidence row in the Data health panel. */
export function ConfidenceDot({
  confidence,
  className,
}: {
  confidence: DataConfidence
  className?: string
}) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'size-2 shrink-0 rounded-full',
        DOT_COLOURS[confidence],
        className,
      )}
    />
  )
}
