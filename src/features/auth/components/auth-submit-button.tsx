import { LoaderCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function AuthSubmitButton({
  children,
  loading,
}: {
  readonly children: string
  readonly loading: boolean
}) {
  return (
    <Button className="h-11 w-full text-sm" disabled={loading} size="lg" type="submit">
      {loading ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : null}
      {loading ? 'Please wait' : children}
    </Button>
  )
}
