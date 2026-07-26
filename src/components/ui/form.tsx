import { Slot } from '@radix-ui/react-slot'
import { createContext, useContext, useId, type ComponentPropsWithoutRef } from 'react'
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
  type ControllerProps,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form'
import { cn } from '@/lib/utils'

export const Form = FormProvider

interface FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  readonly name: TName
}

const FormFieldContext = createContext<FormFieldContextValue>({} as FormFieldContextValue)

export function FormField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  )
}

const FormItemContext = createContext<{ readonly id: string }>({} as { readonly id: string })

function useFormField() {
  const fieldContext = useContext(FormFieldContext)
  const itemContext = useContext(FormItemContext)
  const { getFieldState } = useFormContext()
  const formState = useFormState({ name: fieldContext.name })
  const fieldState = getFieldState(fieldContext.name, formState)

  return {
    ...fieldState,
    formDescriptionId: `${itemContext.id}-description`,
    formItemId: `${itemContext.id}-form-item`,
    formMessageId: `${itemContext.id}-message`,
  }
}

export function FormItem({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  const id = useId()
  return (
    <FormItemContext.Provider value={{ id }}>
      <div className={cn('space-y-2', className)} {...props} />
    </FormItemContext.Provider>
  )
}

export function FormLabel({ className, ...props }: ComponentPropsWithoutRef<'label'>) {
  const { error, formItemId } = useFormField()
  return (
    <label
      className={cn('text-sm font-medium text-text-default', error && 'text-status-at-risk', className)}
      htmlFor={formItemId}
      {...props}
    />
  )
}

export function FormControl(props: ComponentPropsWithoutRef<typeof Slot>) {
  const { error, formDescriptionId, formItemId, formMessageId } = useFormField()
  return (
    <Slot
      aria-describedby={error ? `${formDescriptionId} ${formMessageId}` : formDescriptionId}
      aria-invalid={Boolean(error)}
      id={formItemId}
      {...props}
    />
  )
}

export function FormDescription({ className, ...props }: ComponentPropsWithoutRef<'p'>) {
  const { formDescriptionId } = useFormField()
  return (
    <p className={cn('text-sm text-text-muted', className)} id={formDescriptionId} {...props} />
  )
}

export function FormMessage({ className, children, ...props }: ComponentPropsWithoutRef<'p'>) {
  const { error, formMessageId } = useFormField()
  const message = error ? String(error.message ?? '') : children
  if (!message) return null

  return (
    <p className={cn('text-sm text-status-at-risk', className)} id={formMessageId} role="alert" {...props}>
      {message}
    </p>
  )
}
