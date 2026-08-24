/** Lets React commit the pending state before the network request begins. */
export function showPendingState(): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, 0))
}
