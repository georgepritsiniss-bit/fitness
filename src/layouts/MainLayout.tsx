import { NavLink, Link, Outlet } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Menu, X, Dumbbell, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

const links = [
  { to: '/', label: 'Home', end: true },
  { to: '/workouts', label: 'Workouts' },
  { to: '/exercises', label: 'Exercises' },
  { to: '/favorites', label: 'Favorites' },
  { to: '/contact', label: 'Contact' },
]

export function MainLayout() {
  const { user, isAdmin, signOut } = useAuth()
  const [open, setOpen] = useState(false)

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition ${
      isActive
        ? 'bg-[var(--color-accent)]/15 text-[var(--color-accent)]'
        : 'text-[var(--color-muted)] hover:text-[var(--color-text)]'
    }`

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-[var(--color-line)]/80 bg-[var(--color-ink)]/80 backdrop-blur-md">
        <div className="container-app flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
              <Dumbbell className="h-5 w-5" />
            </span>
            FitForge
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
                {l.label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink to="/admin" className={linkClass}>
                Admin
              </NavLink>
            )}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <span className="max-w-[140px] truncate text-xs text-[var(--color-muted)]">
                  {user.email}
                </span>
                <button type="button" className="btn-ghost !py-2" onClick={() => void signOut()}>
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost !py-2">
                  Log in
                </Link>
                <Link to="/register" className="btn-primary !py-2">
                  Sign up
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            className="btn-ghost !p-2 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <motion.nav
            className="border-t border-[var(--color-line)] px-4 py-3 md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <div className="flex flex-col gap-1">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={linkClass}
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </NavLink>
              ))}
              {isAdmin && (
                <NavLink to="/admin" className={linkClass} onClick={() => setOpen(false)}>
                  Admin
                </NavLink>
              )}
              <div className="mt-2 flex flex-col gap-2 border-t border-[var(--color-line)] pt-3">
                {user ? (
                  <button
                    type="button"
                    className="btn-ghost"
                    onClick={() => {
                      void signOut()
                      setOpen(false)
                    }}
                  >
                    Log out
                  </button>
                ) : (
                  <>
                    <Link to="/login" className="btn-ghost" onClick={() => setOpen(false)}>
                      Log in
                    </Link>
                    <Link to="/register" className="btn-primary" onClick={() => setOpen(false)}>
                      Sign up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.nav>
        )}
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-[var(--color-line)] py-8">
        <div className="container-app flex flex-col gap-2 text-sm text-[var(--color-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} FitForge. Train smarter.</p>
          <p>Built with React, Supabase & Vercel.</p>
        </div>
      </footer>
    </div>
  )
}
