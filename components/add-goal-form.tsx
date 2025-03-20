"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Goal } from "@/lib/types"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { goalCategories } from "@/lib/workout-data"

interface AddGoalFormProps {
  onAddGoal: (goal: Goal) => void
  onCancel: () => void
}

export default function AddGoalForm({ onAddGoal, onCancel }: AddGoalFormProps) {
  const [name, setName] = useState("")
  const [targetDate, setTargetDate] = useState<Date | undefined>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default to 30 days from now
  )
  const [targetValue, setTargetValue] = useState("")
  const [currentValue, setCurrentValue] = useState("")
  const [unit, setUnit] = useState("kg")
  const [goalType, setGoalType] = useState<"increase" | "decrease">("increase")
  const [metricToTrack, setMetricToTrack] = useState<"duration" | "calories" | "workouts" | "custom">("custom")
  const [category, setCategory] = useState<string>("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Update unit based on metric selection
  const handleMetricChange = (value: "duration" | "calories" | "workouts" | "custom") => {
    setMetricToTrack(value)

    // Set appropriate unit based on metric
    switch (value) {
      case "duration":
        setUnit("min")
        break
      case "calories":
        setUnit("cal")
        break
      case "workouts":
        setUnit("workouts")
        break
      case "custom":
        // Keep current unit for custom
        break
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form
    const newErrors: Record<string, string> = {}

    if (!name.trim()) newErrors.name = "Goal name is required"
    if (!category) newErrors.category = "Goal category is required"
    if (!targetDate) newErrors.targetDate = "Target date is required"
    if (!targetValue.trim()) newErrors.targetValue = "Target value is required"
    if (isNaN(Number(targetValue)) || Number(targetValue) <= 0)
      newErrors.targetValue = "Target value must be a positive number"
    if (!currentValue.trim()) newErrors.currentValue = "Current value is required"
    if (isNaN(Number(currentValue)) || Number(currentValue) < 0)
      newErrors.currentValue = "Current value must be a non-negative number"
    if (!unit) newErrors.unit = "Unit is required"

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) return

    // Create new goal with empty progress
    const newGoal: Goal = {
      id: crypto.randomUUID(),
      name,
      category,
      targetDate: targetDate!.toISOString(),
      targetValue: Number(targetValue),
      currentValue: Number(currentValue),
      unit,
      goalType,
      metricToTrack,
      progress: [],
    }

    onAddGoal(newGoal);
    
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Goal Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Lose Weight, Run 10K"
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Goal Category</Label>
          <Select value={category} onValueChange={setCategory}>
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
          {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetDate">Target Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="targetDate"
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !targetDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {targetDate ? format(targetDate, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={targetDate}
                onSelect={setTargetDate}
                initialFocus
                disabled={(date) => date < new Date()}
              />
            </PopoverContent>
          </Popover>
          {errors.targetDate && <p className="text-sm text-destructive">{errors.targetDate}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label>What do you want to track?</Label>
          <RadioGroup
            value={metricToTrack}
            onValueChange={(value) => handleMetricChange(value as any)}
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
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentValue">Current Value</Label>
          <Input
            id="currentValue"
            type="number"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            placeholder={`e.g., 70 ${unit}`}
            min="0"
            step="0.1"
          />
          {errors.currentValue && <p className="text-sm text-destructive">{errors.currentValue}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="targetValue">Target Value</Label>
          <Input
            id="targetValue"
            type="number"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
            placeholder={`e.g., 65 ${unit}`}
            min="0.1"
            step="0.1"
          />
          {errors.targetValue && <p className="text-sm text-destructive">{errors.targetValue}</p>}
        </div>

        {metricToTrack === "custom" && (
          <div className="space-y-2">
            <Label htmlFor="unit">Unit</Label>
            <Select value={unit} onValueChange={setUnit}>
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
            {errors.unit && <p className="text-sm text-destructive">{errors.unit}</p>}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="goalType">Goal Direction</Label>
          <Select value={goalType} onValueChange={(value) => setGoalType(value as "increase" | "decrease")}>
            <SelectTrigger id="goalType">
              <SelectValue placeholder="Select goal type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="increase">Increase (higher is better)</SelectItem>
              <SelectItem value="decrease">Decrease (lower is better)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            For weight loss, select "Decrease". For fitness goals like distance or reps, select "Increase".
          </p>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Goal</Button>
      </div>
    </form>
  )
}

