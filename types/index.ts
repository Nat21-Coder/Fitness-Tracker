export interface Exercise {
  id: string;
  name: string;
  category: string;
  targetMuscleGroups?: string[];
  equipment?: string[];
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  recommendedDuration: number;
  estimatedCalories: number;
  suitableExercises: string[];
  targetGoals: string[];
}

export interface Workout {
  id: string;
  templateId?: string;
  name: string;
  date: string;
  duration: number;
  calories: number;
  exercises: string[];
  goalId?: string;
}

export interface Goal {
  id: string;
  name: string;
  targetDate: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  goalType: "increase" | "decrease";
  category: string;
  metricToTrack: string;
  progress: ProgressEntry[];
  progressPercentage:number
}

export interface ProgressEntry {
  goalId: string;
  name: string;
  date: Date;
  value: number;
  unit: string;
  percentage:number
}
