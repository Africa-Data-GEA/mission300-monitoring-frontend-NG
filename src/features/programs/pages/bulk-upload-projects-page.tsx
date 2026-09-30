import { AlertTriangle, CheckCircle2, Download, LoaderCircle, Upload } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { BulkUploadResult } from '@/api/schemas/programs'
import { ApiError, api } from '@/lib/api-client'
import { dashboardToast } from '@/lib/dashboard-toast'
import {
  BULK_UPLOAD_TEMPLATE_FILE_NAME,
  BULK_UPLOAD_TEMPLATE_URL,
} from '../lib/project-admin-api'
import { useBulkUploadProjects } from '../api'

/**
 * Bulk-add programmes and projects from one Excel template, instead of the
 * one-at-a-time forms (AddProgrammePage/AddProjectPage). One flat sheet: a
 * row is a project, with its parent programme's own fields repeated on every
 * row that names it — see the backend's programs-bulk-upload.ts for exactly
 * how that's reconciled. An upload is an upsert: a programme or project whose
 * name already matches gets updated rather than duplicated.
 */
export function BulkUploadProjectsPage() {
  const navigate = useNavigate()
  const [file, setFile] = useState<File | null>(null)
  const [previewOnly, setPreviewOnly] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [result, setResult] = useState<BulkUploadResult | null>(null)
  const upload = useBulkUploadProjects()

  async function downloadTemplate() {
    if (isDownloading) return
    setIsDownloading(true)
    try {
      const blob = await api.download(BULK_UPLOAD_TEMPLATE_URL)
      const objectUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = objectUrl
      anchor.download = BULK_UPLOAD_TEMPLATE_FILE_NAME
      anchor.click()
      URL.revokeObjectURL(objectUrl)
    } catch (error) {
      dashboardToast.error('Download failed', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    } finally {
      setIsDownloading(false)
    }
  }

  function submitUpload(dryRun: boolean) {
    if (!file) return
    setResult(null)
    upload.mutate(
      { file, dryRun },
      {
        onSuccess: (response) => {
          setResult(response)
          // A preview's file stays selected, so "Confirm & upload" below can
          // resubmit it for real without asking the person to re-pick it.
          if (!dryRun) setFile(null)
          if (response.errorCount === 0 && !dryRun) dashboardToast.success(response.message)
        },
        onError: (error) => {
          dashboardToast.error(dryRun ? 'Preview failed' : 'Upload failed', {
            description: error instanceof ApiError ? error.message : 'Please try again.',
          })
        },
      },
    )
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <Breadcrumb
        items={[
          { label: 'Delivery tracking' },
          { label: 'Programs', to: '/programs' },
          { label: 'Bulk upload' },
        ]}
      />

      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-text-default">
          Bulk upload programs & projects
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Add or update several programmes and projects at once from one completed Excel
          template, instead of the one-at-a-time forms.
        </p>
      </div>

      <Card className="mx-auto w-full max-w-3xl p-4 sm:p-6">
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-text-default">1. Download the template</h2>
            <p className="text-sm text-text-muted">
              Every row is a project. Fill in that project&apos;s programme columns too — the
              first row naming a programme sets its details; later rows for the same programme
              only need the name to match.
            </p>
            <Button
              type="button"
              variant="secondary"
              disabled={isDownloading}
              onClick={() => void downloadTemplate()}
              className="w-fit"
            >
              {isDownloading ? <LoaderCircle className="animate-spin" /> : <Download />}
              {isDownloading ? 'Downloading…' : 'Download template'}
            </Button>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-sm font-semibold text-text-default">2. Upload the completed file</h2>
            <div className="rounded-card border border-dashed border-border-strong bg-surface-sunken p-8 text-center">
              <Upload className="mx-auto size-8 text-text-muted" aria-hidden="true" />
              <label className="mt-3 block font-medium" htmlFor="bulk-upload-file">
                Choose the completed template
              </label>
              <p className="mt-1 text-sm text-text-muted">.xlsx or .csv; maximum 20 MB</p>
              <input
                id="bulk-upload-file"
                type="file"
                accept=".xlsx,.csv"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                className="mx-auto mt-4 block max-w-full text-sm"
              />
              {file && <p className="mt-3 text-sm font-medium">{file.name}</p>}
            </div>

            <label className="flex w-fit items-center gap-2 text-sm text-text-default">
              <input
                type="checkbox"
                checked={previewOnly}
                onChange={(event) => setPreviewOnly(event.target.checked)}
                className="size-4 rounded border-border-default"
              />
              Preview only — check what would happen without saving anything
            </label>

            <Button
              type="button"
              disabled={!file || upload.isPending}
              onClick={() => submitUpload(previewOnly)}
              className="w-fit"
            >
              {upload.isPending ? <LoaderCircle className="animate-spin" /> : <Upload />}
              {upload.isPending ? (previewOnly ? 'Previewing…' : 'Uploading…') : previewOnly ? 'Preview' : 'Upload'}
            </Button>
          </section>

          {result && (
            <section className="flex flex-col gap-3 rounded-card border border-border-default p-4">
              {result.dryRun && (
                <div className="rounded-control bg-surface-sunken px-3 py-2 text-xs font-semibold tracking-wide text-text-muted uppercase">
                  Preview — nothing has been saved yet
                </div>
              )}
              <div className="flex items-start gap-2">
                {result.errorCount === 0 ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-status-on-track" aria-hidden="true" />
                ) : (
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-status-lagging" aria-hidden="true" />
                )}
                <p className="text-sm font-medium text-text-default">{result.message}</p>
              </div>

              <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-text-muted">Programmes created</dt>
                  <dd className="font-semibold">{result.programmesCreated}</dd>
                </div>
                <div>
                  <dt className="text-text-muted">Programmes updated</dt>
                  <dd className="font-semibold">{result.programmesUpdated}</dd>
                </div>
                <div>
                  <dt className="text-text-muted">Projects created</dt>
                  <dd className="font-semibold">{result.projectsCreated}</dd>
                </div>
                <div>
                  <dt className="text-text-muted">Projects updated</dt>
                  <dd className="font-semibold">{result.projectsUpdated}</dd>
                </div>
              </dl>

              {result.errors.length > 0 && (
                <div className="mt-1 overflow-hidden rounded-control border border-border-default">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-surface-sunken text-xs font-semibold text-text-muted uppercase">
                      <tr>
                        <th className="px-3 py-2">Row</th>
                        <th className="px-3 py-2">Problem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.errors.map((issue) => (
                        <tr key={issue.row} className="border-t border-border-default">
                          <td className="px-3 py-2 font-medium">{issue.row}</td>
                          <td className="px-3 py-2 text-text-muted">{issue.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {result.dryRun && file && (
                  <Button
                    type="button"
                    disabled={upload.isPending}
                    onClick={() => {
                      setPreviewOnly(false)
                      submitUpload(false)
                    }}
                    className="w-fit"
                  >
                    {upload.isPending ? <LoaderCircle className="animate-spin" /> : <Upload />}
                    Confirm & upload
                  </Button>
                )}
                <Button
                  type="button"
                  variant="secondary"
                  className="w-fit"
                  onClick={() => navigate('/programs')}
                >
                  Back to Programs
                </Button>
              </div>
            </section>
          )}
        </div>
      </Card>
    </div>
  )
}
