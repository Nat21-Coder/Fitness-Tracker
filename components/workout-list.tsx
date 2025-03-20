"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Workout } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { Dumbbell, Clock, Flame, Trash2, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { getWorkoutTemplateById } from "@/lib/workout-data"

interface WorkoutListProps {
  workouts: Workout[]
  onDeleteWorkout: (id: string) => void
  goalNames: Record<string, string>
}

export default function WorkoutList({ workouts, onDeleteWorkout, goalNames }: WorkoutListProps) {
  if (workouts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Workouts</CardTitle>
          <CardDescription>You haven't recorded any workouts yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Click "Add Workout" to start tracking your fitness journey.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Sort workouts by date (newest first)
  const sortedWorkouts = [...workouts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Workouts</CardTitle>
        <CardDescription>
          You have recorded {workouts.length} workout{workouts.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-4">
            {sortedWorkouts.map((workout) => {
              // Get workout template if available
              const template = workout.templateId ? getWorkoutTemplateById(workout.templateId) : null

              return (
                <Card key={workout.id} className="border border-muted">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{workout.name}</CardTitle>
                        <CardDescription className="flex flex-col gap-1">
                          <span>{formatDate(workout.date)}</span>
                          {template && (
                            <Badge variant="outline" className="w-fit">
                              {template.category}
                            </Badge>
                          )}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDeleteWorkout(workout.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2 mb-2">
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
                    <div className="flex flex-wrap gap-1 mt-2">
                      {workout.exercises.map((exercise, index) => (
                        <Badge key={index} variant="secondary">
                          {exercise}
                        </Badge>
                      ))}
                    </div>

                    {workout.goalId && goalNames[workout.goalId] && (
                      <div className="mt-3 pt-3 border-t border-muted">
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
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

