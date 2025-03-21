"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Activity, Target, BarChart3 } from "lucide-react";
import WorkoutList from "@/components/workout-list";
import AddWorkoutForm from "@/components/add-workout-form";
import GoalsList from "@/components/goals-list";
import AddGoalForm from "@/components/add-goal-form";
import ProgressCharts from "@/components/progress-charts";
import type { Workout, Goal, ProgressEntry } from "@/lib/types";
import { toast } from "react-toastify";
import { ThemeToggle } from "@/components/theme-toggle";
import { getWorkoutTemplateById } from "@/lib/workout-data";

export default function DashboardPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedWorkouts = localStorage.getItem("workouts");
    const savedGoals = localStorage.getItem("goals");

    if (savedWorkouts) {
      setWorkouts(JSON.parse(savedWorkouts));
    }

    if (savedGoals) {
      setGoals(JSON.parse(savedGoals));
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("workouts", JSON.stringify(workouts));
  }, [workouts]);

  useEffect(() => {
    localStorage.setItem("goals", JSON.stringify(goals));
  }, [goals]);

  // Create a map of goal IDs to goal names for easy lookup
  const goalNames = goals.reduce((acc, goal) => {
    acc[goal.id] = goal.name;
    return acc;
  }, {} as Record<string, string>);

  // Update goal progress based on a workout
  const updateGoalProgress = (workout: Workout, goalId: string) => {
    return goals.map((goal) => {
      // Skip if this goal is not related to this workout
      if (goal.id !== goalId) return goal;

      // Determine the value to add to the goal progress based on the metric
      let valueToAdd = 0;

      switch (goal.metricToTrack) {
        case "duration":
          valueToAdd = workout.duration;
          break;
        case "calories":
          valueToAdd = workout.calories;
          break;
        case "workouts":
          valueToAdd = 1; // Count as one workout
          break;
        case "custom":
          // For custom metrics, we don't automatically update
          return goal;
      }

      // Create a progress entry
      const progressEntry: ProgressEntry = {
        date: workout.date,
        value: valueToAdd,
        workoutId: workout.id,
        workoutName: workout.name,
      };

      // Add to progress array
      const updatedProgress = [...goal.progress, progressEntry];

      // Calculate new current value
      let newCurrentValue = goal.currentValue;

      if (goal.goalType === "increase") {
        // For increase goals, sum up all progress values
        newCurrentValue = updatedProgress.reduce(
          (sum, entry) => sum + entry.value,
          0
        );
      } else {
        // For decrease goals (like weight loss), we don't automatically update the current value
        // as workouts don't directly decrease weight
        return {
          ...goal,
          progress: updatedProgress,
        };
      }

      return {
        ...goal,
        currentValue: newCurrentValue,
        progress: updatedProgress,
      };
    });
  };

  const addWorkout = (workout: Workout) => {
    const newWorkout = { ...workout };
    setWorkouts((prev) => [...prev, newWorkout]);

    // If this workout is related to a goal, update its progress
    if (newWorkout.goalId) {
      setGoals((prev) => updateGoalProgress(newWorkout, newWorkout.goalId!));
    }

    setShowAddWorkout(false);

    // Get workout template name for the toast
    let templateName = "Workout";
    if (workout.templateId) {
      const template = getWorkoutTemplateById(workout.templateId);
      if (template) {
        templateName = template.name;
      }
    }

    toast.success(
      `${templateName} added! Your workout has been successfully recorded.`
    );
  };

  const addGoal = (goal: Goal) => {
    setGoals([...goals, goal]);
    setShowAddGoal(false);
    toast.success(`Your ${goal.category} goal has been set.`);
  };

  const deleteWorkout = (id: string) => {
    // Find the workout to be deleted
    const workoutToDelete = workouts.find((w) => w.id === id);

    if (workoutToDelete && workoutToDelete.goalId) {
      // Update goals by removing this workout's contribution
      setGoals((prevGoals) => {
        return prevGoals.map((goal) => {
          // Skip if this goal is not related to this workout
          if (goal.id !== workoutToDelete.goalId) return goal;

          // Remove this workout from the goal's progress
          const updatedProgress = goal.progress.filter(
            (entry) => entry.workoutId !== id
          );

          // Recalculate current value for "increase" goals
          let newCurrentValue = goal.currentValue;

          if (goal.goalType === "increase") {
            newCurrentValue = updatedProgress.reduce(
              (sum, entry) => sum + entry.value,
              0
            );
          }

          return {
            ...goal,
            currentValue: newCurrentValue,
            progress: updatedProgress,
          };
        });
      });
    }

    // Remove the workout
    setWorkouts(workouts.filter((workout) => workout.id !== id));
    toast.success("Your workout has been removed.");
  };

  const deleteGoal = (id: string) => {
    // Check if any workouts are associated with this goal
    const associatedWorkouts = workouts.filter(
      (workout) => workout.goalId === id
    );

    // Remove the goal association from those workouts
    if (associatedWorkouts.length > 0) {
      setWorkouts(
        workouts.map((workout) => {
          if (workout.goalId === id) {
            const { goalId, ...rest } = workout;
            return rest;
          }
          return workout;
        })
      );
    }

    // Delete the goal
    setGoals(goals.filter((goal) => goal.id !== id));

    toast("Your goal has been removed.");
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex md:flex-row flex-col justify-between gap-4 items-center">
        <h1 className="text-3xl font-bold tracking-tight">
          FitTrack Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <div className="flex  gap-2">
            <Button
              onClick={() => setShowAddWorkout(!showAddWorkout)}
              className="flex items-center gap-1"
            >
              <PlusCircle className="h-4 w-4" />
              Add Workout
            </Button>
            <Button
              onClick={() => setShowAddGoal(!showAddGoal)}
              variant="outline"
              className="flex items-center gap-1"
            >
              <PlusCircle className="h-4 w-4" />
             Add Goal
            </Button>
          </div>
          <ThemeToggle />
        </div>
      </div>

      {showAddWorkout && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Workout</CardTitle>
            <CardDescription>Record your workout details</CardDescription>
          </CardHeader>
          <CardContent>
            <AddWorkoutForm
              onAddWorkout={addWorkout}
              onCancel={() => setShowAddWorkout(false)}
              goals={goals}
            />
          </CardContent>
        </Card>
      )}

      {showAddGoal && (
        <Card>
          <CardHeader>
            <CardTitle>Set New Goal</CardTitle>
            <CardDescription>Define your fitness targets</CardDescription>
          </CardHeader>
          <CardContent>
            <AddGoalForm
              onAddGoal={addGoal}
              onCancel={() => setShowAddGoal(false)}
            />
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="workouts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workouts" className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            Workouts
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            Goals
          </TabsTrigger>
          <TabsTrigger value="progress" className="flex items-center gap-1">
            <BarChart3 className="h-4 w-4" />
            Progress
          </TabsTrigger>
        </TabsList>
        <TabsContent value="workouts" className="space-y-4">
          <WorkoutList
            workouts={workouts}
            onDeleteWorkout={deleteWorkout}
            goalNames={goalNames}
          />
        </TabsContent>
        <TabsContent value="goals" className="space-y-4">
          <GoalsList goals={goals} onDeleteGoal={deleteGoal} />
        </TabsContent>
        <TabsContent value="progress" className="space-y-4">
          <ProgressCharts workouts={workouts} goals={goals} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
