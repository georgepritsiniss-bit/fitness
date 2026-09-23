import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Heart, ArrowLeft } from 'lucide-react'
import { fetchWorkoutById, fetchWorkouts, recommendWorkouts } from '../services/api'
import type { Workout, WorkoutWithExercises } from '../types'
import { capitalize, toYouTubeEmbed } from '../utils/helpers'
import { ErrorState, PageHeader, Spinner, levelBadgeClass } from '../components/ui'
import { useFavoriteToggle } from '../hooks/useFavorites'
import { useAuth } from '../context/AuthContext'
import { WorkoutCard } from '../components/WorkoutCard'

export function WorkoutDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [workout, setWorkout] = useState<WorkoutWithExercises | null>(null)
  const [recs, setRecs] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { favorited, busy, error: favError, toggle } = useFavoriteToggle(id ?? '')

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setLoading(true)
    setError(null)
    Promise.all([fetchWorkoutById(id), fetchWorkouts()])
      .then(([detail, all]) => {
        if (cancelled) return
        if (!detail) {
          setError('Workout not found.')
          setWorkout(null)
          return
        }
        setWorkout(detail)
        setRecs(recommendWorkouts(detail, all))
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load workout')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) {
    return (
      <div className="container-app py-10">
        <Spinner />
      </div>
    )
  }

  if (error || !workout) {
    return (
      <div className="container-app py-10">
        <ErrorState message={error ?? 'Workout not found.'} />
        <div className="mt-4 text-center">
          <Link to="/workouts" className="btn-ghost">
            <ArrowLeft className="h-4 w-4" />
            Back to workouts
          </Link>
        </div>
      </div>
    )
  }

  const exercises = workout.workout_exercises ?? []

  return (
    <div className="container-app py-10">
      <Link to="/workouts" className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-accent)]">
        <ArrowLeft className="h-4 w-4" />
        All workouts
      </Link>

      <PageHeader
        title={workout.title}
        subtitle={workout.description}
        action={
          <button
            type="button"
            className={favorited ? 'btn-primary' : 'btn-ghost'}
            disabled={busy}
            onClick={() => void toggle()}
          >
            <Heart className={`h-4 w-4 ${favorited ? 'fill-current' : ''}`} />
            {favorited ? 'Favorited' : 'Add to Favorites'}
          </button>
        }
      />

      {!user && (
        <p className="mb-4 text-sm text-[var(--color-muted)]">
          <Link to="/login" className="text-[var(--color-accent)] underline">
            Log in
          </Link>{' '}
          to save this workout.
        </p>
      )}
      {favError && <p className="mb-4 text-sm text-[var(--color-danger)]">{favError}</p>}

      <div className="mb-10 flex flex-wrap gap-3">
        <span className={`badge ${levelBadgeClass(workout.level)}`}>
          {capitalize(workout.level)}
        </span>
        <span className="badge bg-[var(--color-panel-2)] text-[var(--color-muted)]">
          <Clock className="mr-1 h-3.5 w-3.5" />
          {workout.duration} minutes
        </span>
        <span className="badge bg-[var(--color-panel-2)] text-[var(--color-muted)]">
          {exercises.length} exercises
        </span>
      </div>

      <h2 className="mb-4 font-display text-2xl font-bold">Exercises</h2>
      <div className="space-y-6">
        {exercises.map((we, i) => {
          const ex = we.exercises
          const embed = toYouTubeEmbed(ex?.video_url)
          return (
            <motion.article
              key={we.id}
              className="card overflow-hidden"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <div className="grid gap-0 lg:grid-cols-2">
                <div className="space-y-3 p-5">
                  <h3 className="font-display text-xl font-bold">{ex?.name}</h3>
                  <p className="text-sm font-semibold text-[var(--color-accent)]">
                    {we.sets} sets × {we.reps} reps
                  </p>
                  <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                    {ex?.description}
                  </p>
                  {ex?.image_url && (
                    <img
                      src={ex.image_url}
                      alt={ex.name}
                      className="h-40 w-full rounded-xl object-cover lg:hidden"
                    />
                  )}
                </div>
                <div className="border-t border-[var(--color-line)] lg:border-l lg:border-t-0">
                  {embed ? (
                    <div className="aspect-video h-full min-h-[220px]">
                      <iframe
                        src={embed}
                        title={`${ex?.name} demo`}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : ex?.image_url ? (
                    <img
                      src={ex.image_url}
                      alt={ex.name}
                      className="hidden h-full min-h-[220px] w-full object-cover lg:block"
                    />
                  ) : (
                    <div className="flex h-full min-h-[220px] items-center justify-center text-sm text-[var(--color-muted)]">
                      No video available
                    </div>
                  )}
                </div>
              </div>
            </motion.article>
          )
        })}
      </div>

      {recs.length > 0 && (
        <section className="mt-14">
          <h2 className="mb-4 font-display text-2xl font-bold">You may also like</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recs.map((w, i) => (
              <WorkoutCard key={w.id} workout={w} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
