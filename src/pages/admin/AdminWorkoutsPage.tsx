import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  createWorkout,
  deleteWorkout,
  updateWorkout,
} from '../../services/api'
import { useWorkouts } from '../../hooks/useData'
import { EmptyState, ErrorState, PageHeader, Spinner } from '../../components/ui'
import { LEVELS, capitalize } from '../../utils/helpers'
import type { Workout, WorkoutLevel } from '../../types'

const empty = {
  title: '',
  description: '',
  level: 'beginner' as WorkoutLevel,
  duration: 45,
}

export function AdminWorkoutsPage() {
  const { workouts, loading, error, setWorkouts } = useWorkouts()
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState<Workout | null>(null)
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  function startEdit(w: Workout) {
    setEditing(w)
    setForm({
      title: w.title,
      description: w.description,
      level: w.level,
      duration: w.duration,
    })
  }

  function reset() {
    setEditing(null)
    setForm(empty)
    setFormError(null)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setFormError(null)
    if (!form.title.trim()) {
      setFormError('Title is required.')
      return
    }
    setBusy(true)
    try {
      if (editing) {
        const updated = await updateWorkout(editing.id, form)
        setWorkouts((prev) => prev.map((w) => (w.id === updated.id ? updated : w)))
      } else {
        const created = await createWorkout(form)
        setWorkouts((prev) => [...prev, created])
      }
      reset()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  async function onDelete(id: string) {
    if (!confirm('Delete this workout?')) return
    try {
      await deleteWorkout(id)
      setWorkouts((prev) => prev.filter((w) => w.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <div>
      <PageHeader title="Workouts" subtitle="Create, edit, and delete programs." />

      <form onSubmit={onSubmit} className="card mb-8 grid gap-3 p-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="label">Title</label>
          <input
            className="input"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="label">Description</label>
          <textarea
            className="input min-h-[90px]"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Level</label>
          <select
            className="input"
            value={form.level}
            onChange={(e) => setForm({ ...form, level: e.target.value as WorkoutLevel })}
          >
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {capitalize(l)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Duration (minutes)</label>
          <input
            type="number"
            min={1}
            className="input"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
          />
        </div>
        {formError && (
          <p className="sm:col-span-2 text-sm text-[var(--color-danger)]">{formError}</p>
        )}
        <div className="flex gap-2 sm:col-span-2">
          <button type="submit" className="btn-primary" disabled={busy}>
            {editing ? 'Update workout' : 'Add workout'}
          </button>
          {editing && (
            <button type="button" className="btn-ghost" onClick={reset}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading && <Spinner />}
      {error && <ErrorState message={error} />}
      {!loading && !error && workouts.length === 0 && <EmptyState title="No workouts yet." />}
      {!loading && !error && workouts.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-[var(--color-line)] text-[var(--color-muted)]">
              <tr>
                <th className="p-3 font-medium">Title</th>
                <th className="p-3 font-medium">Level</th>
                <th className="p-3 font-medium">Duration</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {workouts.map((w) => (
                <tr key={w.id} className="border-b border-[var(--color-line)]/60">
                  <td className="p-3 font-medium">{w.title}</td>
                  <td className="p-3 capitalize">{w.level}</td>
                  <td className="p-3">{w.duration} min</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button type="button" className="btn-ghost !py-1.5 !text-xs" onClick={() => startEdit(w)}>
                        Edit
                      </button>
                      <button type="button" className="btn-danger !py-1.5 !text-xs" onClick={() => void onDelete(w.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
