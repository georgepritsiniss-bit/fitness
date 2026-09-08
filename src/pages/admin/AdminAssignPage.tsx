import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import {
  assignExerciseToWorkout,
  fetchWorkoutExercises,
  removeExerciseFromWorkout,
} from '../../services/api'
import { useExercises, useWorkouts } from '../../hooks/useData'
import { EmptyState, PageHeader, Spinner } from '../../components/ui'
import type { Exercise, WorkoutExercise } from '../../types'

export function AdminAssignPage() {
  const { workouts, loading: wLoading } = useWorkouts()
  const { exercises, loading: eLoading } = useExercises()
  const [workoutId, setWorkoutId] = useState('')
  const [exerciseId, setExerciseId] = useState('')
  const [sets, setSets] = useState(3)
  const [reps, setReps] = useState(10)
  const [assigned, setAssigned] = useState<(WorkoutExercise & { exercises: Exercise })[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (workouts.length && !workoutId) setWorkoutId(workouts[0].id)
  }, [workouts, workoutId])

  useEffect(() => {
    if (exercises.length && !exerciseId) setExerciseId(exercises[0].id)
  }, [exercises, exerciseId])

  useEffect(() => {
    if (!workoutId) {
      setAssigned([])
      return
    }
    let cancelled = false
    fetchWorkoutExercises(workoutId)
      .then((rows) => {
        if (!cancelled) setAssigned(rows)
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load assignments')
      })
    return () => {
      cancelled = true
    }
  }, [workoutId])

  async function onAssign(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (!workoutId || !exerciseId) return
    setBusy(true)
    try {
      await assignExerciseToWorkout({
        workout_id: workoutId,
        exercise_id: exerciseId,
        sets,
        reps,
      })
      const rows = await fetchWorkoutExercises(workoutId)
      setAssigned(rows)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Assign failed')
    } finally {
      setBusy(false)
    }
  }

  async function onRemove(id: string) {
    try {
      await removeExerciseFromWorkout(id)
      setAssigned((prev) => prev.filter((r) => r.id !== id))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Remove failed')
    }
  }

  if (wLoading || eLoading) return <Spinner />

  return (
    <div>
      <PageHeader
        title="Assign exercises"
        subtitle="Attach exercises to a workout with sets and reps."
      />

      <form onSubmit={onAssign} className="card mb-8 grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="label">Workout</label>
          <select className="input" value={workoutId} onChange={(e) => setWorkoutId(e.target.value)}>
            {workouts.map((w) => (
              <option key={w.id} value={w.id}>
                {w.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Exercise</label>
          <select className="input" value={exerciseId} onChange={(e) => setExerciseId(e.target.value)}>
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Sets</label>
          <input
            type="number"
            min={1}
            className="input"
            value={sets}
            onChange={(e) => setSets(Number(e.target.value))}
          />
        </div>
        <div>
          <label className="label">Reps</label>
          <input
            type="number"
            min={1}
            className="input"
            value={reps}
            onChange={(e) => setReps(Number(e.target.value))}
          />
        </div>
        {error && <p className="sm:col-span-2 lg:col-span-4 text-sm text-[var(--color-danger)]">{error}</p>}
        <div className="sm:col-span-2 lg:col-span-4">
          <button type="submit" className="btn-primary" disabled={busy || !workouts.length}>
            Assign to workout
          </button>
        </div>
      </form>

      {!assigned.length ? (
        <EmptyState title="No exercises assigned to this workout." />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead className="border-b border-[var(--color-line)] text-[var(--color-muted)]">
              <tr>
                <th className="p-3 font-medium">Exercise</th>
                <th className="p-3 font-medium">Sets</th>
                <th className="p-3 font-medium">Reps</th>
                <th className="p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assigned.map((row) => (
                <tr key={row.id} className="border-b border-[var(--color-line)]/60">
                  <td className="p-3 font-medium">{row.exercises?.name ?? row.exercise_id}</td>
                  <td className="p-3">{row.sets}</td>
                  <td className="p-3">{row.reps}</td>
                  <td className="p-3">
                    <button
                      type="button"
                      className="btn-danger !py-1.5 !text-xs"
                      onClick={() => void onRemove(row.id)}
                    >
                      Remove
                    </button>
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
