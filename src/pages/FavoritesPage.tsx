import { Link } from 'react-router-dom'
import { useFavoritesList } from '../hooks/useFavorites'
import { WorkoutCard } from '../components/WorkoutCard'
import { EmptyState, ErrorState, PageHeader, Spinner } from '../components/ui'

export function FavoritesPage() {
  const { favorites, loading, error } = useFavoritesList()

  return (
    <div className="container-app py-10">
      <PageHeader
        title="Favorites"
        subtitle="Workouts you saved for quick access."
      />

      {loading && <Spinner />}
      {error && <ErrorState message={error} />}
      {!loading && !error && favorites.length === 0 && (
        <EmptyState title="No favorites yet.">
          <p className="mb-4">Browse programs and tap “Add to Favorites”.</p>
          <Link to="/workouts" className="btn-primary">
            Explore workouts
          </Link>
        </EmptyState>
      )}
      {!loading && !error && favorites.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((f, i) =>
            f.workout ? (
              <WorkoutCard key={f.id} workout={f.workout} index={i} />
            ) : null
          )}
        </div>
      )}
    </div>
  )
}
