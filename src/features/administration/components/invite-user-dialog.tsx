import { CheckCircle2, Send } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import {
  SCOPE_LEVEL_LABELS,
  SYSTEM_ROLE_LABELS,
  type InviteUserRequest,
} from '@/api/schemas/administration'
import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { SideDialog } from '@/components/ui/side-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useInviteUser } from '../use-invite-user'

const INSTITUTIONS = [
  'EMRC',
  'Federal Ministry of Power',
  'Federal Ministry of Finance',
  'NERC',
  'Rural Electrification Agency',
  'Transmission Company of Nigeria',
  'Nigerian Independent System Operator',
]

const inputClass =
  'h-11 w-full rounded-control border border-border-strong bg-surface px-3.5 text-base text-text-default placeholder:text-text-subtle'

function InviteForm({
  form,
  onSubmit,
  serverError,
}: {
  readonly form: UseFormReturn<InviteUserRequest>
  readonly onSubmit: () => void
  readonly serverError: string
}) {
  return (
    <Form {...form}>
      <form className="space-y-6" noValidate onSubmit={onSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel>Full name</FormLabel><FormControl><input {...field} autoFocus className={inputClass} placeholder="Enter full name" /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem><FormLabel>Work email</FormLabel><FormControl><input {...field} className={inputClass} inputMode="email" placeholder="name@organisation.gov.ng" type="email" /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="institution" render={({ field }) => (
            <FormItem>
              <FormLabel>Institution</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select institution" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {INSTITUTIONS.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="designation" render={({ field }) => (
            <FormItem><FormLabel>Designation</FormLabel><FormControl><input {...field} className={inputClass} placeholder="e.g. Monitoring Officer" /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="role" render={({ field }) => (
            <FormItem>
              <FormLabel>System role</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger className="h-11"><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>{Object.entries(SYSTEM_ROLE_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="accessScope" render={({ field }) => (
            <FormItem>
              <FormLabel>Initial access scope</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl><SelectTrigger className="h-11"><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>{Object.entries(SCOPE_LEVEL_LABELS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="invitationMessage" render={({ field }) => (
          <FormItem><FormLabel>Invitation message <span className="font-normal text-text-muted">(optional)</span></FormLabel><FormControl><textarea {...field} className="min-h-28 w-full resize-y rounded-control border border-border-strong bg-surface px-3.5 py-3 text-base text-text-default placeholder:text-text-subtle" placeholder="Add context for the invited user" /></FormControl><FormMessage /></FormItem>
        )} />
        {serverError ? <p className="text-sm text-status-at-risk" role="alert">{serverError}</p> : null}
        <div className="flex justify-end border-t border-border-default pt-5">
          <Button className="h-10 px-5" disabled={form.formState.isSubmitting} type="submit">
            <Send aria-hidden="true" />
            {form.formState.isSubmitting ? 'Sending invitation' : 'Send invitation'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export function InviteUserDialog({
  onClose,
  onInvited,
  open,
}: {
  readonly onClose: () => void
  readonly onInvited: () => void
  readonly open: boolean
}) {
  const invitation = useInviteUser(onInvited)
  return (
    <SideDialog
      description="Create a pending account and send secure onboarding instructions."
      onClose={onClose}
      open={open}
      title="Invite new user"
    >
      {invitation.successMessage ? (
        <div className="flex min-h-72 flex-col items-center justify-center text-center" aria-live="polite">
          <CheckCircle2 aria-hidden="true" className="size-12 text-brand-600" />
          <h3 className="mt-4 text-xl font-semibold">Invitation sent</h3>
          <p className="mt-2 max-w-md text-sm text-text-muted">{invitation.successMessage}</p>
          <Button className="mt-6" onClick={onClose} type="button">Done</Button>
        </div>
      ) : (
        <InviteForm form={invitation.form} onSubmit={invitation.submit} serverError={invitation.serverError} />
      )}
    </SideDialog>
  )
}
