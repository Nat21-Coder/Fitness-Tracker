"use client"

import type React from "react"

import { useState, useEffect } from "react"
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

export default function AddWorkoutForm({ onAddWorkout, onCancel, goals }: AddWorkoutFormProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("")
  const [name, setName] = useState("")
  const [date, setDate] = useState<Date>(new Date())
  const [duration, setDuration] = useState("")
  const [calories, setCalories] = useState("")
  const [selectedExercises, setSelectedExercises] = useState<string[]>([])
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([])
  const [selectedGoalId, setSelectedGoalId] = useState<string>("")
  const [compatibleGoals, setCompatibleGoals] = useState<Goal[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Update form when template is selected
  useEffect(() => {
    if (selectedTemplate) {
      const template = workoutTemplates.find((t) => t.id === selectedTemplate)
      if (template) {
        setName(template.name)
        setDuration(template.recommendedDuration.toString())
        setCalories(template.estimatedCalories.toString())
        setAvailableExercises(getExercisesForWorkout(template.id))
        setSelectedExercises([])

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
        setSelectedGoalId("")
      }
    } else {
      setAvailableExercises([])
      setCompatibleGoals([])
    }
  }, [selectedTemplate, goals])

  const toggleExercise = (exerciseId: string) => {
    if (selectedExercises.includes(exerciseId)) {
      setSelectedExercises(selectedExercises.filter((id) => id !== exerciseId))
    } else {
      setSelectedExercises([...selectedExercises, exerciseId])
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const newErrors: Record<string, string> = {}

    if (!selectedTemplate) newErrors.template = "Please select a workout type"
    if (!name.trim()) newErrors.name = "Workout name is required"
    if (!date) newErrors.date = "Date is required"
    if (!duration.trim()) newErrors.duration = "Duration is required"
    if (isNaN(Number(duration)) || Number(duration) <= 0) newErrors.duration = "Duration must be a positive number"
    if (!calories.trim()) newErrors.calories = "Calories is required"
    if (isNaN(Number(calories)) || Number(calories) <= 0) newErrors.calories = "Calories must be a positive number"
    if (selectedExercises.length === 0) newErrors.exercises = "At least one exercise is required"

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    // Get exercise names for the workout
    const exerciseNames = selectedExercises.map((id) => {
      const exercise = getExerciseById(id)
      return exercise ? exercise.name : id
    })

    // Create new workout
    const newWorkout: Workout = {
      id: crypto.randomUUID(),
      templateId: selectedTemplate,
      name,
      date: date.toISOString(),
      duration: Number(duration),
      calories: Number(calories),
      exercises: exerciseNames,
      goalId: selectedGoalId || undefined,
    }

    onAddWorkout(newWorkout)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="template">Workout Type</Label>
        <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
          <SelectTrigger id="template">
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
        {errors.template && <p className="text-sm text-destructive">{errors.template}</p>}
      </div>

      {selectedTemplate && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Workout Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Morning Run, Upper Body"
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                </PopoverContent>
              </Popover>
              {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g., 45"
                min="1"
              />
              {errors.duration && <p className="text-sm text-destructive">{errors.duration}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="calories">Calories Burned</Label>
              <Input
                id="calories"
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="e.g., 300"
                min="1"
              />
              {errors.calories && <p className="text-sm text-destructive">{errors.calories}</p>}
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

            {availableExercises.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                {availableExercises.map((exercise) => (
                  <div key={exercise.id} className="flex items-start space-x-2">
                    <Checkbox
                      id={`exercise-${exercise.id}`}
                      checked={selectedExercises.includes(exercise.id)}
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
            {errors.exercises && <p className="text-sm text-destructive">{errors.exercises}</p>}
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

                  <RadioGroup value={selectedGoalId} onValueChange={setSelectedGoalId} className="mt-3">
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
        <Button type="submit">Save Workout</Button>
      </div>
    </form>
  )
}

