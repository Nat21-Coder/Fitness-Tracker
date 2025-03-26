"use client";

import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Goal, ProgressEntry } from "@/types";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Dispatch, SetStateAction } from "react";

interface AddGoalFormProps {
  goals: Goal[];
  onCancel: () => void;
  goalId: string;
  setGoals: Dispatch<SetStateAction<Goal[]>>;
}

interface ProgessFormValues {
  name: string;
  goalId: string;
  date: Date;
  currentValue: string;
  unit: string;
}

export default function AddProgressForm({
  goals,
  onCancel,
  goalId,
  setGoals,
}: AddGoalFormProps) {
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ProgessFormValues>({
    defaultValues: {
      name: "",
      date: new Date(),
      currentValue: "",
      unit: "",
    },
    mode: "onBlur",
  });

  const onAddProgress = (currentProgress: ProgressEntry) => {
    const goal = goals?.find((g) => g.id === goalId);
    if (!goal) return;
  
    let progressPercentage = Math.round(
      ((currentProgress.value - goal.currentValue) /
        (goal.targetValue - goal.currentValue)) * 100
    );
  
    progressPercentage = Math.min(
      100,
      Math.max(progressPercentage, 0)
    );
    currentProgress.percentage = progressPercentage;
    currentProgress.unit = goal.unit;
    const updatedGoal = {
      ...goal,
      currentValue: currentProgress.value,
      progressPercentage,
      progress: [...goal.progress, currentProgress],
    };
  
    setGoals((prevGoals) =>
      prevGoals.map((g) => (g.id === goalId ? updatedGoal : g))
    );
  };
  
  

  const onSubmit = (data: ProgessFormValues) => {
    const newProgress: ProgressEntry = {
      goalId: goalId,
      name: data.name,
      value: Number(data.currentValue),
      unit: data.unit,
      date: data.date,
      percentage: 0
    };

    onAddProgress(newProgress);
    reset();
    onCancel()
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row gap-4 ">
          <div className="w-full sm:w-1/2 flex flex-col gap-2">
              <Label htmlFor="name">Progress Name</Label>
              <Input
                id="name"
                {...register("name", {
                  required: "Progress name is required",
                })}
                placeholder="Enter your progress name"
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="w-full sm:w-1/2 flex flex-col gap-2 ">
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
                  validate: (value) =>
                    !isNaN(Number(value)) || "Current value must be a number",
                })}
                placeholder={`e.g., 70`}
                min="0"
                step="0.1"
              />
              {errors.currentValue && (
                <p className="text-sm text-destructive">
                  {errors.currentValue.message}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="date">Progress Date</Label>
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
                    <span>Pick a date</span>
                  )}
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
        {errors.date && (
          <p className="text-sm text-destructive">{errors.date.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          Save Progress
        </Button>
      </div>
    </form>
  );
}
