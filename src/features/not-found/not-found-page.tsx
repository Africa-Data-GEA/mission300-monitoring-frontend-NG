import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

/** Renders for any route that doesn't match one of the app's pages. */
export function NotFoundPage() {
  return (
    <Card className="p-8 text-center">
      <p className="text-sm font-semibold tracking-wide text-brand-700 uppercase">404</p>
      <h1 className="mt-2 text-2xl font-semibold text-text-default">Page not found</h1>
      <p className="mx-auto mt-2 max-w-prose text-sm text-text-muted">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Button asChild className="mt-5">
        <Link to="/dashboard">Back to Executive Overview</Link>
      </Button>
    </Card>
  )
}
