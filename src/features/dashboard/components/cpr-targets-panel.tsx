import type { CprTarget } from '../types'

// Keep the component API while the caption is hidden from Executive Overview.
export function CprTargetsPanel({ targets }: { targets: readonly CprTarget[] }) {
  void targets
  return null
}
