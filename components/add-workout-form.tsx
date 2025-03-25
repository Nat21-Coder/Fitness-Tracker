"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Workout, Goal, Exercise } from "@/types";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription } from "@/components/ui/card";
import {
  getExercisesForWorkout,
  getExerciseById,
} from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { workoutTemplates } from "@/constants";

interface AddWorkoutFormProps {
  onAddWorkout: (workout: Workout) => void;
  onCancel: () => void;
  goals: Goal[];
}

interface WorkoutFormValues {
  templateId: string;
  name: string;
  date: Date;
  duration: string;
  calories: string;
  exercises: string[];
  goalId: string;
}

export default function AddWorkoutForm({
  onAddWorkout,
  onCancel,
  goals,
}: AddWorkoutFormProps) {
  const [availableExercises, setAvailableExercises] = useState<Exercise[]>([]);
  const [compatibleGoals, setCompatibleGoals] = useState<Goal[]>([]);
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
    mode: "onBlur",
  });

  const selectedTemplate = watch("templateId");
  const selectedExercises = watch("exercises");
  useEffect(() => {
    if (selectedTemplate) {
      const template = workoutTemplates.find((t) => t.id === selectedTemplate);
      if (template) {
        setValue("name", template.name);
        setValue("duration", template.recommendedDuration.toString());
        setValue("calories", template.estimatedCalories.toString());
        setValue("exercises", []);
        setAvailableExercises(getExercisesForWorkout(template.id));
        const compatible = goals.filter((goal) => {
          const isComplete =
            goal.goalType === "increase"
              ? goal.currentValue >= goal.targetValue
              : goal.currentValue <= goal.targetValue;

          if (isComplete) return false;
          return template.targetGoals.includes(goal.category);
        });

        setCompatibleGoals(compatible);
        setValue("goalId", "");
        clearErrors();
      }
    } else {
      setAvailableExercises([]);
      setCompatibleGoals([]);
    }
  }, [selectedTemplate, goals, setValue, clearErrors]);

  //TOGGLE EXERCISE SELECTION
  const toggleExercise = (exerciseId: string) => {
    const currentExercises = [...selectedExercises];

    const newExercises = currentExercises.includes(exerciseId)
      ? currentExercises.filter((id) => id !== exerciseId)
      : [...currentExercises, exerciseId];

    setValue("exercises", newExercises, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });

    // CLEAR EXERCISES
    if (newExercises.length > 0 && errors.exercises) {
      clearErrors("exercises");
    }
  };

  // FORM SUBMITION HANDLER
  const onSubmit = (data: WorkoutFormValues) => {
    const exerciseNames = data.exercises.map((id) => {
      const exercise = getExerciseById(id);
      return exercise ? exercise.name : id;
    });

    // CREATE YOUR NEW WORKOUT
    const newWorkout: Workout = {
      id: crypto.randomUUID(),
      templateId: data.templateId,
      name: data.name,
      date: data.date.toISOString(),
      duration: Number(data.duration),
      calories: Number(data.calories),
      exercises: exerciseNames,
      goalId: data.goalId || undefined,
    };

    onAddWorkout(newWorkout);
    reset();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6 sm:px-4"
    >
      <div className="">
        <h3 className="text-base font-semibold mb-2">Workout Details</h3>
        <div className="flex flex-col gap-2 mb-4">
          <Label htmlFor="date">Workout Date</Label>
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
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>Select a date</span>
                    )}
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
          {errors.date && (
            <p className="text-sm text-destructive">{errors.date.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
          <div className="w-full sm:w-1/2 flex flex-col gap-2">
            <Label htmlFor="templateId">Workout Type</Label>
            <Controller
              name="templateId"
              control={control}
              rules={{ required: "Please select a workout type" }}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                >
                  <SelectTrigger id="templateId">
                    <SelectValue placeholder="Choose a workout type" />
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
            {errors.templateId && (
              <p className="text-sm text-destructive">
                {errors.templateId.message}
              </p>
            )}
          </div>

          <div className="w-full sm:w-1/2 flex flex-col gap-2">
            <Label htmlFor="name">Workout Name</Label>
            <Input
              id="name"
              {...register("name", { required: "Workout name is required" })}
              placeholder="e.g., Strength Training, Cardio Blast"
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="">
        <h3 className="text-base font-semibold mb-2">Select Exercises</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Exercises</Label>
            <TooltipProvider >
              <Tooltip >
                <TooltipTrigger type="button">
                    <Info className="h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent className="text-sm">
                  <p>Choose <br/> exercises <br/> that <br/> fit your <br/> workout <br/> type</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <Controller
            name="exercises"
            control={control}
            rules={{
              validate: (value) =>
                value.length > 0 || "Please select at least one exercise",
            }}
            render={({ field }) => (
              <>
                {availableExercises.length > 0 ? (
                  <div className="flex flex-col flex-wrap gap-2 mt-2">
                    {availableExercises.map((exercise) => (
                      <Label
                        key={exercise.id}
                        htmlFor={`exercise-${exercise.id}`}
                        className={cn(
                          "flex items-start gap-2 cursor-pointer p-2 border rounded",
                          {
                            "bg-gray-300 dark:bg-gray-800":
                              field.value.includes(exercise.id),
                            "hover:bg-gray-100 hover:dark:bg-gray-600":
                              !field.value.includes(exercise.id),
                          }
                        )}
                      >
                        <Checkbox
                          id={`exercise-${exercise.id}`}
                          checked={field.value.includes(exercise.id)}
                          onCheckedChange={() => toggleExercise(exercise.id)}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <span className="text-sm font-medium">
                            {exercise.name}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {exercise.category}
                            {exercise.targetMuscleGroups &&
                              ` • ${exercise.targetMuscleGroups.join(", ")}`}
                          </p>
                        </div>
                      </Label>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Select a workout type to see available exercises
                  </p>
                )}
              </>
            )}
          />
          {errors.exercises && (
            <p className="text-sm text-destructive">
              {errors.exercises.message}
            </p>
          )}
        </div>
      </div>

      <div className="">
        <h3 className="text-base font-semibold mb-2">Track Your Progress</h3>
        <div className="flex flex-col gap-6 sm:flex-row sm:justify-between">
          <div className="w-full sm:w-1/2 flex flex-col gap-2">
            <Label htmlFor="duration">Workout Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              {...register("duration", {
                required: "Duration is required",
                min: { value: 1, message: "Enter a positive number" },
                validate: (value) =>
                  !isNaN(Number(value)) || "Enter a valid number",
              })}
              placeholder="e.g., 45"
              min="1"
            />
            {errors.duration && (
              <p className="text-sm text-destructive">
                {errors.duration.message}
              </p>
            )}
          </div>

          <div className="w-full sm:w-1/2 flex flex-col gap-2">
            <Label htmlFor="calories">Calories Burned</Label>
            <Input
              id="calories"
              type="number"
              {...register("calories", {
                required: "Calories burned is required",
                min: { value: 1, message: "Enter a positive number" },
                validate: (value) =>
                  !isNaN(Number(value)) || "Enter a valid number",
              })}
              placeholder="e.g., 300"
              min="1"
            />
            {errors.calories && (
              <p className="text-sm text-destructive">
                {errors.calories.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {compatibleGoals.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-base font-semibold mb-2">
              Link to Your Fitness Goals
            </h3>
            <CardDescription>
              Choose a goal this workout contributes to (optional)
            </CardDescription>
            <Controller
              name="goalId"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="mt-3"
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="" id="no-goal" />
                      <Label htmlFor="no-goal" className="cursor-pointer">
                        No Goal
                      </Label>
                    </div>
                    {compatibleGoals.map((goal) => (
                      <div key={goal.id} className="flex items-start space-x-2">
                        <RadioGroupItem
                          value={goal.id}
                          id={`goal-${goal.id}`}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label
                            htmlFor={`goal-${goal.id}`}
                            className="text-sm font-medium cursor-pointer"
                          >
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
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-2 pt-2 ">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          Save Workout
        </Button>
      </div>
    </form>
  );
}
