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
import { getWorkoutTemplateById } from "@/lib/utils";
import AddGoalForm from "@/components/add-goal-form";
import AddProgressForm from "./add-progress-form";

export default function Dashboard() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddWorkout, setShowAddWorkout] = useState<boolean>(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [showAddProgress, setShowAddProgress] = useState<boolean>(false);
  const [goalIdToAddProgress,setGoalIdToAddProgress] = useState<string>('');
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

  const addWorkout = (workout: Workout) => {
    const newWorkout = { ...workout };
    setWorkouts((prev) => [...prev, newWorkout]);

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

  
  const addGoal = (goal: Goal) => {
    setGoals([...goals, goal]);
    setShowAddGoal(false);
    toast(`Your ${goal.category} goal has been set.`);
  };
 
  const deleteWorkout = (id: string) => {
    // Find the deleted workout
    const deletedWorkout = workouts.find((workout) => workout.id === id);
    if (!deletedWorkout) return;
  
    // Remove the workout
    setWorkouts((prev) => prev.filter((workout) => workout.id !== id));
  
    // Show toast with undo option
    toast.success("Workout removed.", {
      action: {
        label: "Undo",
        onClick: () => setWorkouts((prev) => [...prev, deletedWorkout]),
      },
    });
  };
  
  const deleteGoal = (id: string) => {
    // Find the deleted goal
    const deletedGoal = goals.find((goal) => goal.id === id);
    if (!deletedGoal) return;
  
    // Check if any workouts are associated with this goal
    const associatedWorkouts = workouts.filter((workout) => workout.goalId === id);
  
    // Remove the goal association from those workouts
    let updatedWorkouts = workouts;
    if (associatedWorkouts.length > 0) {
      updatedWorkouts = workouts.map((workout) =>
        workout.goalId === id ? { ...workout, goalId: undefined } : workout
      );
      setWorkouts(updatedWorkouts);
    }
  
    // Remove the goal
    setGoals((prev) => prev.filter((goal) => goal.id !== id));
  
    // Show toast with undo option
    toast.success("Goal removed.", {
      action: {
        label: "Undo",
        onClick: () => {
          setGoals((prev) => [...prev, deletedGoal]);
          setWorkouts(updatedWorkouts); // Restore workouts association
        },
      },
    });
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
              setShowAddProgress={setShowAddProgress}
              setGoalIdToAddProgress={setGoalIdToAddProgress}
            />
          </TabsContent>
          <TabsContent value="progress" className="space-y-4 w-full">
            <ProgressCharts workouts={workouts} goals={goals} />
          </TabsContent>
        </Tabs>
      </div>
      {/* ADD WORKOUT  */}
      <Dialog open={showAddWorkout} onOpenChange={setShowAddWorkout}>
        <DialogContent className="max-h-[80vh] overflow-y-auto rounded-2xl p-6 shadow-lg">
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
        <DialogContent className="max-h-[80vh] overflow-y-auto rounded-2xl p-6 shadow-lg">
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

      <Dialog open={showAddProgress} onOpenChange={setShowAddProgress}>
        <DialogContent className=" rounded-2xl p-6 shadow-lg">
          <DialogHeader className="flex justify-between items-center">
          <DialogTitle className="text-2xl font-bold">
           
            Add progress To The Goal
            </DialogTitle>
          </DialogHeader>

          <AddProgressForm
            goals={goals}
            setGoals={setGoals}
            onCancel={() => setShowAddProgress(false)}
            goalId={goalIdToAddProgress}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
