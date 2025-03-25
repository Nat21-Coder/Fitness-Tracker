export interface Exercise {
  id: string
  name: string
  category: string // e.g., "cardio", "strength", "flexibility"
  targetMuscleGroups?: string[] // e.g., "chest", "legs", "core"
  equipment?: string[] // e.g., "dumbbells", "treadmill", "bodyweight"
}

export interface WorkoutTemplate {
  id: string
  name: string
  description: string
  category: string // e.g., "cardio", "strength", "hiit", "yoga"
  recommendedDuration: number
  estimatedCalories: number
  suitableExercises: string[] // IDs of exercises suitable for this workout
  targetGoals: string[] // Types of goals this workout helps with, e.g., "weight loss", "muscle gain"
}

export interface Workout {
  id: string
  templateId?: string // Reference to the template used
  name: string
  date: string
  duration: number // in minutes
  calories: number
  exercises: string[]
  goalId?: string // Optional ID of the goal this workout contributes to (can only be associated with one goal)
}

export interface Goal {
  id: string
  name: string
  targetDate: string
  targetValue: number
  currentValue: number
  unit: string
  goalType: "increase" | "decrease"
  category: string // e.g., "weight loss", "muscle gain", "endurance"
  metricToTrack: "duration" | "calories" | "workouts" | "custom" // What metric this goal tracks
  progress: ProgressEntry[] // Array of progress entries from workouts
}

export interface ProgressEntry {
  date: string
  value: number
  workoutId: string
  workoutName: string
}

