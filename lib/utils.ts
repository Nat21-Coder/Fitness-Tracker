import { exercises, workoutTemplates } from "@/constants"
import { Exercise, WorkoutTemplate } from "@/types"
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

// Get exercises for a specific workout template
export function getExercisesForWorkout(workoutTemplateId: string): Exercise[] {
  const template = workoutTemplates.find((t) => t.id === workoutTemplateId)
  if (!template) return []

  return exercises.filter((exercise) => template.suitableExercises.includes(exercise.id))
}

// Get workout templates suitable for a specific goal category
export function getWorkoutsForGoalCategory(category: string): WorkoutTemplate[] {
  return workoutTemplates.filter((template) => template.targetGoals.includes(category))
}

// Get exercise details by ID
export function getExerciseById(id: string): Exercise | undefined {
  return exercises.find((ex) => ex.id === id)
}

// Get workout template details by ID
export function getWorkoutTemplateById(id: string): WorkoutTemplate | undefined {
  return workoutTemplates.find((wt) => wt.id === id)
}