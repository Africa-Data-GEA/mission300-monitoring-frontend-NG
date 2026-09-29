import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { StateDiscoPage } from '@/features/state-disco/pages/state-disco-page'
import { renderRoutesWithProviders } from '@/test/render'

describe('State & DisCo page', () => {
  it('keeps comparison and supply while delivery and coverage sections are hidden', async () => {
    renderRoutesWithProviders([{ path: 'state-disco', element: <StateDiscoPage /> }], {
      route: '/state-disco',
    })

    expect(await screen.findByRole('table', {
      name: /Distribution Company customers and metering/i,
    })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Supply & tariff' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Delivery & compliance' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'State delivery coverage' })).toBeNull()
  })
})
