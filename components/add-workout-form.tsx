"use client"

import { useState, useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Workout, Goal, Exercise } from "@/lib/types"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription } from "@/components/ui/card"
import { workoutTemplates, getExercisesForWorkout, getExerciseById } from "@/lib/workout-data"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface AddWorkoutFormProps {
  onAddWorkout: (workout: Workout) => void
  onCancel: () => void
  goals: Goal[]
}

interface WorkoutFormValues {
  templateId: string
  name: string
  date: Date
  duration: string
  calories: string
  exercises: string[]
  goalId: string
}

export default function AddWorkoutForm({ onAddWorkout, onCancel, goals }: AddWorkoutFormProps) {
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([])
  const [compatibleGoals, setCompatibleGoals] = useState<Goal[]>([])

  // Initialize React Hook Form
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
    reset,
    clearErrors,
  } = useForm<WorkoutFormValues>({
    defaultValues: {
      templateId: "",
      name: "",
      date: new Date(),
      duration: "",
      calories: "",
      exercises: [],
      goalId: "",
    },
    mode: "onBlur", // You can change this to "onChange", "onSubmit", or "onTouched"
  })

  // Watch for template changes
  const selectedTemplate = watch("templateId")
  const selectedExercises = watch("exercises")

  // Update form when template is selected
  useEffect(() => {
    if (selectedTemplate) {
      const template = workoutTemplates.find((t) => t.id === selectedTemplate)
      if (template) {
        // Set default values based on template
        setValue("name", template.name)
        setValue("duration", template.recommendedDuration.toString())
        setValue("calories", template.estimatedCalories.toString())
        setValue("exercises", [])

        // Get available exercises for this template
        setAvailableExercises(getExercisesForWorkout(template.id))

        // Find goals that are compatible with this workout template
        const compatible = goals.filter((goal) => {
          // Skip completed goals
          const isComplete =
            goal.goalType === "increase" ? goal.currentValue >= goal.targetValue : goal.currentValue <= goal.targetValue

          if (isComplete) return false

          // Check if this workout template targets the goal's category
          return template.targetGoals.includes(goal.category)
        })

        setCompatibleGoals(compatible)
        setValue("goalId", "")

        // Clear any existing errors when template changes
        clearErrors()
      }
    } else {
      setAvailableExercises([])
      setCompatibleGoals([])
    }
  }, [selectedTemplate, goals, setValue, clearErrors])

  // Toggle exercise selection
  const toggleExercise = (exerciseId: string) => {
    const currentExercises = [...selectedExercises]

    const newExercises = currentExercises.includes(exerciseId)
      ? currentExercises.filter((id) => id !== exerciseId)
      : [...currentExercises, exerciseId]

    // Update the exercises field
    setValue("exercises", newExercises, {
      shouldValidate: true, // This triggers validation after setting the value
      shouldDirty: true,
      shouldTouch: true,
    })

    // If we're adding an exercise and there was an error, clear it
    if (newExercises.length > 0 && errors.exercises) {
      clearErrors("exercises")
    }
  }

  // Form submission handler
  const onSubmit = (data: WorkoutFormValues) => {
    // Get exercise names for the workout
    const exerciseNames = data.exercises.map((id) => {
      const exercise = getExerciseById(id)
      return exercise ? exercise.name : id
    })

    // Create new workout
    const newWorkout: Workout = {
      id: crypto.randomUUID(),
      templateId: data.templateId,
      name: data.name,
      date: data.date.toISOString(),
      duration: Number(data.duration),
      calories: Number(data.calories),
      exercises: exerciseNames,
      goalId: data.goalId || undefined,
    }

    onAddWorkout(newWorkout)
    reset() // Reset form after submission
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="templateId">Workout Type</Label>
        <Controller
          name="templateId"
          control={control}
          rules={{ required: "Please select a workout type" }}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange} onBlur={field.onBlur}>
              <SelectTrigger id="templateId">
                <SelectValue placeholder="Select a workout type" />
              </SelectTrigger>
              <SelectContent>
                {workoutTemplates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.templateId && <p className="text-sm text-destructive">{errors.templateId.message}</p>}
      </div>

      {selectedTemplate && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Workout Name</Label>
              <Input
                id="name"
                {...register("name", {
                  required: "Workout name is required",
                })}
                placeholder="e.g., Morning Run, Upper Body"
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Controller
                name="date"
                control={control}
                rules={{ required: "Date is required" }}
                render={({ field }) => (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !field.value && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => date && field.onChange(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              />
              {errors.date && <p className="text-sm text-destructive">{errors.date.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                {...register("duration", {
                  required: "Duration is required",
                  min: {
                    value: 1,
                    message: "Duration must be a positive number",
                  },
                  validate: (value) => !isNaN(Number(value)) || "Duration must be a number",
                })}
                placeholder="e.g., 45"
                min="1"
              />
              {errors.duration && <p className="text-sm text-destructive">{errors.duration.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="calories">Calories Burned</Label>
              <Input
                id="calories"
                type="number"
                {...register("calories", {
                  required: "Calories is required",
                  min: {
                    value: 1,
                    message: "Calories must be a positive number",
                  },
                  validate: (value) => !isNaN(Number(value)) || "Calories must be a number",
                })}
                placeholder="e.g., 300"
                min="1"
              />
              {errors.calories && <p className="text-sm text-destructive">{errors.calories.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Exercises</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Select exercises recommended for this workout type</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <Controller
              name="exercises"
              control={control}
              rules={{
                validate: (value) => value.length > 0 || "At least one exercise is required",
              }}
              render={({ field }) => (
                <>
                  {availableExercises.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                      {availableExercises.map((exercise) => (
                        <div key={exercise.id} className="flex items-start space-x-2">
                          <Checkbox
                            id={`exercise-${exercise.id}`}
                            checked={field.value.includes(exercise.id)}
                            onCheckedChange={() => toggleExercise(exercise.id)}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label htmlFor={`exercise-${exercise.id}`} className="text-sm font-medium cursor-pointer">
                              {exercise.name}
                            </Label>
                            <p className="text-xs text-muted-foreground">
                              {exercise.category}
                              {exercise.targetMuscleGroups && ` • ${exercise.targetMuscleGroups.join(", ")}`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Select a workout type to see available exercises</p>
                  )}
                </>
              )}
            />
            {errors.exercises && <p className="text-sm text-destructive">{errors.exercises.message}</p>}
          </div>

          {compatibleGoals.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-base">Associate with a goal (optional):</Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Info className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Select a goal that this workout will contribute to</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <CardDescription>These goals are compatible with the selected workout type</CardDescription>

                  <Controller
                    name="goalId"
                    control={control}
                    render={({ field }) => (
                      <RadioGroup value={field.value} onValueChange={field.onChange} className="mt-3">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="" id="no-goal" />
                            <Label htmlFor="no-goal" className="cursor-pointer">
                              None (don't associate with any goal)
                            </Label>
                          </div>

                          {compatibleGoals.map((goal) => (
                            <div key={goal.id} className="flex items-start space-x-2">
                              <RadioGroupItem value={goal.id} id={`goal-${goal.id}`} />
                              <div className="grid gap-1.5 leading-none">
                                <Label htmlFor={`goal-${goal.id}`} className="text-sm font-medium cursor-pointer">
                                  {goal.name}
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                  Target: {goal.targetValue} {goal.unit} by{" "}
                                  {format(new Date(goal.targetDate), "MMM d, yyyy")}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </RadioGroup>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          Save Workout
        </Button>
      </div>
    </form>
  )
}

