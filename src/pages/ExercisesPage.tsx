import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useExercises } from '../hooks/useData'
import { ExerciseModal } from '../components/ExerciseModal'
import { EmptyState, ErrorState, PageHeader, Spinner } from '../components/ui'
import { capitalize, MUSCLE_GROUPS } from '../utils/helpers'
import type { Exercise } from '../types'

export function ExercisesPage() {
  const { exercises, loading, error } = useExercises()
  const [muscle, setMuscle] = useState('all')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Exercise | null>(null)

  const groups = useMemo(() => {
    const fromData = Array.from(new Set(exercises.map((e) => e.muscle_group.toLowerCase())))
    return Array.from(new Set([...MUSCLE_GROUPS, ...fromData]))
  }, [exercises])

  const filtered = useMemo(() => {
    return exercises.filter((e) => {
      if (muscle !== 'all' && e.muscle_group.toLowerCase() !== muscle) return false
      if (query.trim() && !e.name.toLowerCase().includes(query.toLowerCase())) return false
      return true
    })
  }, [exercises, muscle, query])

  return (
    <div className="container-app py-10">
      <PageHeader
        title="Exercises"
        subtitle="Filter by muscle group. Click a card for video and instructions."
      />

      <div className="mb-8 grid gap-3 sm:grid-cols-2">
        <input
          className="input"
          placeholder="Search exercises…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="input" value={muscle} onChange={(e) => setMuscle(e.target.value)}>
          <option value="all">All muscle groups</option>
          {groups.map((g) => (
            <option key={g} value={g}>
              {capitalize(g)}
            </option>
          ))}
        </select>
      </div>

      {loading && <Spinner />}
      {error && <ErrorState message={error} />}
      {!loading && !error && filtered.length === 0 && (
        <EmptyState title="No exercises found." />
      )}

      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((ex, i) => (
            <motion.button
              key={ex.id}
              type="button"
              className="card overflow-hidden text-left transition hover:border-[var(--color-accent)]/40"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileHover={{ y: -3 }}
              onClick={() => setSelected(ex)}
            >
              {ex.image_url ? (
                <img src={ex.image_url} alt="" className="h-40 w-full object-cover" />
              ) : (
                <div className="flex h-40 items-center justify-center bg-[var(--color-panel-2)] text-sm text-[var(--color-muted)]">
                  No image
                </div>
              )}
              <div className="p-4">
                <span className="badge mb-2 bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
                  {capitalize(ex.muscle_group)}
                </span>
                <h3 className="font-display text-lg font-bold">{ex.name}</h3>
              </div>
            </motion.button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <ExerciseModal exercise={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}
