import { SideDialog } from '@/components/ui/side-dialog'
import { useImportRegister } from '../use-import-register'
import { ImportRegisterForm } from './import-register-form'
import { ImportRegisterResult } from './import-register-result'

/** Side-dialog entry point for Section E's structured import and validation. */
export function ImportRegisterDialog({
  onClose,
  onImported,
  open,
}: {
  onClose: () => void
  onImported: () => void
  open: boolean
}) {
  const importing = useImportRegister(onImported)

  function close() {
    importing.reset()
    onClose()
  }

  return (
    <SideDialog
      description="Upload a register update for schema, identifier and controlled-value validation."
      onClose={close}
      open={open}
      title="Import register update"
    >
      {importing.result ? (
        <ImportRegisterResult result={importing.result} onDone={close} />
      ) : (
        <ImportRegisterForm
          form={importing.form}
          onSubmit={importing.submit}
          serverError={importing.serverError}
        />
      )}
    </SideDialog>
  )
}
