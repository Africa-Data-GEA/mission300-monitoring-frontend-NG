import { z } from 'zod'
import { metricProvenanceSchema } from './common'
import { filterOptionSchema } from './filters'

/**
 * Contract for the User Access and Administration module.
 *
 * Specification: docs/specs/user-access-administration.md
 *
 * Note this module is deliberately unlike the Executive Overview: it is
 * account and permission administration, not performance measurement. The
 * specification says so explicitly — "These cards summarise account and
 * permission administration. They are not performance targets."
 */

/* ------------------------------------------------------------------ *
 * Shared pagination envelope
 *
 * Defined once here because the Implementation Register, KPI Explorer, State
 * and DisCo performance and Data Submissions modules will all need the same
 * shape. Agreeing one convention now avoids four inconsistent ones later.
 * ------------------------------------------------------------------ */
export function paginated<T extends z.ZodType>(item: T) {
  return z.object({
    items: z.array(item),
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
    /** Total matching records across all pages, not the length of `items`. */
    total: z.number().int().min(0),
  })
}

export const paginationQuerySchema = z.object({
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(200).optional(),
})

/* ------------------------------------------------------------------ *
 * Vocabulary
 * ------------------------------------------------------------------ */

export const accountStatusSchema = z.enum([
  'active',
  'pending',
  'inactive',
  'suspended',
])

/**
 * The seven permissions in the specification's matrix.
 *
 * Stored independently of a user's official job designation, and applied on a
 * least-privilege basis — the specification is explicit about both.
 */
export const permissionSchema = z.enum([
  'view',
  'submit',
  'edit',
  'validate',
  'approve',
  'export',
  'administer',
])

/** The seven recommended system roles named in the specification. */
export const systemRoleSchema = z.enum([
  'system-administrator',
  'institutional-data-provider',
  'data-reviewer',
  'validator',
  'dashboard-manager',
  'oversight-user',
  'read-only-user',
])

/** Scope levels a user's responsibilities can be pinned to. */
export const scopeLevelSchema = z.enum([
  'national',
  'state',
  'distribution-company',
  'institution',
  'programme',
  'project',
  'dataset',
  'indicator',
])

/** Outcome recorded against an audit event. */
export const auditResultSchema = z.enum(['success', 'failure', 'rejected'])

/* ------------------------------------------------------------------ *
 * Section A — Access summary
 * ------------------------------------------------------------------ */

/**
 * A summary card.
 *
 * `breakdown` carries the split for cards that have one (active users by
 * role, inactive accounts by status). `elevated` marks the security card so
 * the UI can present it distinctly without hardcoding an id.
 */
export const accessSummaryCardSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  count: z.number().int().min(0),
  breakdown: z.array(
    z.object({
      label: z.string().min(1),
      count: z.number().int().min(0),
    }),
  ),
  /** True for the elevated-rights card, which warrants visual emphasis. */
  elevated: z.boolean(),
  provenance: metricProvenanceSchema,
})

/* ------------------------------------------------------------------ *
 * Section B — Users
 * ------------------------------------------------------------------ */

export const userAccountSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  email: z.email(),
  institution: z.string().min(1),
  designation: z.string(),
  role: systemRoleSchema,
  status: accountStatusSchema,
  /** Null for an account that has never signed in. */
  lastLogin: z.iso.datetime().nullable(),
  createdAt: z.iso.datetime(),
})

export const inviteUserRequestSchema = z.object({
  name: z.string().trim().min(2, 'Enter the user name'),
  email: z.email('Enter a valid email address'),
  institution: z.string().min(1, 'Select an institution'),
  designation: z.string().trim().min(2, 'Enter the designation'),
  role: systemRoleSchema,
  accessScope: scopeLevelSchema,
  invitationMessage: z.string().max(500).optional(),
})

export const inviteUserResponseSchema = z.object({
  user: userAccountSchema,
  message: z.string().min(1),
})

/* ------------------------------------------------------------------ *
 * Section C — Roles and permissions
 * ------------------------------------------------------------------ */

/** One row of the role × permission matrix. */
export const roleDefinitionSchema = z.object({
  role: systemRoleSchema,
  label: z.string().min(1),
  description: z.string().min(1),
  permissions: z.array(permissionSchema),
  /** Modules this role can reach, for the role catalogue. */
  modules: z.array(z.string().min(1)),
  /** Live count of accounts holding this role. */
  assignedUsers: z.number().int().min(0),
})

/* ------------------------------------------------------------------ *
 * Section D — Access scope
 * ------------------------------------------------------------------ */

export const scopeAssignmentSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  userName: z.string().min(1),
  level: scopeLevelSchema,
  /** The specific state, DisCo, programme or dataset, e.g. "Ikeja DisCo". */
  scope: z.string().min(1),
  responsibility: z.string(),
  effectiveFrom: z.iso.datetime(),
  /** Null for an open-ended assignment. */
  effectiveTo: z.iso.datetime().nullable(),
  active: z.boolean(),
})

/* ------------------------------------------------------------------ *
 * Section E — Audit log
 * ------------------------------------------------------------------ */

export const auditEventSchema = z.object({
  id: z.string().min(1),
  timestamp: z.iso.datetime(),
  userId: z.string().min(1),
  userName: z.string().min(1),
  action: z.string().min(1),
  module: z.string().min(1),
  /** Identifier of the affected record, where the action targeted one. */
  recordId: z.string().nullable(),
  /** Null for a creation, where there is no prior value. */
  priorValue: z.string().nullable(),
  /** Null for a deletion, where there is no new value. */
  newValue: z.string().nullable(),
  result: auditResultSchema,
  reference: z.string().nullable(),
})

/* ------------------------------------------------------------------ *
 * Module filters
 *
 * The specification gives this module its OWN eight filters, which are not
 * the seven global dashboard filters. The global filter bar therefore does not
 * apply here.
 * ------------------------------------------------------------------ */

export const administrationFilterOptionsSchema = z.object({
  institutions: z.array(filterOptionSchema),
  roles: z.array(filterOptionSchema),
  accountStatuses: z.array(filterOptionSchema),
  permissions: z.array(filterOptionSchema),
  accessScopes: z.array(filterOptionSchema),
  modules: z.array(filterOptionSchema),
  auditPeriods: z.array(filterOptionSchema),
})

export const administrationQuerySchema = z.object({
  /** Free-text search across user name, email and institution. */
  search: z.string().optional(),
  institution: z.string().optional(),
  role: z.string().optional(),
  accountStatus: z.string().optional(),
  permission: z.string().optional(),
  accessScope: z.string().optional(),
  module: z.string().optional(),
  auditPeriod: z.string().optional(),
})

/* ------------------------------------------------------------------ */

/** Response shape for GET /api/administration. */
export const administrationOverviewSchema = z.object({
  lastUpdated: z.iso.datetime(),
  summary: z.array(accessSummaryCardSchema),
  users: paginated(userAccountSchema),
  roles: z.array(roleDefinitionSchema),
  scopeAssignments: paginated(scopeAssignmentSchema),
  auditLog: paginated(auditEventSchema),
})

export type AccountStatus = z.infer<typeof accountStatusSchema>
export type Permission = z.infer<typeof permissionSchema>
export type SystemRole = z.infer<typeof systemRoleSchema>
export type ScopeLevel = z.infer<typeof scopeLevelSchema>
export type AuditResult = z.infer<typeof auditResultSchema>
export type AccessSummaryCard = z.infer<typeof accessSummaryCardSchema>
export type UserAccount = z.infer<typeof userAccountSchema>
export type InviteUserRequest = z.infer<typeof inviteUserRequestSchema>
export type RoleDefinition = z.infer<typeof roleDefinitionSchema>
export type ScopeAssignment = z.infer<typeof scopeAssignmentSchema>
export type AuditEvent = z.infer<typeof auditEventSchema>
export type AdministrationOverview = z.infer<typeof administrationOverviewSchema>
export type AdministrationQuery = z.infer<typeof administrationQuerySchema>
export type AdministrationFilterOptions = z.infer<
  typeof administrationFilterOptionsSchema
>

/** Display labels for the closed vocabularies. */
export const PERMISSION_LABELS: Record<Permission, string> = {
  view: 'View',
  submit: 'Submit',
  edit: 'Edit',
  validate: 'Validate',
  approve: 'Approve',
  export: 'Export',
  administer: 'Administer',
}

export const SYSTEM_ROLE_LABELS: Record<SystemRole, string> = {
  'system-administrator': 'System Administrator',
  'institutional-data-provider': 'Institutional Data Provider',
  'data-reviewer': 'Data Reviewer',
  validator: 'Validator',
  'dashboard-manager': 'Dashboard Manager',
  'oversight-user': 'Oversight User',
  'read-only-user': 'Read-Only User',
}

export const ACCOUNT_STATUS_LABELS: Record<AccountStatus, string> = {
  active: 'Active',
  pending: 'Pending',
  inactive: 'Inactive',
  suspended: 'Suspended',
}

export const SCOPE_LEVEL_LABELS: Record<ScopeLevel, string> = {
  national: 'National',
  state: 'State',
  'distribution-company': 'Distribution Company',
  institution: 'Institution',
  programme: 'Programme',
  project: 'Project',
  dataset: 'Dataset',
  indicator: 'Indicator',
}

/** The permission set is ordered as the specification lists it. */
export const PERMISSIONS = permissionSchema.options
export const SYSTEM_ROLES = systemRoleSchema.options
