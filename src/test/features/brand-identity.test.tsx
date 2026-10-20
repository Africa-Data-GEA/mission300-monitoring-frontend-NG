import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useBrandIdentity } from '@/features/branding/use-brand-identity'
import { renderWithProviders } from '@/test/render'

function Probe() {
  const identity = useBrandIdentity()
  return (
    <p data-testid="identity">
      {identity.country}|{identity.officialName}|{identity.agencyName}|{identity.crestUrl}|{identity.title}
    </p>
  )
}

describe('useBrandIdentity', () => {
  it('gives the saved identity, with the built-in crest when none is uploaded', async () => {
    renderWithProviders(<Probe />)
    expect(await screen.findByText(/Nigeria\|Federal Republic of Nigeria\|Federal Ministry of Power\|\/Logos\/geapp\.png\|Nigeria Mission 300/)).toBeInTheDocument()
  })
})
