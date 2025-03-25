"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Target, BarChart3 } from "lucide-react";
import WorkoutList from "@/components/workout-list";
import GoalsList from "@/components/goals-list";
import ProgressCharts from "@/components/progress-charts";
import type { Workout, Goal, ProgressEntry } from "@/types";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import AddWorkoutForm from "@/components/add-workout-form";
import { getWorkoutTemplateById } from "@/constants";
import AddGoalForm from "@/components/add-goal-form";

export default function DashboardPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddWorkout, setShowAddWorkout] = useState<boolean>(false);
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

    toast(
      `${templateName} added! Your workout has been successfully recorded.`
    );
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

  const addGoal = (goal: Goal) => {
    setGoals([...goals, goal]);
    setShowAddGoal(false);
    toast(`Your ${goal.category} goal has been set.`);
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
      <div className="flex flex-col gap-10 ">
        <div className="flex justify-between">
          <h1 className="text-3xl font-bold tracking-tight">
            FitTrack Dashboard
          </h1>
          <ThemeToggle />
        </div>
        <Tabs defaultValue="workouts" className="flex flex-col gap-10">
          <TabsList className="sm:py-8">
            <TabsTrigger value="workouts" className="flex items-center gap-2">
              <Activity className="hidden sm:block h-4 w-4" />
              <span className="sm:text-xl">Workouts</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-2">
              <Target className="hidden sm:block h-4 w-4" />
              <span className="sm:text-xl">Goals</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="flex items-center gap-2">
              <BarChart3 className="hidden sm:block  h-4 w-4" />
              <span className="sm:text-xl">Progress</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="workouts" className="space-y-4 w-full">
            <WorkoutList
              workouts={workouts}
              onDeleteWorkout={deleteWorkout}
              goalNames={goalNames}
              showAddWorkout={showAddWorkout}
              setShowAddWorkout={setShowAddWorkout}
            />
          </TabsContent>
          <TabsContent value="goals" className="space-y-4 w-full">
            <GoalsList
              goals={goals}
              onDeleteGoal={deleteGoal}
              setGoals={setGoals}
              showAddGoal={showAddGoal}
              setShowAddGoal={setShowAddGoal}
            />
          </TabsContent>
          <TabsContent value="progress" className="space-y-4 w-full">
            <ProgressCharts workouts={workouts} goals={goals} />
          </TabsContent>
        </Tabs>
      </div>
      {/* ADD WORKOUT  */}
      <Dialog open={showAddWorkout} onOpenChange={setShowAddWorkout}>
        <DialogContent className="max-h-[95vh] overflow-y-auto rounded-2xl p-6 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Add New Workout
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Record your workout details
            </DialogDescription>
          </DialogHeader>
          <AddWorkoutForm
            onAddWorkout={addWorkout}
            onCancel={() => setShowAddWorkout(false)}
            goals={goals}
          />
        </DialogContent>
      </Dialog>
      {/* ADD GOAL */}
      <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
        <DialogContent className="max-h-[95vh] overflow-y-auto rounded-2xl p-6 shadow-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              Set New Goal
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Define your fitness targets
            </DialogDescription>
          </DialogHeader>
          <AddGoalForm
            onAddGoal={addGoal}
            onCancel={() => setShowAddGoal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
