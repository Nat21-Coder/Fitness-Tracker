import type { Exercise, WorkoutTemplate } from "@/types";

// Predefined exercises
export const exercises: Exercise[] = [
  {
    id: "ex-1",
    name: "Running",
    category: "cardio",
    equipment: ["treadmill", "outdoor"],
  },
  {
    id: "ex-2",
    name: "Cycling",
    category: "cardio",
    equipment: ["stationary bike", "outdoor"],
  },
  {
    id: "ex-3",
    name: "Push-ups",
    category: "strength",
    targetMuscleGroups: ["chest", "shoulders", "triceps"],
    equipment: ["bodyweight"],
  },
  {
    id: "ex-4",
    name: "Pull-ups",
    category: "strength",
    targetMuscleGroups: ["back", "biceps"],
    equipment: ["pull-up bar"],
  },
  {
    id: "ex-5",
    name: "Squats",
    category: "strength",
    targetMuscleGroups: ["legs", "glutes"],
    equipment: ["bodyweight", "barbell", "dumbbells"],
  },
  {
    id: "ex-6",
    name: "Deadlifts",
    category: "strength",
    targetMuscleGroups: ["back", "legs", "glutes"],
    equipment: ["barbell", "dumbbells"],
  },
  {
    id: "ex-7",
    name: "Bench Press",
    category: "strength",
    targetMuscleGroups: ["chest", "shoulders", "triceps"],
    equipment: ["barbell", "dumbbells"],
  },
  {
    id: "ex-8",
    name: "Planks",
    category: "strength",
    targetMuscleGroups: ["core"],
    equipment: ["bodyweight"],
  },
  {
    id: "ex-9",
    name: "Jumping Jacks",
    category: "cardio",
    equipment: ["bodyweight"],
  },
  {
    id: "ex-10",
    name: "Burpees",
    category: "hiit",
    targetMuscleGroups: ["full body"],
    equipment: ["bodyweight"],
  },
  {
    id: "ex-11",
    name: "Mountain Climbers",
    category: "hiit",
    targetMuscleGroups: ["core", "shoulders"],
    equipment: ["bodyweight"],
  },
  {
    id: "ex-12",
    name: "Yoga Flow",
    category: "flexibility",
    targetMuscleGroups: ["full body"],
    equipment: ["yoga mat"],
  },
  {
    id: "ex-13",
    name: "Lunges",
    category: "strength",
    targetMuscleGroups: ["legs", "glutes"],
    equipment: ["bodyweight", "dumbbells"],
  },
  {
    id: "ex-14",
    name: "Shoulder Press",
    category: "strength",
    targetMuscleGroups: ["shoulders", "triceps"],
    equipment: ["dumbbells", "barbell"],
  },
  {
    id: "ex-15",
    name: "Bicep Curls",
    category: "strength",
    targetMuscleGroups: ["biceps"],
    equipment: ["dumbbells", "barbell"],
  },
];

// Predefined workout templates
export const workoutTemplates: WorkoutTemplate[] = [
  {
    id: "wt-1",
    name: "Cardio Blast",
    description:
      "High-intensity cardio workout to burn calories and improve endurance",
    category: "cardio",
    recommendedDuration: 30,
    estimatedCalories: 300,
    suitableExercises: ["ex-1", "ex-2", "ex-9"],
    targetGoals: ["weight loss", "endurance"],
  },
  {
    id: "wt-2",
    name: "Upper Body Strength",
    description: "Focus on building upper body strength and muscle definition",
    category: "strength",
    recommendedDuration: 45,
    estimatedCalories: 250,
    suitableExercises: ["ex-3", "ex-4", "ex-7", "ex-14", "ex-15"],
    targetGoals: ["muscle gain", "strength"],
  },
  {
    id: "wt-3",
    name: "Lower Body Strength",
    description: "Target your legs and glutes for strength and toning",
    category: "strength",
    recommendedDuration: 45,
    estimatedCalories: 280,
    suitableExercises: ["ex-5", "ex-6", "ex-13"],
    targetGoals: ["muscle gain", "strength"],
  },
  {
    id: "wt-4",
    name: "Full Body HIIT",
    description: "High-intensity interval training for maximum calorie burn",
    category: "hiit",
    recommendedDuration: 25,
    estimatedCalories: 350,
    suitableExercises: ["ex-3", "ex-5", "ex-9", "ex-10", "ex-11"],
    targetGoals: ["weight loss", "endurance", "muscle tone"],
  },
  {
    id: "wt-5",
    name: "Core Crusher",
    description: "Focus on strengthening your core and improving stability",
    category: "strength",
    recommendedDuration: 30,
    estimatedCalories: 200,
    suitableExercises: ["ex-8", "ex-11", "ex-5"],
    targetGoals: ["muscle tone", "strength"],
  },
  {
    id: "wt-6",
    name: "Flexibility & Recovery",
    description: "Gentle stretching and mobility exercises for recovery days",
    category: "flexibility",
    recommendedDuration: 40,
    estimatedCalories: 150,
    suitableExercises: ["ex-12"],
    targetGoals: ["flexibility", "recovery"],
  },
];

// Goal categories
export const goalCategories = [
  {
    name: "weight loss",
    metricUnits: [
      {
        title: "Body weight",
        unit: "kg",
      },
      {
        title: "Body fat percentage",
        unit: "%",
      },
      {
        title: "Waist circumference ",
        unit: "cm/inches",
      },
    ],
  },
  {
    name: "muscle gain",
    metricUnits: [
      {
        title: " Muscle mass",
        unit: "kg/lbs",
      },
     
      {
        title: "Max reps with fixed load",
        unit: "count",
      },
    ],
  },
  {
    name: "endurance",
    metricUnits: [
      {
        title: "Cardio duration ",
        unit: "minutes",
      },
      {
        title: "Distance covered",
        unit: "km/miles",
      },
      {
        title: "Heart rate recovery time",
        unit: "seconds",
      },
      {
        title: "Max sustained power output",
        unit: "Watts",
      },
    ],
  },
  {
    name: "strength",
    metricUnits: [
      {
        title: "Max reps with fixed load",
        unit: "Count",
      },
      {
        title: "Time to complete weighted movements",
        unit: "Seconds",
      },
    ],
  },
  {
    name: "flexibility",
    metricUnits: [
      {
        title: "Range of motion",
        unit: "degress",
      },
      {
        title: "Hold duration",
        unit: "seconds",
      },
    ],
  },
  {
    name: "muscle tone",
    metricUnits: [
      { title: "Body fat percentage", unit: "%" },
      { title: "Muscle mass", unit: "lbs" },
    ],
  },
  {
    name: "recovery",
    metricUnits: [
      {
        title: "Resting heart rate",
        unit: "bpm",
      },
      {
        title: "Sleep quality/duration ",
        unit: "hours",
      },
      {
        title: "Perceived exertion scale ",
        unit: "RPE 1-10",
      },
    ],
  },
];
