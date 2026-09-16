import { Send } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import {
  SCOPE_LEVEL_LABELS,
  SYSTEM_ROLE_LABELS,
  type InviteUserRequest,
} from '@/api/schemas/administration'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

/** Institutions offered in the invite form. Kept local — this list is small
 * and specific to onboarding, unlike the full institution filter options. */
const INSTITUTIONS = [
  'EMRC',
  'Federal Ministry of Power',
  'Federal Ministry of Finance',
  'NERC',
  'Rural Electrification Agency',
  'Transmission Company of Nigeria',
  'Nigerian Independent System Operator',
]

const INPUT_CLASS =
  'h-11 w-full rounded-control border border-border-strong bg-surface px-3.5 text-base text-text-default placeholder:text-text-subtle'

/** The invite-user form fields, presented inside InviteUserDialog. */
export function InviteUserForm({
  form,
  onSubmit,
  serverError,
}: {
  form: UseFormReturn<InviteUserRequest>
  onSubmit: () => void
  serverError: string
}) {
  return (
    <Form {...form}>
      <form className="space-y-6" noValidate onSubmit={onSubmit}>
        <div className="grid gap-5 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full name</FormLabel>
                <FormControl>
                  <input
                    {...field}
                    autoFocus
                    className={INPUT_CLASS}
                    placeholder="Enter full name"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Work email</FormLabel>
                <FormControl>
                  <input
                    {...field}
                    className={INPUT_CLASS}
                    inputMode="email"
                    placeholder="name@organisation.gov.ng"
                    type="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="institution"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Institution</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select institution" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {INSTITUTIONS.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="designation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Designation</FormLabel>
                <FormControl>
                  <input
                    {...field}
                    className={INPUT_CLASS}
                    placeholder="e.g. Monitoring Officer"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="roles"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Roles this user can perform</FormLabel>
                <FormControl>
                  <fieldset className="space-y-2 rounded-control border border-border-strong p-3" aria-label="Roles this user can perform">
                    {Object.entries(SYSTEM_ROLE_LABELS).map(([value, label]) => (
                      <label key={value} className="flex items-center gap-2 text-sm text-text-default">
                        <input type="checkbox" checked={field.value.includes(value as InviteUserRequest['roles'][number])}
                          onChange={(event) => field.onChange(event.target.checked
                            ? [...field.value, value]
                            : field.value.filter((role) => role !== value))} />
                        {label}
                      </label>
                    ))}
                  </fieldset>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="accessScope"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Initial access scope</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-11">
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(SCOPE_LEVEL_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="invitationMessage"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Invitation message{' '}
                <span className="font-normal text-text-muted">(optional)</span>
              </FormLabel>
              <FormControl>
                <textarea
                  {...field}
                  className="min-h-28 w-full resize-y rounded-control border border-border-strong bg-surface px-3.5 py-3 text-base text-text-default placeholder:text-text-subtle"
                  placeholder="Add context for the invited user"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {serverError && (
          <p className="text-sm text-status-at-risk" role="alert">
            {serverError}
          </p>
        )}

        <div className="flex justify-end border-t border-border-default pt-5">
          <Button
            className="h-10 px-5"
            disabled={form.formState.isSubmitting}
            type="submit"
          >
            <Send aria-hidden="true" />
            {form.formState.isSubmitting ? 'Sending invitation' : 'Send invitation'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
