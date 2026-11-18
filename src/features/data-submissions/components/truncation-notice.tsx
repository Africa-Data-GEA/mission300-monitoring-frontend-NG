export function TruncationNotice({ shown, total }: { shown: number; total: number }) {
  if (total <= shown) return null

  return (
    <p role="status" className="mt-3 text-xs text-status-at-risk">
      Showing the first {shown} of {total} records. Use the link above for the complete list.
    </p>
  )
}
