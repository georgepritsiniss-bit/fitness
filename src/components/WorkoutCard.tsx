import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, Dumbbell } from 'lucide-react'
import type { Workout } from '../types'
import { capitalize, truncate } from '../utils/helpers'
import { levelBadgeClass } from './ui'

export function WorkoutCard({ workout, index = 0 }: { workout: Workout; index?: number }) {
  return (
    <motion.article
      className="card group overflow-hidden transition hover:border-[var(--color-accent)]/40"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <Link to={`/workouts/${workout.id}`} className="block p-5">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span className={`badge ${levelBadgeClass(workout.level)}`}>
            {capitalize(workout.level)}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-[var(--color-muted)]">
            <Clock className="h-3.5 w-3.5" />
            {workout.duration} min
          </span>
        </div>
        <h3 className="font-display text-xl font-bold group-hover:text-[var(--color-accent)]">
          {workout.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
          {truncate(workout.description, 110)}
        </p>
        <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-accent)]">
          <Dumbbell className="h-4 w-4" />
          View program
        </div>
      </Link>
    </motion.article>
  )
}
