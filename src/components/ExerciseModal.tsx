import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { Exercise } from '../types'
import { toYouTubeEmbed, capitalize } from '../utils/helpers'

export function ExerciseModal({
  exercise,
  onClose,
}: {
  exercise: Exercise
  onClose: () => void
}) {
  const embed = toYouTubeEmbed(exercise.video_url)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <motion.div
        className="card max-h-[90vh] w-full max-w-2xl overflow-y-auto"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 24 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="exercise-modal-title"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[var(--color-line)] p-5">
          <div>
            <p className="badge mb-2 bg-[var(--color-accent)]/15 text-[var(--color-accent)]">
              {capitalize(exercise.muscle_group)}
            </p>
            <h2 id="exercise-modal-title" className="font-display text-2xl font-bold">
              {exercise.name}
            </h2>
          </div>
          <button type="button" className="btn-ghost !p-2" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {exercise.image_url && (
            <img
              src={exercise.image_url}
              alt={exercise.name}
              className="h-48 w-full rounded-xl object-cover"
            />
          )}
          {embed && (
            <div className="aspect-video overflow-hidden rounded-xl border border-[var(--color-line)]">
              <iframe
                src={embed}
                title={`${exercise.name} demo`}
                className="h-full w-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
          <p className="leading-relaxed text-[var(--color-muted)]">{exercise.description}</p>
        </div>
      </motion.div>
    </div>
  )
}
