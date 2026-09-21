import { Component, type ReactNode } from 'react'

interface SafeSectionProps {
  render: () => ReactNode
}

interface SafeSectionState {
  failed: boolean
}

function Rendered({ render }: SafeSectionProps) {
  return <>{render()}</>
}

export class SafeSection extends Component<SafeSectionProps, SafeSectionState> {
  state: SafeSectionState = { failed: false }

  static getDerivedStateFromError(): SafeSectionState {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error('Public section failed to render', error)
  }

  render() {
    if (this.state.failed) return null
    return <Rendered render={this.props.render} />
  }
}
