import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  createExercise,
  deleteExercise,
  updateExercise,
} from '../../services/api'
import { useExercises } from '../../hooks/useData'
import { EmptyState, ErrorState, PageHeader, Spinner } from '../../components/ui'
import { MUSCLE_GROUPS, capitalize } from '../../utils/helpers'
import type { Exercise } from '../../types'

const empty = {
  name: '',
  description: '',
  video_url: '',
  image_url: '',
  muscle_group: 'chest',
}

export function AdminExercisesPage() {
  const { exercises, loading, error, setExercises } = useExercises()
  const [form, setForm] = useState(empty)
  const [editing, setEditing] = useState<Exercise | null>(null)
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  function startEdit(ex: Exercise) {
    setEditing(ex)
    setForm({
      name: ex.name,
      description: ex.description,
      video_url: ex.video_url ?? '',
      image_url: ex.image_url ?? '',
      muscle_group: ex.muscle_group,
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
    if (!form.name.trim()) {
      setFormError('Name is required.')
      return
    }
    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      video_url: form.video_url.trim() || null,
      image_url: form.image_url.trim() || null,
      muscle_group: form.muscle_group,
    }
    setBusy(true)
    try {
      if (editing) {
        const updated = await updateExercise(editing.id, payload)
        setExercises((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
      } else {
        const created = await createExercise(payload)
        setExercises((prev) => [...prev, created])
      }
      reset()
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setBusy(false)
    }
  }

  async function onDelete(id: string) {
    if (!confirm('Delete this exercise?')) return
    try {
      await deleteExercise(id)
      setExercises((prev) => prev.filter((x) => x.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <div>
      <PageHeader title="Exercises" subtitle="Manage the exercise library." />

      <form onSubmit={onSubmit} className="card mb-8 grid gap-3 p-5 sm:grid-cols-2">
        <div>
          <label className="label">Name</label>
          <input
            className="input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Muscle group</label>
          <select
            className="input"
            value={form.muscle_group}
            onChange={(e) => setForm({ ...form, muscle_group: e.target.value })}
          >
            {MUSCLE_GROUPS.map((g) => (
              <option key={g} value={g}>
                {capitalize(g)}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="label">Description / instructions</label>
          <textarea
            className="input min-h-[90px]"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div>
          <label className="label">YouTube URL</label>
          <input
            className="input"
            value={form.video_url}
            onChange={(e) => setForm({ ...form, video_url: e.target.value })}
            placeholder="https://www.youtube.com/watch?v=…"
          />
        </div>
        <div>
          <label className="label">Image URL</label>
          <input
            className="input"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          />
        </div>
        {formError && (
          <p className="sm:col-span-2 text-sm text-[var(--color-danger)]">{formError}</p>
        )}
        <div className="flex gap-2 sm:col-span-2">
          <button type="submit" className="btn-primary" disabled={busy}>
            {editing ? 'Update exercise' : 'Add exercise'}
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
      {!loading && !error && exercises.length === 0 && <EmptyState title="No exercises yet." />}
      {!loading && !error && exercises.length > 0 && (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-[var(--color-line)] text-[var(--color-muted)]">
              <tr>
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Muscle</th>
                <th className="p-3 font-medium">Video</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {exercises.map((ex) => (
                <tr key={ex.id} className="border-b border-[var(--color-line)]/60">
                  <td className="p-3 font-medium">{ex.name}</td>
                  <td className="p-3 capitalize">{ex.muscle_group}</td>
                  <td className="p-3 text-[var(--color-muted)]">
                    {ex.video_url ? 'Yes' : '—'}
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button type="button" className="btn-ghost !py-1.5 !text-xs" onClick={() => startEdit(ex)}>
                        Edit
                      </button>
                      <button type="button" className="btn-danger !py-1.5 !text-xs" onClick={() => void onDelete(ex.id)}>
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
