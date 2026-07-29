import { PROGRAM_TYPE_LABELS, type ProjectRecord } from '@/api/schemas/programs'
import { ProfileField } from '@/components/ui/profile-field'
import { formatDate } from '@/lib/format'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

/** Description, location, funding and timeline. */
export function OverviewPanel({ project }: { project: ProjectRecord }) {
  return (
    <section className="rounded-control bg-surface-sunken p-4">
      <h3 className="text-sm font-semibold text-text-default">Overview</h3>
      <p className="mt-2 text-sm text-text-muted">{project.profile.description}</p>

      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <ProfileField label="Owner" value={project.owner} />
        <ProfileField label="Location" value={`${project.location} · ${project.coverage}`} />
        <ProfileField label="Program type" value={PROGRAM_TYPE_LABELS[project.programType]} />
        <ProfileField
          label="Timeline"
          value={`${formatDate(project.startDate)} – ${formatDate(project.endDate)} (projected completion)`}
        />
        <ProfileField label="Funding sources" value={project.fundingSource ?? 'Not yet secured'} />
        <ProfileField label="Funding structure" value={project.fundingStructure} />
        <ProfileField label="Funding size" value={currency.format(project.profile.budgetUsd)} />
        <ProfileField label="Disbursed" value={currency.format(project.profile.disbursedUsd)} />
        <ProfileField label="Contractor" value={project.profile.contractor ?? 'Not yet appointed'} />
        <ProfileField
          label="Contact"
          value={`${project.profile.contactName} · ${project.profile.contactEmail}`}
        />
        <ProfileField label="Comment – issues/main risk/bottlenecks" value={project.comment || 'None'} block />
        <ProfileField label="Suggestion" value={project.suggestion || 'None'} block />
      </dl>
    </section>
  )
}
