import { CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Confirmation view shown after a programme is added successfully. */
export function CreateProgrammeSuccess({ message, onDone }: { message: string; onDone: () => void }) {
  return (
    <div aria-live="polite" className="flex min-h-72 flex-col items-center justify-center text-center">
      <CheckCircle2 aria-hidden="true" className="size-12 text-brand-600" />
      <h3 className="mt-4 text-xl font-semibold">Programme saved</h3>
      <p className="mt-2 max-w-md text-sm text-text-muted">{message}</p>
      <Button className="mt-6" onClick={onDone} type="button">
        Done
      </Button>
    </div>
  )
}
