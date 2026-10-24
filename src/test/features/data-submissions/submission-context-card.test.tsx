import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SubmissionContextCard } from '@/features/data-submissions/pages/submission-context-card'

const DRAFT = {
  values: { f1: '61.7' },
  rows: null,
  sourceReference: '',
  notes: '',
  savedAt: '2026-10-23T10:00:00.000Z',
  savedBy: 'Seed Data Provider',
}

function renderCard(overrides: Partial<Parameters<typeof SubmissionContextCard>[0]> = {}) {
  const props = {
    institution: 'Sample DisCo',
    dataset: 'Quarterly Electricity Access Expansion',
    reportingPeriod: 'Q3 2025',
    isSaving: false,
    draft: null,
    isSavingDraft: false,
    isDiscardingDraft: false,
    onSaveDraft: vi.fn(),
    onDiscardDraft: vi.fn(),
    ...overrides,
  }
  render(
    <form>
      <SubmissionContextCard {...props} />
    </form>,
  )
  return props
}

describe('SubmissionContextCard', () => {
  it('offers Save draft apart from Submit for review', async () => {
    const props = renderCard()
    await userEvent.click(screen.getByRole('button', { name: 'Save draft' }))
    expect(props.onSaveDraft).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Submit for review' })).toHaveAttribute('type', 'submit')
    expect(screen.getByRole('button', { name: 'Save draft' })).toHaveAttribute('type', 'button')
  })

  it('shows nothing about a draft when none exists', () => {
    renderCard()
    expect(screen.queryByText('Draft saved, not submitted')).toBeNull()
  })

  it('shows a saved draft as not submitted, and can discard it', async () => {
    const props = renderCard({ draft: DRAFT })
    expect(screen.getByText('Draft saved, not submitted')).toBeInTheDocument()
    expect(screen.getByText(/Seed Data Provider/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Discard draft' }))
    expect(props.onDiscardDraft).toHaveBeenCalledTimes(1)
  })

  it('blocks both actions while either is running', () => {
    renderCard({ isSavingDraft: true })
    expect(screen.getByRole('button', { name: 'Saving draft…' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Submit for review' })).toBeDisabled()
  })
})
