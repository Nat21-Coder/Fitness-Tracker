"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Goal, ProgressEntry } from "@/types";
import { formatDate } from "@/lib/utils";
import {
  Target,
  Calendar,
  Trash2,
  TrendingUp,
  PlusCircle,
  Plus,
  Edit,
  View,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Dispatch, SetStateAction, useState } from "react";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";

interface GoalsListProps {
  goals: Goal[];
  onDeleteGoal: (id: string) => void;
  setGoals: Dispatch<SetStateAction<Goal[]>>;
  showAddGoal: boolean;
  setShowAddGoal: Dispatch<SetStateAction<boolean>>;
  setShowAddProgress: Dispatch<SetStateAction<boolean>>;
  setGoalIdToAddProgress: Dispatch<SetStateAction<string>>;
}

export default function GoalsList({
  goals,
  onDeleteGoal,
  showAddGoal,
  setShowAddGoal,
  setShowAddProgress,
  setGoalIdToAddProgress,
}: GoalsListProps) {
  const [goalToDelete, setGoalToDelete] = useState<string | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  const handleDeleteConfirm = () => {
    if (goalToDelete) {
      onDeleteGoal(goalToDelete);
      setGoalToDelete(null);
    }
  };

  if (goals.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-col gap-4">
          <CardTitle className="flex flex-wrap gap-2 sm:justify-between">
            <span className="text-md sm:text-xl">Your Fitness Goals</span>
            <Button
              onClick={() => setShowAddGoal(!showAddGoal)}
              className="flex items-center gap-1"
            >
              <PlusCircle className="hidden sm:block h-4 w-4" />
              Add Goal
            </Button>
          </CardTitle>

          <CardDescription>
            You haven't set any fitness goals yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Click "Add Goal" to set targets for your fitness journey.
          </p>
        </CardContent>
      </Card>
    );
  }

  const sortedGoals = [...goals].sort(
    (a, b) =>
      new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime()
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-col gap-4">
          <CardTitle className="flex flex-wrap gap-2 sm:justify-between">
            <span className="text-md sm:text-xl">Your Fitness Goals</span>
            <Button
              onClick={() => setShowAddGoal(!showAddGoal)}
              className="flex items-center gap-1"
            >
              <PlusCircle className="hidden sm:block h-4 w-4" />
              Add Goal
            </Button>
          </CardTitle>
          <CardDescription>
            You have set {goals.length} goal{goals.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[80vh] pr-4">
            <div className="space-y-4">
              {sortedGoals.map((goal) => {
                const targetDate = new Date(goal.targetDate);
                const daysRemaining = Math.ceil(
                  (targetDate.getTime() - today.getTime()) /
                    (1000 * 60 * 60 * 24)
                );

                return (
                  // display the detail of the goal when this card is click
                  <Card key={goal.id} className="border border-muted">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-1">
                          <div className="flex gap-1 flex-col sm:items-center sm:flex-row">
                            <CardTitle className="text-lg">
                              {goal.name}
                            </CardTitle>
                            <Badge variant="outline" className="capitalize">
                              {goal.category}
                            </Badge>
                          </div>
                          <CardDescription className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {goal.targetValue} {goal.unit}
                          </CardDescription>
                        </div>
                        <div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            onClick={() => setSelectedGoal(goal)}
                          >
                            <View className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            onClick={() => {
                              setGoalIdToAddProgress(goal.id);
                              setShowAddProgress(true);
                            }}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setGoalToDelete(goal.id)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                          <span>
                            Current: {goal.currentValue} {goal.unit}
                          </span>
                          <span className="text-primary font-medium">
                            {goal.progressPercentage}%
                          </span>
                        </div>
                        <Progress
                          value={goal.progressPercentage}
                          className="h-2"
                        />
                        <div className="flex justify-between items-center text-sm text-muted-foreground">
                          <div className="flex flex-wrap items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>Target: {formatDate(goal.targetDate)}</span>
                          </div>
                          <span>
                            {daysRemaining > 0
                              ? `${daysRemaining} day${
                                  daysRemaining !== 1 ? "s" : ""
                                } remaining`
                              : daysRemaining === 0
                              ? "Due today"
                              : `${Math.abs(daysRemaining)} day${
                                  Math.abs(daysRemaining) !== 1 ? "s" : ""
                                } overdue`}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

    {/* Goal Detail Dialog */}
    <Dialog
        open={!!selectedGoal}
        onOpenChange={(open) => !open && setSelectedGoal(null)}
      >
        <DialogContent className="max-h-[80vh] p-6 rounded-2xl shadow-2xl  w-full max-w-2xl border border-muted-foreground overflow-y-auto">
          <DialogHeader className="text-center">
            <DialogTitle className="text-2xl font-bold text-primary">
              {selectedGoal?.name}
            </DialogTitle>
            <p className="text-lg font-semibold text-muted-foreground capitalize">
              {selectedGoal?.category}
            </p>
          </DialogHeader>
          <div className="space-y-6 mt-4">
            {selectedGoal?.progress.map((p, index) => (
              <div
                key={`${p.name}-${index}`}
                className=" p-4 rounded-lg shadow-sm flex flex-col gap-2"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between items-center">
                  <span className="text-lg font-medium">{p.name}</span>
                  <span className="text-sm text-muted-foreground">
                    <Calendar className="inline-block h-4 w-4 mr-1" />
                    Tracked on {formatDate(p.date)}
                  </span>
                </div>
                <div className="flex justify-between items-center mt-2 text-sm font-medium">
                  <span className="text-gray-600">
                    🎯 Target: {selectedGoal?.targetValue} {selectedGoal?.unit}
                  </span>
                  <span className="text-gray-600">
                    📍 Current: {p.value} {selectedGoal?.unit}
                  </span>
                  <span className="text-gray-600 font-semibold">
                    {p.percentage}%
                  </span>
                </div>
                <Progress value={p?.percentage || 0} className="h-2" />
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-6">
            <Button variant="outline" onClick={() => setSelectedGoal(null)} className="px-6 py-2 rounded-lg font-semibold">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={!!goalToDelete} onOpenChange={(open) => !open && setGoalToDelete(null)}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Delete Goal</AlertDialogTitle>
      <AlertDialogDescription>
        Are you sure you want to delete this goal? 
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

    </div>
  );
}
