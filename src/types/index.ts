export type WorkoutLevel = 'beginner' | 'intermediate' | 'advanced'

export interface Workout {
  id: string
  title: string
  description: string
  level: WorkoutLevel
  duration: number
  created_at: string
}

export interface Exercise {
  id: string
  name: string
  description: string
  video_url: string | null
  image_url: string | null
  muscle_group: string
}

export interface WorkoutExercise {
  id: string
  workout_id: string
  exercise_id: string
  sets: number
  reps: number
  exercise?: Exercise
}

export interface Favorite {
  id: string
  user_id: string
  workout_id: string
  workout?: Workout
}

export interface Message {
  id: string
  name: string
  email: string
  message: string
  created_at: string
}

export interface Profile {
  id: string
  email: string | null
  is_admin: boolean
  created_at: string
}

export interface WorkoutWithExercises extends Workout {
  workout_exercises: (WorkoutExercise & { exercises: Exercise })[]
}
