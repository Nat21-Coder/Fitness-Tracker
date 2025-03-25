"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Workout } from "@/types";
import { formatDate } from "@/lib/utils";
import {
  Dumbbell,
  Clock,
  Flame,
  Trash2,
  Target,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { getWorkoutTemplateById } from "@/constants/";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Dispatch, SetStateAction, useState } from "react";

interface WorkoutListProps {
  workouts: Workout[];
  onDeleteWorkout: (id: string) => void;
  goalNames: Record<string, string>;
  showAddWorkout: boolean;
  setShowAddWorkout: Dispatch<SetStateAction<boolean>>;
}

export default function WorkoutList({
  workouts,
  onDeleteWorkout,
  goalNames,
  showAddWorkout,
  setShowAddWorkout,
}: WorkoutListProps) {
  const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null);
  const handleDeleteConfirm = () => {
    if (workoutToDelete) {
      onDeleteWorkout(workoutToDelete);
      setWorkoutToDelete(null);
    }
  };

 

  if (workouts.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-col gap-4">
          <CardTitle className="flex gap-2 sm:justify-between">
            <span className="text-md sm:text-xl">Your Workouts</span>
            <Button
              onClick={() => setShowAddWorkout((prev) => !prev)}
              className="flex items-center gap-1"
            >
              <PlusCircle className="hidden sm:block h-4 w-4" />
              <span >
                Add Workout
                </span>
            </Button>
          </CardTitle>
          <CardDescription>
            You haven't recorded any workouts yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Click "Add Workout" to start tracking your fitness journey.
          </p>
        </CardContent>
      </Card>
    );
  }

  const sortedWorkouts = [...workouts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="w-full">
      <Card className="w-full">
        <CardHeader className="flex flex-col gap-4">
          <CardTitle className="flex gap-2 sm:justify-between">
            <span className="text-md sm:text-xl">Your Workouts</span>
            <Button
              onClick={() => setShowAddWorkout(!showAddWorkout)}
              className="flex items-center gap-1"
            >
              <PlusCircle className="hidden sm:block h-4 w-4" />
              Add Workout
            </Button>
          </CardTitle>

          <CardDescription>
            You have recorded {workouts.length} workout
            {workouts.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="w-full">
          <ScrollArea className="h-[500px] pr-4 w-full">
            <div className="space-y-4 w-full">
              {sortedWorkouts.map((workout) => (
                <Card key={workout.id} className="border border-muted w-full">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {workout.name}
                        </CardTitle>
                        <CardDescription className="flex flex-col gap-1">
                          <span>{formatDate(workout.date)}</span>
                          {workout.templateId && (
                            <Badge variant="outline" className="w-fit">
                              {
                                getWorkoutTemplateById(workout.templateId)
                                  ?.category
                              }
                            </Badge>
                          )}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setWorkoutToDelete(workout.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="w-full">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2 w-full">
                      <div className="flex items-center gap-1 text-sm">
                        <Dumbbell className="h-4 w-4 text-primary" />
                        <span>{workout.exercises.length} exercises</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>{workout.duration} min</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Flame className="h-4 w-4 text-primary" />
                        <span>{workout.calories} cal</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-2 w-full">
                      {workout.exercises.map((exercise, index) => (
                        <Badge key={index} variant="secondary">
                          {exercise}
                        </Badge>
                      ))}
                    </div>

                    {workout.goalId && goalNames[workout.goalId] && (
                      <div className="mt-3 pt-3 border-t border-muted w-full">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Target className="h-3 w-3" />
                          <span>Contributing to goal:</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {goalNames[workout.goalId]}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <AlertDialog
        open={!!workoutToDelete}
        onOpenChange={(open) => !open && setWorkoutToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this workout? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
