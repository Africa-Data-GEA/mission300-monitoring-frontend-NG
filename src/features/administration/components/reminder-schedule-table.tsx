const SCHEDULE = [
  ['Submission waiting for review', 'After 3 days', 'Reviewers'],
  ['Still waiting', 'After 7 days', 'System administrators'],
  ['Data deadline approaching', '7 days and 1 day before', 'Provider'],
  ['Deadline missed', 'The day after, then weekly (up to 90 days)', 'Provider and system administrators'],
  ['Returned, not resubmitted', 'After 5 days', 'Whoever submitted it'],
  ['Still not resubmitted', 'After 10 days', 'System administrators'],
] as const

export function ReminderScheduleTable() {
  return (
    <div className="overflow-x-auto rounded-lg border border-border-default">
      <table className="w-full min-w-[520px] border-collapse text-left text-sm">
        <thead className="bg-surface-sunken text-xs font-medium text-text-muted">
          <tr>
            <th className="px-3 py-2.5">Situation</th>
            <th className="px-3 py-2.5">When</th>
            <th className="px-3 py-2.5">Who is reminded</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-default bg-surface-card">
          {SCHEDULE.map(([situation, when, who]) => (
            <tr key={situation}>
              <td className="px-3 py-2.5 font-medium text-text-default">{situation}</td>
              <td className="px-3 py-2.5 text-text-muted">{when}</td>
              <td className="px-3 py-2.5 text-text-muted">{who}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
