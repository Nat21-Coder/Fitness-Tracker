"use client"

import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Goal } from "@/lib/types"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, addDays } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { goalCategories } from "@/lib/workout-data"

interface AddGoalFormProps {
  onAddGoal: (goal: Goal) => void
  onCancel: () => void
}

interface GoalFormValues {
  name: string
  category: string
  targetDate: Date
  targetValue: string
  currentValue: string
  unit: string
  goalType: "increase" | "decrease"
  metricToTrack: "duration" | "calories" | "workouts" | "custom"
}

export default function AddGoalForm({ onAddGoal, onCancel }: AddGoalFormProps) {
  // Initialize React Hook Form
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<GoalFormValues>({
    defaultValues: {
      name: "",
      category: "",
      targetDate: addDays(new Date(), 30), // Default to 30 days from now
      targetValue: "",
      currentValue: "0", // Start with zero progress
      unit: "kg",
      goalType: "increase",
      metricToTrack: "custom",
    },
    mode: "onBlur", // You can change this to "onChange", "onSubmit", or "onTouched"
  })

  // Watch for metric changes
  const metricToTrack = watch("metricToTrack")

  // Update unit based on metric selection
  useEffect(() => {
    switch (metricToTrack) {
      case "duration":
        setValue("unit", "min")
        break
      case "calories":
        setValue("unit", "cal")
        break
      case "workouts":
        setValue("unit", "workouts")
        break
      // For custom, keep the current unit
    }
  }, [metricToTrack, setValue])

  // Form submission handler
  const onSubmit = (data: GoalFormValues) => {
    // Create new goal with empty progress
    const newGoal: Goal = {
      id: crypto.randomUUID(),
      name: data.name,
      category: data.category,
      targetDate: data.targetDate.toISOString(),
      targetValue: Number(data.targetValue),
      currentValue: Number(data.currentValue),
      unit: data.unit,
      goalType: data.goalType,
      metricToTrack: data.metricToTrack,
      progress: [],
    }

    onAddGoal(newGoal)
    reset() // Reset form after submission
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Goal Name</Label>
          <Input
            id="name"
            {...register("name", {
              required: "Goal name is required",
            })}
            placeholder="e.g., Lose Weight, Run 10K"
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Goal Category</Label>
          <Controller
            name="category"
            control={control}
            rules={{ required: "Goal category is required" }}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange} onBlur={field.onBlur}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select goal category" />
                </SelectTrigger>
                <SelectContent>
                  {goalCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetDate">Target Date</Label>
          <Controller
            name="targetDate"
            control={control}
            rules={{ required: "Target date is required" }}
            render={({ field }) => (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="targetDate"
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
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
            )}
          />
          {errors.targetDate && <p className="text-sm text-destructive">{errors.targetDate.message}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>What do you want to track?</Label>
          <Controller
            name="metricToTrack"
            control={control}
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={(value) => field.onChange(value as any)}
                className="grid grid-cols-2 gap-4 pt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="duration" id="duration" />
                  <Label htmlFor="duration" className="cursor-pointer">
                    Workout Duration
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="calories" id="calories" />
                  <Label htmlFor="calories" className="cursor-pointer">
                    Calories Burned
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="workouts" id="workouts" />
                  <Label htmlFor="workouts" className="cursor-pointer">
                    Number of Workouts
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom" className="cursor-pointer">
                    Custom Metric
                  </Label>
                </div>
              </RadioGroup>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentValue">Current Value</Label>
          <Input
            id="currentValue"
            type="number"
            {...register("currentValue", {
              required: "Current value is required",
              min: {
                value: 0,
                message: "Current value must be a non-negative number",
              },
              validate: (value) => !isNaN(Number(value)) || "Current value must be a number",
            })}
            placeholder={`e.g., 70`}
            min="0"
            step="0.1"
          />
          {errors.currentValue && <p className="text-sm text-destructive">{errors.currentValue.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetValue">Target Value</Label>
          <Input
            id="targetValue"
            type="number"
            {...register("targetValue", {
              required: "Target value is required",
              min: {
                value: 0.1,
                message: "Target value must be a positive number",
              },
              validate: (value) => !isNaN(Number(value)) || "Target value must be a number",
            })}
            placeholder={`e.g., 65`}
            min="0.1"
            step="0.1"
          />
          {errors.targetValue && <p className="text-sm text-destructive">{errors.targetValue.message}</p>}
        </div>

        {metricToTrack === "custom" && (
          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <Controller
              name="unit"
              control={control}
              rules={{ required: "Unit is required" }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} onBlur={field.onBlur}>
                  <SelectTrigger id="unit">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">Kilograms (kg)</SelectItem>
                    <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                    <SelectItem value="km">Kilometers (km)</SelectItem>
                    <SelectItem value="miles">Miles</SelectItem>
                    <SelectItem value="reps">Repetitions</SelectItem>
                    <SelectItem value="min">Minutes</SelectItem>
                    <SelectItem value="cal">Calories</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.unit && <p className="text-sm text-destructive">{errors.unit.message}</p>}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="goalType">Goal Direction</Label>
          <Controller
            name="goalType"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(value) => field.onChange(value as "increase" | "decrease")}
                onBlur={field.onBlur}
              >
                <SelectTrigger id="goalType">
                  <SelectValue placeholder="Select goal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="increase">Increase (higher is better)</SelectItem>
                  <SelectItem value="decrease">Decrease (lower is better)</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <p className="text-xs text-muted-foreground">
            For weight loss, select "Decrease". For fitness goals like distance or reps, select "Increase".
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          Save Goal
        </Button>
      </div>
    </form>
  )
}

