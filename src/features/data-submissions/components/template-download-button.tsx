import { useState } from 'react'
import { Download, LoaderCircle } from 'lucide-react'
import type { UploadDefinition } from '@/api/schemas/data-submissions'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api-client'
import { dashboardToast } from '@/lib/dashboard-toast'

export function TemplateDownloadButton({
  template,
  compact = false,
}: {
  template: UploadDefinition['template']
  compact?: boolean
}) {
  const [isDownloading, setIsDownloading] = useState(false)

  async function downloadTemplate() {
    if (isDownloading) return
    setIsDownloading(true)

    try {
      const blob = await api.download(template.downloadUrl)
      const objectUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = objectUrl
      anchor.download = template.fileName
      anchor.click()
      URL.revokeObjectURL(objectUrl)
      dashboardToast.success('Template downloaded')
    } catch (error) {
      dashboardToast.error('Download failed', {
        description: error instanceof Error ? error.message : 'Please try again.',
      })
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Button
      aria-label={compact ? `Download ${template.fileName}` : undefined}
      className={compact ? undefined : 'mt-4 w-full'}
      disabled={isDownloading}
      onClick={() => void downloadTemplate()}
      size={compact ? 'icon' : 'md'}
      type="button"
      variant={compact ? 'ghost' : 'secondary'}
    >
      {isDownloading ? <LoaderCircle className="animate-spin" /> : <Download />}
      {!compact && (isDownloading ? 'Downloading…' : 'Download template')}
    </Button>
  )
}
