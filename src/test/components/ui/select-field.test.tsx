import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SelectField } from '@/components/ui/select-field'

const options = [
  { value: 'q3-2025', label: 'Q3 2025' },
  { value: 'q2-2025', label: 'Q2 2025' },
  { value: 'fy-2025', label: 'FY 2025' },
]

function renderField(overrides: Partial<Parameters<typeof SelectField>[0]> = {}) {
  const onChange = vi.fn()
  render(
    <SelectField
      label="Reporting period"
      value="q3-2025"
      options={options}
      onChange={onChange}
      {...overrides}
    />,
  )
  return { onChange }
}

describe('SelectField', () => {
  it('renders the visible label', () => {
    renderField()

    expect(screen.getByText('Reporting period')).toBeInTheDocument()
  })

  it('exposes a combobox associated with its label', () => {
    renderField()

    expect(
      screen.getByRole('combobox', { name: /Reporting period/ }),
    ).toBeInTheDocument()
  })

  it('displays the currently selected option', () => {
    renderField()

    expect(screen.getByRole('combobox')).toHaveTextContent('Q3 2025')
  })

  it('shows the placeholder when nothing is selected', () => {
    renderField({ value: '', placeholder: 'Choose a period' })

    expect(screen.getByRole('combobox')).toHaveTextContent('Choose a period')
  })

  it('does not render options until opened', () => {
    renderField()

    expect(screen.queryByRole('option')).not.toBeInTheDocument()
  })

  it('renders every option once opened', async () => {
    const user = userEvent.setup()
    renderField()

    await user.click(screen.getByRole('combobox'))

    const listbox = await screen.findByRole('listbox')
    expect(within(listbox).getAllByRole('option')).toHaveLength(3)
  })

  it('emits the selected value on change', async () => {
    const user = userEvent.setup()
    const { onChange } = renderField()

    await user.click(screen.getByRole('combobox'))
    await user.click(await screen.findByRole('option', { name: 'FY 2025' }))

    expect(onChange).toHaveBeenCalledExactlyOnceWith('fy-2025')
  })

  it('marks the active option as selected for assistive technology', async () => {
    const user = userEvent.setup()
    renderField()

    await user.click(screen.getByRole('combobox'))

    expect(
      await screen.findByRole('option', { name: 'Q3 2025', selected: true }),
    ).toBeInTheDocument()
  })

  describe('keyboard operation', () => {
    it('is reachable by Tab', async () => {
      const user = userEvent.setup()
      renderField()

      await user.tab()

      expect(screen.getByRole('combobox')).toHaveFocus()
    })

    it('opens with Enter', async () => {
      const user = userEvent.setup()
      renderField()

      await user.tab()
      await user.keyboard('{Enter}')

      expect(await screen.findByRole('listbox')).toBeInTheDocument()
    })

    it('closes with Escape without emitting a change', async () => {
      const user = userEvent.setup()
      const { onChange } = renderField()

      await user.click(screen.getByRole('combobox'))
      expect(await screen.findByRole('listbox')).toBeInTheDocument()

      await user.keyboard('{Escape}')

      expect(screen.queryByRole('listbox')).not.toBeInTheDocument()
      expect(onChange).not.toHaveBeenCalled()
    })
  })

  it('gives each instance a unique trigger id so labels do not collide', () => {
    render(
      <>
        <SelectField
          label="Period"
          value="q3-2025"
          options={options}
          onChange={vi.fn()}
        />
        <SelectField
          label="Institution"
          value="q3-2025"
          options={options}
          onChange={vi.fn()}
        />
      </>,
    )

    const [first, second] = screen.getAllByRole('combobox')
    expect(first!.id).not.toBe(second!.id)
  })

  it('renders without options without crashing', async () => {
    const user = userEvent.setup()
    renderField({ options: [], value: '' })

    await user.click(screen.getByRole('combobox'))

    expect(screen.queryAllByRole('option')).toHaveLength(0)
  })
})
