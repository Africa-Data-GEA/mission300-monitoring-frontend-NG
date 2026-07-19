import { Outlet } from 'react-router'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'

/** Application chrome: persistent sidebar, top bar and routed content. */
export function AppShell() {
  return (
    <div className="flex min-h-svh bg-surface-page">
      <Sidebar className="sticky top-0 hidden h-svh overflow-y-auto bg-surface lg:flex" />

      <div className="flex min-w-0 flex-1 flex-col gap-4 p-4">
        <Topbar />
        <main className="min-w-0 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
