import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import type { CreateLearningLogEntryRequest } from '@/api/schemas/learning-log'
import { Form } from '@/components/ui/form'
import { RelatedRecordField } from '@/features/learning-log/components/related-record-field'

const OPTIONS = {
  kpis: [{ value: 'M300-P2-025', label: 'M300-P2-025 — Clean Cooking Access' }],
  programmes: [{ value: 'prog-1', label: 'EEP Phase III' }],
  projects: [{ value: 'proj-1', label: 'Solar Hybrid Project' }],
}

function Harness({ initial = '' }: { initial?: string }) {
  const form = useForm<CreateLearningLogEntryRequest>({
    defaultValues: { entryType: 'decision', relatedRecord: initial } as CreateLearningLogEntryRequest,
  })
  return (
    <Form {...form}>
      <RelatedRecordField form={form} options={OPTIONS} />
      <p data-testid="value">{form.watch('relatedRecord')}</p>
    </Form>
  )
}

describe('the related record on a learning or decision', () => {
  it('starts with nothing and shows no free-text box', () => {
    render(<Harness />)
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: 'KPI' })).not.toBeInTheDocument()
  })

  it('lets you pick a real KPI from a list', async () => {
    render(<Harness />)
    await userEvent.click(screen.getByRole('combobox', { name: /Related to/ }))
    await userEvent.click(await screen.findByRole('option', { name: 'A KPI' }))
    await userEvent.click(screen.getByRole('combobox', { name: 'KPI' }))
    await userEvent.click(await screen.findByRole('option', { name: 'M300-P2-025 — Clean Cooking Access' }))
    expect(screen.getByTestId('value')).toHaveTextContent('M300-P2-025')
  })

  it('narrows a long list as you type', async () => {
    render(<Harness />)
    await userEvent.click(screen.getByRole('combobox', { name: /Related to/ }))
    await userEvent.click(await screen.findByRole('option', { name: 'A programme' }))
    await userEvent.click(screen.getByRole('combobox', { name: 'Programme' }))
    await userEvent.type(screen.getByPlaceholderText('Search programmes…'), 'zzz')
    expect(screen.getByText('No matches')).toBeInTheDocument()
  })

  it('opens an existing entry on the right kind, showing its record', () => {
    render(<Harness initial="proj-1" />)
    expect(screen.getByRole('combobox', { name: 'Project' })).toHaveTextContent('Solar Hybrid Project')
  })

  it('keeps an older free-text reference visible instead of dropping it', () => {
    render(<Harness initial="the old reference" />)
    expect(screen.getByText(/Earlier reference kept as written: the old reference/)).toBeInTheDocument()
  })

  it('clears the record when the kind changes', async () => {
    render(<Harness initial="proj-1" />)
    await userEvent.click(screen.getByRole('combobox', { name: /Related to/ }))
    await userEvent.click(await screen.findByRole('option', { name: 'Nothing in particular' }))
    expect(screen.getByTestId('value')).toBeEmptyDOMElement()
  })
})
