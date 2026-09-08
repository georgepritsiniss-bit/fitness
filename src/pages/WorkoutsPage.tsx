import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useWorkouts } from '../hooks/useData'
import { WorkoutCard } from '../components/WorkoutCard'
import { EmptyState, ErrorState, PageHeader, Spinner } from '../components/ui'
import { LEVELS, matchesDurationFilter } from '../utils/helpers'

export function WorkoutsPage() {
  const { workouts, loading, error } = useWorkouts()
  const [level, setLevel] = useState('all')
  const [duration, setDuration] = useState('all')
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    return workouts.filter((w) => {
      if (level !== 'all' && w.level !== level) return false
      if (!matchesDurationFilter(w.duration, duration)) return false
      if (query.trim()) {
        const q = query.toLowerCase()
        if (!w.title.toLowerCase().includes(q) && !w.description.toLowerCase().includes(q)) {
          return false
        }
      }
      return true
    })
  }, [workouts, level, duration, query])

  return (
    <div className="container-app py-10">
      <PageHeader
        title="Workouts"
        subtitle="Filter by level and duration, or search by name."
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-3">
        <div className="relative sm:col-span-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted)]" />
          <input
            className="input pl-9"
            placeholder="Search workouts…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select className="input" value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="all">All levels</option>
          {LEVELS.map((l) => (
            <option key={l} value={l}>
              {l.charAt(0).toUpperCase() + l.slice(1)}
            </option>
          ))}
        </select>
        <select className="input" value={duration} onChange={(e) => setDuration(e.target.value)}>
          <option value="all">Any duration</option>
          <option value="30">≤ 30 min</option>
          <option value="45">31–45 min</option>
          <option value="60">46–60 min</option>
          <option value="90">60+ min</option>
        </select>
      </div>

      {loading && <Spinner />}
      {error && <ErrorState message={error} />}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState title="No workouts match your filters." />
      )}
      {!loading && !error && filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((w, i) => (
            <WorkoutCard key={w.id} workout={w} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}
