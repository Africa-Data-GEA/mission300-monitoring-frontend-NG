import { useSecuritySettings, useUpdateSecuritySettings } from '../api'

export function SecurityPolicyControl() {
  const settings = useSecuritySettings()
  const update = useUpdateSecuritySettings()

  return (
    <section className="mt-5 border-t border-border-default pt-5" aria-label="Review policy">
      <h3 className="font-semibold text-text-default">Review policy</h3>
      <p className="mt-1 text-sm text-text-muted">
        Decide whether an account that has both provider and reviewer/validator roles may review its own submission.
      </p>
      {settings.isPending ? <p className="mt-3 text-sm">Loading policy…</p> : settings.isError ? (
        <p className="mt-3 text-sm text-status-at-risk" role="alert">Could not load the review policy.</p>
      ) : (
        <label className="mt-3 flex items-center gap-2 text-sm text-text-default">
          <input type="checkbox" checked={settings.data?.allowSelfReview ?? false}
            disabled={update.isPending}
            onChange={(event) => update.mutate(event.target.checked)} />
          Allow users to review their own submissions
        </label>
      )}
      {update.isError && <p role="alert" className="mt-2 text-sm text-status-at-risk">Could not save the review policy.</p>}
      {update.isSuccess && <p role="status" className="mt-2 text-sm text-brand-700">Review policy saved.</p>}
    </section>
  )
}
