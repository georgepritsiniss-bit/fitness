import { useCallback, useEffect, useState } from 'react'
import {
  addFavorite,
  fetchFavorites,
  isFavorite,
  removeFavorite,
} from '../services/api'
import type { Favorite } from '../types'
import { useAuth } from '../context/AuthContext'

export function useFavoritesList() {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    if (!user) {
      setFavorites([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await fetchFavorites(user.id)
      setFavorites(data)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load favorites')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void reload()
  }, [reload])

  return { favorites, loading, error, reload }
}

export function useFavoriteToggle(workoutId: string) {
  const { user } = useAuth()
  const [favorited, setFavorited] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !workoutId) {
      setFavorited(false)
      return
    }
    let cancelled = false
    isFavorite(user.id, workoutId)
      .then((v) => {
        if (!cancelled) setFavorited(v)
      })
      .catch(() => {
        if (!cancelled) setFavorited(false)
      })
    return () => {
      cancelled = true
    }
  }, [user, workoutId])

  const toggle = useCallback(async () => {
    if (!user) {
      setError('Please log in to manage favorites.')
      return false
    }
    setBusy(true)
    setError(null)
    try {
      if (favorited) {
        await removeFavorite(user.id, workoutId)
        setFavorited(false)
      } else {
        await addFavorite(user.id, workoutId)
        setFavorited(true)
      }
      return true
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update favorite')
      return false
    } finally {
      setBusy(false)
    }
  }, [user, favorited, workoutId])

  return { favorited, busy, error, toggle }
}
