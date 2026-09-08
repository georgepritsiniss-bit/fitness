import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Flame, Target, Zap } from 'lucide-react'
import { useWorkouts } from '../hooks/useData'
import { WorkoutCard } from '../components/WorkoutCard'
import { Spinner } from '../components/ui'

export function HomePage() {
  const { workouts, loading } = useWorkouts()
  const featured = workouts.slice(0, 3)

  return (
    <div>
      <section className="relative overflow-hidden border-b border-[var(--color-line)]">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-ink)] via-[var(--color-ink)]/80 to-[var(--color-ink)]/40" />

        <div className="container-app relative flex min-h-[78vh] flex-col justify-end pb-16 pt-24 sm:pb-20">
          <motion.p
            className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            FitForge
          </motion.p>
          <motion.h1
            className="max-w-3xl font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            Programs that move with you.
          </motion.h1>
          <motion.p
            className="mt-4 max-w-xl text-base text-[var(--color-muted)] sm:text-lg"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Explore curated workouts, master exercises with video demos, and save favorites to your
            personal training list.
          </motion.p>
          <motion.div
            className="mt-8 flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Link to="/workouts" className="btn-primary">
              Browse workouts
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/exercises" className="btn-ghost">
              Exercise library
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="container-app py-16">
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Target, title: 'Level-matched', text: 'Beginner to advanced programs.' },
            { icon: Zap, title: 'Video demos', text: 'Form cues with YouTube embeds.' },
            { icon: Flame, title: 'Favorites', text: 'Save workouts when signed in.' },
          ].map(({ icon: Icon, title, text }, i) => (
            <motion.div
              key={title}
              className="card p-5"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
            >
              <Icon className="mb-3 h-5 w-5 text-[var(--color-accent)]" />
              <h3 className="font-display font-bold">{title}</h3>
              <p className="mt-1 text-sm text-[var(--color-muted)]">{text}</p>
            </motion.div>
          ))}
        </div>

        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-bold">Featured programs</h2>
            <p className="text-sm text-[var(--color-muted)]">Start with one of our seeded plans.</p>
          </div>
          <Link to="/workouts" className="text-sm font-semibold text-[var(--color-accent)]">
            View all
          </Link>
        </div>

        {loading ? (
          <Spinner />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((w, i) => (
              <WorkoutCard key={w.id} workout={w} index={i} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
