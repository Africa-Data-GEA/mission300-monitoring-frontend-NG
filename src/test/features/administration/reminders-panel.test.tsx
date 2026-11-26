import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { RemindersPanel } from '@/features/administration/components/reminders-panel'
import { server } from '@/mocks/server'
import { renderWithProviders } from '@/test/render'

const overview = (enabled: boolean) => ({
  enabled,
  updatedByName: null,
  updatedAt: null,
  lastRunAt: null,
  lastSent: 0,
  lastFailed: 0,
  emailConfigured: true,
  recipients: [
    {
      name: 'Sample Reviewer',
      email: 'reviewer@example.org',
      items: [{ section: 'review-waiting', text: 'NERC: DisCo Energy Billed, waiting 4 days' }],
    },
  ],
})

describe('RemindersPanel', () => {
  it('shows who would be reminded and asks before switching on', async () => {
    let saved: unknown
    server.use(
      http.get('*/notification-reminders', () => HttpResponse.json(overview(false))),
      http.put('*/notification-reminders', async ({ request }) => {
        saved = await request.json()
        return HttpResponse.json(overview(true))
      }),
    )
    const user = userEvent.setup()
    renderWithProviders(<RemindersPanel />)

    expect(await screen.findByText('Data reminders are off')).toBeInTheDocument()
    expect(screen.getByText('Sample Reviewer')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Switch on' }))
    expect(saved).toBeUndefined()
    const dialog = screen.getByRole('alertdialog')
    await user.click(
      screen.getAllByRole('button', { name: 'Switch on' }).find((button) => dialog.contains(button))!,
    )

    expect(await screen.findByText('Data reminders are on')).toBeInTheDocument()
    expect(saved).toEqual({ enabled: true })
  })
})
