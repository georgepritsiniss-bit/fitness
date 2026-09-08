import {
  requireSupabase,
  supabase,
} from './supabase'
import type {
  Exercise,
  Favorite,
  Message,
  Profile,
  Workout,
  WorkoutExercise,
  WorkoutWithExercises,
} from '../types'

export async function fetchWorkouts(): Promise<Workout[]> {
  const { data, error } = await requireSupabase()
    .from('workouts')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function fetchWorkoutById(id: string): Promise<WorkoutWithExercises | null> {
  const { data, error } = await requireSupabase()
    .from('workouts')
    .select(`
      *,
      workout_exercises (
        id,
        workout_id,
        exercise_id,
        sets,
        reps,
        exercises (*)
      )
    `)
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data as WorkoutWithExercises | null
}

export async function fetchExercises(): Promise<Exercise[]> {
  const { data, error } = await requireSupabase()
    .from('exercises')
    .select('*')
    .order('name')
  if (error) throw error
  return data ?? []
}

export async function createWorkout(
  payload: Omit<Workout, 'id' | 'created_at'>
): Promise<Workout> {
  const { data, error } = await requireSupabase()
    .from('workouts')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateWorkout(
  id: string,
  payload: Partial<Omit<Workout, 'id' | 'created_at'>>
): Promise<Workout> {
  const { data, error } = await requireSupabase()
    .from('workouts')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteWorkout(id: string): Promise<void> {
  const { error } = await requireSupabase().from('workouts').delete().eq('id', id)
  if (error) throw error
}

export async function createExercise(
  payload: Omit<Exercise, 'id'>
): Promise<Exercise> {
  const { data, error } = await requireSupabase()
    .from('exercises')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateExercise(
  id: string,
  payload: Partial<Omit<Exercise, 'id'>>
): Promise<Exercise> {
  const { data, error } = await requireSupabase()
    .from('exercises')
    .update(payload)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteExercise(id: string): Promise<void> {
  const { error } = await requireSupabase().from('exercises').delete().eq('id', id)
  if (error) throw error
}

export async function fetchWorkoutExercises(workoutId: string): Promise<
  (WorkoutExercise & { exercises: Exercise })[]
> {
  const { data, error } = await requireSupabase()
    .from('workout_exercises')
    .select('*, exercises(*)')
    .eq('workout_id', workoutId)
  if (error) throw error
  return (data ?? []) as (WorkoutExercise & { exercises: Exercise })[]
}

export async function assignExerciseToWorkout(payload: {
  workout_id: string
  exercise_id: string
  sets: number
  reps: number
}): Promise<void> {
  const { error } = await requireSupabase().from('workout_exercises').upsert(payload, {
    onConflict: 'workout_id,exercise_id',
  })
  if (error) throw error
}

export async function removeExerciseFromWorkout(id: string): Promise<void> {
  const { error } = await requireSupabase().from('workout_exercises').delete().eq('id', id)
  if (error) throw error
}

export async function fetchFavorites(userId: string): Promise<Favorite[]> {
  const { data, error } = await requireSupabase()
    .from('favorites')
    .select('*, workout:workouts(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as Favorite[]
}

export async function isFavorite(userId: string, workoutId: string): Promise<boolean> {
  const { data, error } = await requireSupabase()
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('workout_id', workoutId)
    .maybeSingle()
  if (error) throw error
  return Boolean(data)
}

export async function addFavorite(userId: string, workoutId: string): Promise<void> {
  const { error } = await requireSupabase().from('favorites').insert({
    user_id: userId,
    workout_id: workoutId,
  })
  if (error) throw error
}

export async function removeFavorite(userId: string, workoutId: string): Promise<void> {
  const { error } = await requireSupabase()
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('workout_id', workoutId)
  if (error) throw error
}

export async function submitMessage(payload: {
  name: string
  email: string
  message: string
}): Promise<void> {
  const { error } = await requireSupabase().from('messages').insert(payload)
  if (error) throw error
}

export async function fetchMessages(): Promise<Message[]> {
  const { data, error } = await requireSupabase()
    .from('messages')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export async function deleteMessage(id: string): Promise<void> {
  const { error } = await requireSupabase().from('messages').delete().eq('id', id)
  if (error) throw error
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

/** Recommend workouts sharing level or overlapping duration window. */
export function recommendWorkouts(
  current: Workout,
  all: Workout[],
  limit = 3
): Workout[] {
  return all
    .filter((w) => w.id !== current.id)
    .map((w) => {
      let score = 0
      if (w.level === current.level) score += 3
      if (Math.abs(w.duration - current.duration) <= 15) score += 2
      return { w, score }
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.w)
}
