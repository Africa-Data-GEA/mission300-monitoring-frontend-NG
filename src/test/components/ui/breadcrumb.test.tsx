import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { renderWithRouter } from '@/test/render'

describe('Breadcrumb', () => {
  it('is exposed as a breadcrumb navigation landmark', () => {
    renderWithRouter(<Breadcrumb items={[{ label: 'Executive Overview' }]} />)

    expect(
      screen.getByRole('navigation', { name: 'Breadcrumb' }),
    ).toBeInTheDocument()
  })

  it('renders every segment', () => {
    renderWithRouter(
      <Breadcrumb
        items={[
          { label: 'Monitoring & Analysis' },
          { label: 'Executive Overview' },
        ]}
      />,
    )

    expect(screen.getByText('Monitoring & Analysis')).toBeInTheDocument()
    expect(screen.getByText('Executive Overview')).toBeInTheDocument()
  })

  /*
   * The wireframe shows each segment inside a grey chip rather than as plain
   * inline text.
   */
  it('gives each segment a chip background', () => {
    renderWithRouter(
      <Breadcrumb
        items={[{ label: 'Monitoring & Analysis' }, { label: 'Executive Overview' }]}
      />,
    )

    expect(screen.getByText('Monitoring & Analysis')).toHaveClass(
      'bg-surface-sunken',
    )
    expect(screen.getByText('Executive Overview')).toHaveClass(
      'bg-surface-sunken',
    )
  })

  it('marks the final segment as the current page', () => {
    renderWithRouter(
      <Breadcrumb
        items={[{ label: 'Monitoring & Analysis' }, { label: 'Executive Overview' }]}
      />,
    )

    expect(screen.getByText('Executive Overview')).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('does not mark earlier segments as current', () => {
    renderWithRouter(
      <Breadcrumb
        items={[{ label: 'Monitoring & Analysis' }, { label: 'Executive Overview' }]}
      />,
    )

    expect(screen.getByText('Monitoring & Analysis')).not.toHaveAttribute(
      'aria-current',
    )
  })

  it('links segments that supply a route', () => {
    renderWithRouter(
      <Breadcrumb
        items={[
          { label: 'Monitoring & Analysis', to: '/' },
          { label: 'Executive Overview' },
        ]}
      />,
    )

    expect(
      screen.getByRole('link', { name: 'Monitoring & Analysis' }),
    ).toHaveAttribute('href', '/')
  })

  /*
   * The current page is where the user already is, so linking it would be a
   * no-op that adds noise to a screen reader's link list.
   */
  it('never links the final segment, even when given a route', () => {
    renderWithRouter(
      <Breadcrumb
        items={[
          { label: 'Monitoring & Analysis', to: '/' },
          { label: 'Executive Overview', to: '/' },
        ]}
      />,
    )

    expect(screen.getAllByRole('link')).toHaveLength(1)
    expect(
      screen.queryByRole('link', { name: 'Executive Overview' }),
    ).not.toBeInTheDocument()
  })

  it('renders separators between segments but not after the last', () => {
    renderWithRouter(
      <Breadcrumb
        items={[
          { label: 'A' },
          { label: 'B' },
          { label: 'C' },
        ]}
      />,
    )

    expect(screen.getAllByText('/')).toHaveLength(2)
  })

  it('hides separators from assistive technology', () => {
    renderWithRouter(
      <Breadcrumb items={[{ label: 'A' }, { label: 'B' }]} />,
    )

    expect(screen.getByText('/')).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders a single segment without a separator', () => {
    renderWithRouter(<Breadcrumb items={[{ label: 'Only' }]} />)

    expect(screen.queryByText('/')).not.toBeInTheDocument()
  })
})
