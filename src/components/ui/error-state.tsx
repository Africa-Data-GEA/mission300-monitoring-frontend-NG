import { Button } from './button'
import { Card } from './card'

/**
 * The failed-to-load panel shared by every page.
 *
 * Each page previously defined its own near-identical error card; this is the
 * one place that shape lives. `message` is shown to the user verbatim, so the
 * API contract asks the backend to write error messages for a reader.
 */
export function ErrorState({
  title,
  message,
  onRetry,
}: {
  title: string
  message: string
  onRetry: () => void
}) {
  return (
    <Card className="p-8 text-center" role="alert">
      <h1 className="text-lg font-semibold text-text-default">{title}</h1>
      <p className="mx-auto mt-2 max-w-prose text-sm text-text-muted">
        {message}
      </p>
      <Button onClick={onRetry} className="mt-5">
        Try again
      </Button>
    </Card>
  )
}
