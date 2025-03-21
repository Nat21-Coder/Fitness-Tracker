"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Goal, ProgressEntry } from "@/lib/types"
import { formatDate } from "@/lib/utils"
import { Target, Calendar, Trash2, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import { format } from "date-fns"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface GoalsListProps {
  goals: Goal[]
  onDeleteGoal: (id: string) => void
}

export default function GoalsList({ goals, onDeleteGoal }: GoalsListProps) {
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null)

  const handleDeleteConfirm = () => {
    if (goalToDelete) {
      onDeleteGoal(goalToDelete)
      setGoalToDelete(null)
    }
  }

  if (goals.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Fitness Goals</CardTitle>
          <CardDescription>You haven't set any fitness goals yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Click "Add Goal" to set targets for your fitness journey.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Sort goals by target date
  const sortedGoals = [...goals].sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())

  // Calculate days remaining for each goal
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const calculateProgress = (goal: Goal) => {
    // For goals where lower is better (like weight loss)
    if (goal.goalType === "decrease") {
      // If we've reached or exceeded the target
      if (goal.currentValue <= goal.targetValue) {
        return 100
      }
      // Calculate progress as a percentage of the distance from start to target
      // We need to estimate a starting point, let's assume starting value was 20% higher than target
      const estimatedStartValue = goal.targetValue * 1.2
      return Math.min(
        100,
        Math.max(
          0,
          Math.round(((estimatedStartValue - goal.currentValue) / (estimatedStartValue - goal.targetValue)) * 100),
        ),
      )
    }

    // For goals where higher is better (like distance, reps, etc.)
    return Math.min(100, Math.max(0, Math.round((goal.currentValue / goal.targetValue) * 100)))
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Your Fitness Goals</CardTitle>
          <CardDescription>
            You have set {goals.length} goal{goals.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {sortedGoals.map((goal) => {
                const targetDate = new Date(goal.targetDate)
                const daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
                const progress = calculateProgress(goal)

                return (
                  <Card key={goal.id} className="border border-muted">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">{goal.name}</CardTitle>
                            <Badge variant="outline" className="capitalize">
                              {goal.category}
                            </Badge>
                          </div>
                          <CardDescription className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {goal.targetValue} {goal.unit}
                          </CardDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setGoalToDelete(goal.id)}
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                          <span>
                            Current: {goal.currentValue} {goal.unit}
                          </span>
                          <span className="text-primary font-medium">{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Target: {formatDate(goal.targetDate)}</span>
                          </div>
                          <span>
                            {daysRemaining > 0
                              ? `${daysRemaining} day${daysRemaining !== 1 ? "s" : ""} remaining`
                              : daysRemaining === 0
                                ? "Due today"
                                : `${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) !== 1 ? "s" : ""} overdue`}
                          </span>
                        </div>

                        {goal.progress && goal.progress.length > 0 && (
                          <Collapsible className="mt-2">
                            <CollapsibleTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center gap-1 w-full justify-between p-2 h-auto"
                              >
                                <span className="text-xs">View workout contributions</span>
                                <TrendingUp className="h-3 w-3" />
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="space-y-2 mt-2 text-xs">
                                {goal.progress.map((entry: ProgressEntry, index: number) => (
                                  <div
                                    key={index}
                                    className="flex justify-between items-center py-1 border-b border-dashed border-muted"
                                  >
                                    <div>
                                      <span className="font-medium">{entry.workoutName}</span>
                                      <div className="text-muted-foreground">
                                        {format(new Date(entry.date), "MMM d, yyyy")}
                                      </div>
                                    </div>
                                    <span>
                                      +{entry.value} {goal.unit}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <AlertDialog open={!!goalToDelete} onOpenChange={(open) => !open && setGoalToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Goal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this goal? This action cannot be undone.
              {goals?.find((g) => g?.id === goalToDelete)?.progress?.length > 0 && (
                <p className="mt-2 font-medium">
                  This goal has workout contributions that will be removed from the progress tracking.
                </p>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

