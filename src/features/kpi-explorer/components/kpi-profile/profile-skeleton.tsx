import { Skeleton } from '@/components/ui/skeleton'

/** Loading placeholder shown while an indicator's profile is fetched. */
export function ProfileSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading profile"
      className="flex flex-col gap-4"
    >
      <Skeleton className="h-16 w-full rounded-control" />
      <Skeleton className="h-40 w-full rounded-control" />
      <Skeleton className="h-32 w-full rounded-control" />
    </div>
  )
}
