import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it } from 'vitest'
import { SearchableSelect } from '@/components/ui/searchable-select'

const OPTIONS = [
  { value: 'a', label: 'Energizing Education Programme' },
  { value: 'b', label: 'Presidential Power Initiative' },
  { value: 'c', label: 'NISO Systems Planning Directorate' },
]

function Harness({ initial = '' }: { initial?: string }) {
  const [value, setValue] = useState(initial)
  return (
    <>
      <SearchableSelect value={value} options={OPTIONS} onChange={setValue} placeholder="Select a programme" />
      <p data-testid="value">{value}</p>
    </>
  )
}

describe('SearchableSelect', () => {
  it('shows the placeholder until something is chosen', () => {
    render(<Harness />)
    expect(screen.getByRole('combobox')).toHaveTextContent('Select a programme')
  })

  it('lists every option when opened', async () => {
    render(<Harness />)
    await userEvent.click(screen.getByRole('combobox'))
    expect(screen.getAllByRole('option')).toHaveLength(3)
  })

  it('narrows the list as you type, ignoring case', async () => {
    render(<Harness />)
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.type(screen.getByPlaceholderText('Search…'), 'presidential')
    expect(screen.getAllByRole('option')).toHaveLength(1)
    expect(screen.getByRole('option')).toHaveTextContent('Presidential Power Initiative')
  })

  it('says when nothing matches', async () => {
    render(<Harness />)
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.type(screen.getByPlaceholderText('Search…'), 'zzz')
    expect(screen.queryAllByRole('option')).toHaveLength(0)
    expect(screen.getByText('No matches')).toBeInTheDocument()
  })

  it('selects an option by click and shows its label', async () => {
    render(<Harness />)
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.click(screen.getByRole('option', { name: 'NISO Systems Planning Directorate' }))
    expect(screen.getByTestId('value')).toHaveTextContent('c')
    expect(screen.getByRole('combobox')).toHaveTextContent('NISO Systems Planning Directorate')
  })

  it('selects with the keyboard: arrow down then Enter', async () => {
    render(<Harness />)
    await userEvent.click(screen.getByRole('combobox'))
    await userEvent.keyboard('{ArrowDown}{Enter}')
    expect(screen.getByTestId('value')).toHaveTextContent('b')
  })
})
