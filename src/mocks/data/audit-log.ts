import type { AuditEvent, AuditResult } from '@/api/schemas/administration'
import { administrationAuditLog, administrationUsers } from './administration'

/**
 * Shared write path onto `administrationAuditLog` — previously only the
 * Data Submissions → KPI Explorer publish flow wrote here, with its own
 * private id counter (see mocks/handlers/data-submissions.ts). Every module
 * that mutates something now goes through this one function instead, so ids
 * stay unique across modules and every handler doesn't need to reimplement
 * "find the user, build the event, unshift it."
 */
let nextAuditEventNumber = 1043

export function recordAuditEvent(input: {
  userId?: string
  userName?: string
  action: string
  module: string
  recordId?: string | null
  priorValue?: string | null
  newValue?: string | null
  result?: AuditResult
  reference?: string | null
}): void {
  const user = input.userId ? administrationUsers.find((entry) => entry.id === input.userId) : undefined

  nextAuditEventNumber += 1
  administrationAuditLog.unshift({
    id: `evt-${nextAuditEventNumber}`,
    timestamp: new Date().toISOString(),
    userId: user?.id ?? input.userId ?? administrationUsers[0]!.id,
    userName: user?.name ?? input.userName ?? administrationUsers[0]!.name,
    action: input.action,
    module: input.module,
    recordId: input.recordId ?? null,
    priorValue: input.priorValue ?? null,
    newValue: input.newValue ?? null,
    result: input.result ?? 'success',
    reference: input.reference ?? null,
  } satisfies AuditEvent)
}
