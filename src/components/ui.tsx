import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function Spinner({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-[var(--color-muted)]">
      <motion.div
        className="h-9 w-9 rounded-full border-2 border-[var(--color-line)] border-t-[var(--color-accent)]"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      />
      <p className="text-sm">{label}</p>
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="card mx-auto max-w-lg p-6 text-center">
      <p className="text-[var(--color-danger)]">{message}</p>
      {onRetry && (
        <button type="button" className="btn-ghost mt-4" onClick={onRetry}>
          Try again
        </button>
      )}
    </div>
  )
}

export function EmptyState({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="card p-8 text-center">
      <h3 className="font-display text-lg font-bold">{title}</h3>
      {children && <div className="mt-2 text-sm text-[var(--color-muted)]">{children}</div>}
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <motion.h1
          className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <p className="mt-2 max-w-2xl text-[var(--color-muted)]">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  )
}

export function levelBadgeClass(level: string): string {
  if (level === 'beginner') return 'bg-emerald-500/15 text-emerald-300'
  if (level === 'intermediate') return 'bg-amber-500/15 text-amber-300'
  return 'bg-rose-500/15 text-rose-300'
}
