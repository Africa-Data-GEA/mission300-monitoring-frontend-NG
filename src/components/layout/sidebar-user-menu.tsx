import { useState } from 'react'
import {
  BookOpen,
  ChevronUp,
  CircleHelp,
  ExternalLink,
  LogOut,
  Mail,
  Settings,
  UserRound,
} from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { Button } from '@/components/ui/button'
import { dashboardToast } from '@/lib/dashboard-toast'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { SideDialog } from '@/components/ui/side-dialog'
import { ADMIN_MENU_ITEMS } from '@/config/navigation'
import { clearAuthSession, readAuthSession } from '@/features/auth/auth-session'
import { canRoleReachModule, findAccountById, getRoleLabel } from '@/features/auth/role-access'

interface SidebarUser {
  name: string
  email: string
  role: string
  institution: string
}

const FALLBACK_USER: SidebarUser = {
  name: 'John Doe',
  email: 'john.doe@emrc.gov.ng',
  role: 'Administrator',
  institution: 'Energy Monitoring and Reform Committee',
}

/** Derives the sidebar user from the real login session rather than a hardcoded stand-in — falls back only when no one is signed in. */
function deriveSidebarUser(): SidebarUser {
  const session = readAuthSession()
  if (!session) return FALLBACK_USER

  const account = findAccountById(session.user.id)
  return {
    name: session.user.name,
    email: session.user.email,
    role: getRoleLabel(session.user.role),
    institution: account?.institution ?? FALLBACK_USER.institution,
  }
}

const inputClassName =
  'mt-1.5 h-10 w-full rounded-control border border-border-default bg-surface px-3 text-sm text-text-default outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100'

export function SidebarUserMenu() {
  const navigate = useNavigate()
  const [user, setUser] = useState(deriveSidebarUser)
  const [draft, setDraft] = useState(user)
  const [profileOpen, setProfileOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [guideOpen, setGuideOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Same role gate the sidebar itself used to apply to these as nav items —
  // see the comment on ADMIN_MENU_ITEMS in config/navigation.ts. No session
  // (e.g. a dev workflow that skipped /account/login) shows both rather than
  // neither, matching Sidebar's own fallback.
  const roleSlug = readAuthSession()?.user.role
  const adminMenuItems = ADMIN_MENU_ITEMS.filter(
    (item) => !roleSlug || canRoleReachModule(roleSlug, item.moduleKey),
  )

  function openProfile() {
    setDraft(user)
    setProfileOpen(true)
  }

  function logout() {
    clearAuthSession()
    dashboardToast.success('Signed out securely')
    navigate('/account/login', { replace: true })
  }

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="Open user menu"
            className="flex w-full items-center gap-2.5 rounded-lg border border-transparent bg-surface-sunken px-2.5 py-2.5 text-left transition-colors hover:border-brand-100 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <span
              aria-hidden="true"
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-brand-700 text-xs font-semibold text-white"
            >
              {user.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-text-default">{user.name}</span>
              <span className="block truncate text-xs text-text-muted">{user.role}</span>
            </span>
            <ChevronUp aria-hidden="true" className="size-4 shrink-0 text-text-subtle" />
          </button>
        </PopoverTrigger>

        <PopoverContent side="top" align="start" sideOffset={8} className="w-64 p-2">
          <div className="border-b border-border-default px-2 py-2">
            <p className="truncate text-sm font-semibold text-text-default">{user.name}</p>
            <p className="truncate text-xs text-text-muted">{user.email}</p>
          </div>
          <div className="py-1">
            <button
              type="button"
              onClick={openProfile}
              className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm text-text-default hover:bg-surface-sunken"
            >
              <UserRound aria-hidden="true" className="size-4 text-text-muted" />
              View and edit profile
            </button>
            <button
              type="button"
              onClick={() => setHelpOpen(true)}
              className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm text-text-default hover:bg-surface-sunken"
            >
              <CircleHelp aria-hidden="true" className="size-4 text-text-muted" />
              Help centre
            </button>
          </div>

          {adminMenuItems.length > 0 && (
            <div className="border-t border-border-default py-1">
              {adminMenuItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm text-text-default hover:bg-surface-sunken"
                >
                  <Settings aria-hidden="true" className="size-4 text-text-muted" />
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          <div className="border-t border-border-default pt-1">
            <button
              type="button"
              onClick={logout}
              className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-sm font-medium text-status-at-risk hover:bg-status-at-risk-bg"
            >
              <LogOut aria-hidden="true" className="size-4" />
              Log out
            </button>
          </div>
        </PopoverContent>
      </Popover>

      <SideDialog
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        title="Your profile"
        description="Review and update the information shown with your dashboard account."
      >
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 flex items-center gap-4 rounded-xl bg-surface-sunken p-4">
            <span className="inline-flex size-14 items-center justify-center rounded-full bg-brand-700 text-lg font-semibold text-white">
              {draft.name.split(' ').map((part) => part[0]).join('').slice(0, 2)}
            </span>
            <div>
              <p className="font-semibold text-text-default">{draft.name}</p>
              <p className="text-sm text-text-muted">{draft.role}</p>
            </div>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault()
              setIsSaving(true)
              window.setTimeout(() => {
                setUser(draft)
                setIsSaving(false)
                setProfileOpen(false)
              }, 600)
            }}
            className="grid gap-4 sm:grid-cols-2"
          >
            <label className="text-sm font-medium text-text-default">
              Full name
              <input
                value={draft.name}
                onChange={(event) => setDraft({ ...draft, name: event.target.value })}
                className={inputClassName}
                required
              />
            </label>
            <label className="text-sm font-medium text-text-default">
              Email address
              <input
                type="email"
                value={draft.email}
                onChange={(event) => setDraft({ ...draft, email: event.target.value })}
                className={inputClassName}
                required
              />
            </label>
            <label className="text-sm font-medium text-text-default">
              Role
              <input value={draft.role} readOnly className={`${inputClassName} bg-surface-sunken`} />
            </label>
            <label className="text-sm font-medium text-text-default">
              Institution
              <input
                value={draft.institution}
                onChange={(event) => setDraft({ ...draft, institution: event.target.value })}
                className={inputClassName}
              />
            </label>
            <div className="mt-2 flex justify-end gap-2 border-t border-border-default pt-4 sm:col-span-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setProfileOpen(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </form>
        </div>
      </SideDialog>

      <SideDialog
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        title="Help centre"
        description="Guidance and support for using the Mission 300 dashboard."
      >
        <div className="mx-auto grid max-w-3xl gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setGuideOpen((open) => !open)}
            className="rounded-xl border border-border-default p-5 text-left transition-colors hover:border-brand-300 hover:bg-brand-50"
          >
            <BookOpen className="size-5 text-brand-700" aria-hidden="true" />
            <h3 className="mt-3 font-semibold text-text-default">Dashboard guide</h3>
            <p className="mt-1 text-sm text-text-muted">Learn how filters, submissions and delivery records work.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-link">
              {guideOpen ? 'Hide guide' : 'Open guide'} <ExternalLink className="size-3.5" aria-hidden="true" />
            </span>
          </button>
          <a
            href="mailto:support@emrc.gov.ng"
            className="rounded-xl border border-border-default p-5 transition-colors hover:border-brand-300 hover:bg-brand-50"
          >
            <Mail className="size-5 text-brand-700" aria-hidden="true" />
            <h3 className="mt-3 font-semibold text-text-default">Contact support</h3>
            <p className="mt-1 text-sm text-text-muted">Get help with access, data validation or dashboard issues.</p>
            <span className="mt-3 block text-sm font-medium text-link">support@emrc.gov.ng</span>
          </a>
          {guideOpen && (
            <div className="rounded-xl border border-brand-200 bg-brand-50 p-5 sm:col-span-2">
              <h3 className="font-semibold text-text-default">Quick dashboard guide</h3>
              <ol className="mt-3 space-y-2 text-sm text-text-muted">
                <li><strong className="text-text-default">1. Filter:</strong> Select a reporting period, pillar or institution to request a new executive snapshot.</li>
                <li><strong className="text-text-default">2. Verify:</strong> Hover charts and open information icons to inspect source, target and methodology.</li>
                <li><strong className="text-text-default">3. Drill down:</strong> Open a project or programme from the delivery table, chart or map.</li>
                <li><strong className="text-text-default">4. Publish:</strong> Validated submissions update their linked KPI after approval and publication.</li>
              </ol>
            </div>
          )}
        </div>
      </SideDialog>
    </>
  )
}
