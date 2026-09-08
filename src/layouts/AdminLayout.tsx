import { NavLink, Outlet, Link } from 'react-router-dom'
import {
  LayoutDashboard,
  Dumbbell,
  ListChecks,
  Link2,
  Mail,
  ArrowLeft,
} from 'lucide-react'

const items = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/workouts', label: 'Workouts', icon: Dumbbell },
  { to: '/admin/exercises', label: 'Exercises', icon: ListChecks },
  { to: '/admin/assign', label: 'Assign', icon: Link2 },
  { to: '/admin/messages', label: 'Messages', icon: Mail },
]

export function AdminLayout() {
  return (
    <div className="min-h-screen lg:flex">
      <aside className="border-b border-[var(--color-line)] bg-[var(--color-panel)] lg:w-64 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 p-4 lg:block">
          <div>
            <p className="font-display text-lg font-bold">Admin</p>
            <p className="text-xs text-[var(--color-muted)]">FitForge dashboard</p>
          </div>
          <Link to="/" className="btn-ghost !py-2 text-xs lg:mt-4 lg:w-full">
            <ArrowLeft className="h-4 w-4" />
            Back to site
          </Link>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-6">
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
                    : 'text-[var(--color-muted)] hover:bg-[var(--color-panel-2)] hover:text-[var(--color-text)]'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </div>
    </div>
  )
}
