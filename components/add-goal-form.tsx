"use client";

import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Goal } from "@/types";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, addDays } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { goalCategories } from "@/constants/";

interface AddGoalFormProps {
  onAddGoal: (goal: Goal) => void;
  onCancel: () => void;
}

interface GoalFormValues {
  name: string;
  category: string;
  targetDate: Date;
  targetValue: string;
  currentValue: string;
  unit: string;
  metricToTrack: string;
  goalType: "increase" | "decrease";
}

export default function AddGoalForm({ onAddGoal, onCancel }: AddGoalFormProps) {
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
      targetDate: addDays(new Date(), 30),
      targetValue: "",
      currentValue: "",
      unit: "kg",
      goalType: "increase",
      metricToTrack: "",
    },
    mode: "onBlur",
  });
  const selectedCategory = watch("category");

  // Form submission handler
  const onSubmit = (data: GoalFormValues) => {
    const goalId = crypto.randomUUID();
    const newGoal: Goal = {
      id: goalId,
      name: data.name,
      category: data.category,
      targetDate: data.targetDate.toISOString(),
      targetValue: Number(data.targetValue),
      currentValue: Number(data.currentValue),
      unit: data.unit,
      goalType: data.goalType,
      metricToTrack: data.metricToTrack,
      progress: [],
      progressPercentage: 0,
    };

    onAddGoal(newGoal);
    reset();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-10 ">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="w-full sm:w-1/2 flex flex-col gap-2">
              <Label htmlFor="name">Goal Name</Label>
              <Input
                id="name"
                {...register("name", {
                  required: "Goal name is required",
                })}
                placeholder="e.g., Lose Weight, Run 10K"
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
            <div className="w-full sm:w-1/2 flex flex-col gap-2">
              <Label htmlFor="category">Goal Category</Label>
              <Controller
                name="category"
                control={control}
                rules={{ required: "Goal category is required" }}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value), field.onBlur();
                    }}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select goal category" />
                    </SelectTrigger>
                    <SelectContent>
                      {goalCategories.map((cat) => (
                        <SelectItem key={cat.name} value={cat.name}>
                          {cat?.name.charAt(0).toUpperCase() +
                            cat.name.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && (
                <p className="text-sm text-destructive">
                  {errors.category.message}
                </p>
              )}
            </div>
          </div>
          {selectedCategory && (
            <div className="flex flex-col gap-2">
              <Label htmlFor="unit">Unit</Label>
              <Controller
                name="unit"
                control={control}
                rules={{ required: "Unit is required" }}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      field.onBlur();
                    }}
                  >
                    <SelectTrigger id="unit">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {goalCategories
                        .find(
                          (goalCategory) =>
                            goalCategory.name === selectedCategory
                        )
                        ?.metricUnits.map((metricUnit, index) => (
                          <SelectItem
                            key={`${metricUnit.title}-${index}`}
                            value={metricUnit.unit}
                          >
                            {metricUnit.title} ({metricUnit.unit})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.unit && (
                <p className="text-sm text-destructive">
                  {errors.unit.message}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 ">
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

            <div className="w-full sm:w-1/2  flex flex-col gap-2">
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
                  validate: (value) =>
                    !isNaN(Number(value)) || "Target value must be a number",
                })}
                placeholder={`e.g., 65`}
                min="0.1"
                step="0.1"
              />
              {errors.targetValue && (
                <p className="text-sm text-destructive">
                  {errors.targetValue.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goalType">Goal Direction</Label>
            <Controller
              name="goalType"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value as "increase" | "decrease");
                    field.onBlur();
                  }}
                >
                  <SelectTrigger id="goalType">
                    <SelectValue placeholder="Select goal type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="increase">
                      Increase (higher is better)
                    </SelectItem>
                    <SelectItem value="decrease">
                      Decrease (lower is better)
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            <p className="text-xs text-muted-foreground">
              For weight loss, select "Decrease". For fitness goals like
              distance or reps, select "Increase".
            </p>
          </div>
        </div>
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
        {errors.targetDate && (
          <p className="text-sm text-destructive">
            {errors.targetDate.message}
          </p>
        )}
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
  );
}
