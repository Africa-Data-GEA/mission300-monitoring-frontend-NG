import { fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { BottlenecksTable } from '@/features/dashboard/components/bottlenecks-table'
import { deleteBottleneck } from '@/features/bottlenecks/api'
import { readAuthSession } from '@/features/auth/auth-session'
import { executiveOverview } from '@/mocks/data/executive-overview'
import { renderWithRouter } from '@/test/render'

vi.mock('@/features/bottlenecks/api', () => ({ deleteBottleneck: vi.fn() }))
vi.mock('@/features/auth/auth-session', () => ({ readAuthSession: vi.fn() }))
const issue = executiveOverview.deliveryStatus.exceptions[0]!

afterEach(() => vi.restoreAllMocks())

function renderTable(role: string) {
  vi.mocked(readAuthSession).mockReturnValue({
    accessToken: 'test-token',
    user: { id: 'user-1', name: 'Test User', email: 'test@example.com', role },
  })
  const onChanged = vi.fn()
  renderWithRouter(<BottlenecksTable exceptions={[issue]} onChanged={onChanged} />)
  return onChanged
}

describe('Dashboard issue deletion', () => {
  it('hides deletion from read-only users', () => {
    renderTable('read-only-user')
    expect(screen.queryByRole('button', { name: /^Delete issue:/ })).not.toBeInTheDocument()
  })

  it('does not delete when confirmation is cancelled', () => {
    renderTable('system-administrator')
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    fireEvent.click(screen.getByRole('button', { name: /^Delete issue:/ }))
    expect(deleteBottleneck).not.toHaveBeenCalled()
  })

  it('deletes the selected issue and refreshes the dashboard after success', async () => {
    const onChanged = renderTable('dashboard-manager')
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.mocked(deleteBottleneck).mockResolvedValue(undefined)
    fireEvent.click(screen.getByRole('button', { name: /^Delete issue:/ }))
    await waitFor(() => expect(onChanged).toHaveBeenCalledOnce())
    expect(deleteBottleneck).toHaveBeenCalledWith(issue.id)
  })

  it('keeps the row and displays a failed-delete error', async () => {
    const onChanged = renderTable('system-administrator')
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.mocked(deleteBottleneck).mockRejectedValue(new Error('Unavailable'))
    fireEvent.click(screen.getByRole('button', { name: /^Delete issue:/ }))
    expect(await screen.findByRole('alert')).toHaveTextContent('could not be deleted')
    expect(onChanged).not.toHaveBeenCalled()
    expect(screen.getByText(issue.title)).toBeInTheDocument()
  })
});
