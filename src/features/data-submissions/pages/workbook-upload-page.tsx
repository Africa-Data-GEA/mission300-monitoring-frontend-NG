import { CheckCircle2, Download, LoaderCircle, Upload } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router'
import type { WorkbookUploadResult } from '@/api/schemas/data-submissions'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { SearchableSelect } from '@/components/ui/searchable-select'
import { api } from '@/lib/api-client'
import { dashboardToast } from '@/lib/dashboard-toast'
import { readAuthSession } from '@/features/auth/auth-session'
import { grantedRoles } from '@/features/auth/role-access'
import { useSubmissionFilters, useWorkbookUpload } from '../api'
import { WorkbookResultsCard } from '../components/workbook-results-card'
import { WorkflowShell } from '../components/workflow-shell'

export function WorkbookUploadPage() {
  const upload = useWorkbookUpload()
  const session = readAuthSession()
  const isAdmin = !!session && grantedRoles(session.user).includes('system-administrator')
  const filters = useSubmissionFilters()
  const institutions = (filters.data?.institutions ?? []).filter((option) => option.value !== 'all')
  const [institution, setInstitution] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [sourceReference, setSourceReference] = useState('')
  const [notes, setNotes] = useState('')
  const [result, setResult] = useState<WorkbookUploadResult | null>(null)
  const [received, setReceived] = useState<WorkbookUploadResult | null>(null)
  const [downloading, setDownloading] = useState(false)

  async function download() {
    setDownloading(true)
    try {
      const blob = await api.download(`/data-submissions/workbook-template${isAdmin ? `?institution=${encodeURIComponent(institution)}` : ''}`)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = 'M300-submission-workbook.xlsx'
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (error) {
      dashboardToast.error('Download failed', { description: error instanceof Error ? error.message : 'Please try again.' })
    } finally {
      setDownloading(false)
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    if (!file) return
    const body = new FormData()
    body.append('file', file)
    body.append('sourceReference', sourceReference)
    body.append('notes', notes)
    if (isAdmin) body.append('institutionId', institution)
    try {
      const outcome = await upload.mutateAsync(body)
      if (outcome.accepted.length > 0) {
        setReceived(outcome)
        setResult(null)
        setFile(null)
        setSourceReference('')
        setNotes('')
        return
      }
      setResult(outcome)
      if (outcome.status === 'complete') dashboardToast.success('Workbook submitted', { description: outcome.message })
      else if (outcome.status === 'unchanged') dashboardToast.info('Nothing new to submit', { description: outcome.message })
      else if (outcome.status === 'partial') dashboardToast.warning('Some sheets were refused', { description: outcome.message })
      else dashboardToast.error('No sheet was submitted', { description: outcome.message })
    } catch (error) {
      dashboardToast.error('Upload failed', { description: error instanceof Error ? error.message : 'Please try again.' })
    }
  }

  if (received) {
    const accepted = received.accepted.reduce((total, sheet) => total + sheet.submissions, 0)
    return (
      <WorkflowShell title="Submission received" description="Thank you. Your data is now with the reviewers.">
        <Card className="mx-auto flex w-full max-w-2xl flex-col items-center gap-3 p-8 text-center">
          <CheckCircle2 className="size-12 text-status-on-track" aria-hidden="true" />
          <h2 className="text-xl font-semibold text-text-default">We received your submission</h2>
          <p className="text-sm text-text-muted">
            {accepted} submission{accepted === 1 ? '' : 's'} from {received.accepted.length} sheet{received.accepted.length === 1 ? '' : 's'} went to review. Nothing is published until a reviewer approves it.
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <Button asChild>
              <Link to="/data-submissions/submissions">View submission history</Link>
            </Button>
            <Button variant="secondary" type="button" onClick={() => setReceived(null)}>
              Upload another workbook
            </Button>
          </div>
        </Card>
        {received.rejected.length > 0 && (
          <div className="mx-auto mt-4 w-full max-w-2xl">
            <WorkbookResultsCard result={{ ...received, accepted: [], skipped: [] }} />
          </div>
        )}
      </WorkflowShell>
    )
  }

  return (
    <WorkflowShell
      title="Upload submission workbook"
      description="One workbook, one sheet per dataset. Sheets that pass are submitted; sheets with errors are refused and named so you can fix them and upload the same workbook again."
    >
      <div className="grid gap-4 lg:grid-cols-[1fr_24rem]">
        <Card className="p-5">
          <form onSubmit={(event) => void submit(event)}>
            {isAdmin && (
              <div className="mb-4">
                <span className="block text-sm font-medium" id="workbook-institution-label">Institution *</span>
                <SearchableSelect
                  aria-labelledby="workbook-institution-label"
                  className="mt-1.5 h-10"
                  value={institution}
                  options={institutions}
                  onChange={setInstitution}
                  placeholder="Choose the institution this workbook is for"
                  searchPlaceholder="Search institutions…"
                />
              </div>
            )}
            <Button type="button" variant="secondary" disabled={downloading || (isAdmin && !institution)} onClick={() => void download()}>
              {downloading ? <LoaderCircle className="animate-spin" /> : <Download />}
              Download workbook template
            </Button>
            <label
              className="mt-5 block cursor-pointer rounded-card border border-dashed border-border-strong bg-surface-sunken p-8 text-center transition-colors hover:bg-surface"
              htmlFor="workbook-file"
            >
              <Upload className="mx-auto size-8 text-text-muted" aria-hidden="true" />
              <span className="mt-3 block font-medium">Choose the completed workbook</span>
              <span className="mt-1 block text-sm text-text-muted">.xlsx; maximum 20 MB. Leave a sheet empty to skip it.</span>
              <input
                id="workbook-file"
                type="file"
                required
                accept=".xlsx"
                onChange={(event) => {
                  setResult(null)
                  setFile(event.target.files?.[0] ?? null)
                }}
                className="sr-only"
              />
              <span className="mt-3 block text-sm font-medium">{file ? file.name : 'No file chosen'}</span>
            </label>
            <label className="mt-5 block text-sm font-medium" htmlFor="workbook-source">
              Source reference *
              <input
                id="workbook-source"
                required
                value={sourceReference}
                onChange={(event) => setSourceReference(event.target.value)}
                className="mt-1.5 h-10 w-full rounded-control border border-border-default px-3"
              />
            </label>
            <label className="mt-4 block text-sm font-medium" htmlFor="workbook-notes">
              Notes
              <textarea
                id="workbook-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="mt-1.5 min-h-24 w-full rounded-control border border-border-default px-3 py-2"
              />
            </label>
            <Button className="mt-5" type="submit" disabled={!file || upload.isPending || (isAdmin && !institution)}>
              {upload.isPending ? <LoaderCircle className="animate-spin" /> : <Upload />}
              Upload workbook
            </Button>
          </form>
        </Card>
        {result && <WorkbookResultsCard result={result} />}
      </div>
    </WorkflowShell>
  )
}
