import { Link } from 'react-router-dom'
import { useExercises, useWorkouts } from '../../hooks/useData'
import { PageHeader, Spinner } from '../../components/ui'
import { useEffect, useState } from 'react'
import { fetchMessages } from '../../services/api'

export function AdminOverviewPage() {
  const { workouts, loading: wLoading } = useWorkouts()
  const { exercises, loading: eLoading } = useExercises()
  const [msgCount, setMsgCount] = useState<number | null>(null)

  useEffect(() => {
    fetchMessages()
      .then((m) => setMsgCount(m.length))
      .catch(() => setMsgCount(null))
  }, [])




  
  if (wLoading || eLoading) return <Spinner />

  const cards = [
    { label: 'Workouts', value: workouts.length, to: '/admin/workouts' },
    { label: 'Exercises', value: exercises.length, to: '/admin/exercises' },
    { label: 'Messages', value: msgCount ?? '—', to: '/admin/messages' },
  ]

  return (
    <div>
      <PageHeader title="Overview" subtitle="Manage FitForge content." />
      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="card p-5 transition hover:border-[var(--color-accent)]/40">
            <p className="text-sm text-[var(--color-muted)]">{c.label}</p>
            <p className="mt-2 font-display text-3xl font-bold">{c.value}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
