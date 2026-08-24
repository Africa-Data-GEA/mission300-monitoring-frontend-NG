import { LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AuthSubmitButton({
  children,
  loading,
  loadingLabel = 'Please wait',
}: {
  readonly children: string
  readonly loading: boolean
  readonly loadingLabel?: string
}) {
  return (
    <Button
      aria-busy={loading}
      className="h-11 w-full text-sm"
      disabled={loading}
      size="lg"
      type="submit"
    >
      {loading ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : null}
      {loading ? loadingLabel : children}
    </Button>
  )
}
