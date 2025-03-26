"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Workout, Goal } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, LineChart } from "@/components/charts";
import { format } from "date-fns";

interface ProgressChartsProps {
  workouts: Workout[];
  goals: Goal[];
}

export default function ProgressCharts({
  workouts,
  goals,
}: ProgressChartsProps) {
  const [timeRange, setTimeRange] = useState("week");
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  if (workouts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Progress</CardTitle>
          <CardDescription>
            No workout data available to display progress.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground py-8">
            Add some workouts to see your progress charts.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Process workout data for charts
  const now = new Date();
  const filteredWorkouts = workouts.filter((workout) => {
    const workoutDate = new Date(workout.date);
    if (timeRange === "week") {
      // Last 7 days
      return now.getTime() - workoutDate.getTime() <= 7 * 24 * 60 * 60 * 1000;
    } else if (timeRange === "month") {
      // Last 30 days
      return now.getTime() - workoutDate.getTime() <= 30 * 24 * 60 * 60 * 1000;
    } else {
      // All time
      return true;
    }
  });

  // Sort workouts by date
  const sortedWorkouts = [...filteredWorkouts].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Group the workouts by date
  const groupByDate = (workouts: Workout[]) => {
    return workouts.reduce((acc, workout) => {
      const workoutDate = new Date(workout.date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });

      if (!acc[workoutDate]) {
        acc[workoutDate] = { calories: 0, duration: 0 };
      }

      acc[workoutDate].calories += workout.calories;
      acc[workoutDate].duration += workout.duration;

      return acc;
    }, {} as Record<string, { calories: number; duration: number }>);
  };

  // Process workout data and group by date
  const groupedWorkouts = groupByDate(sortedWorkouts);

  // Prepare data for charts
  const caloriesData = Object.keys(groupedWorkouts).map((date) => ({
    name: date,
    value: groupedWorkouts[date].calories,
    unit: "KCal",
  }));

  const durationData = Object.keys(groupedWorkouts).map((date) => ({
    name: date,
    value: groupedWorkouts[date].duration,
    unit: "minutes",
  }));

  // Calculate workout stats
  const totalWorkouts = sortedWorkouts.length;
  const totalCalories = sortedWorkouts.reduce(
    (sum, workout) => sum + workout.calories,
    0
  );
  const totalDuration = sortedWorkouts.reduce(
    (sum, workout) => sum + workout.duration,
    0
  );
  const avgCaloriesPerWorkout =
    totalWorkouts > 0 ? Math.round(totalCalories / totalWorkouts) : 0;
  const avgDurationPerWorkout =
    totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0;

  // Generate goal progress data for selected goal
  const goalProgressData = () => {
    if (!selectedGoal) return [];

    const goal = goals.find((g) => g.id === selectedGoal);
    if (!goal || !goal.progress || goal.progress.length === 0) return [];

    // Group progress entries by date
    const groupedProgress = goal.progress.reduce((acc, entry) => {
      const dateKey = format(new Date(entry.date), "MMM d");

      if (!acc[dateKey]) {
        acc[dateKey] = { ...entry };
      } else {
        acc[dateKey].value = entry.value;
      }

      return acc;
    }, {});

    // Convert object back to sorted array
    const sortedEntries = Object.keys(groupedProgress)
      .map((date) => ({
        name: date,
        value: groupedProgress[date].value,
        unit: groupedProgress[date].unit,
      }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());

    // Create cumulative data for chart
    let cumulativeValue = 0;
    return sortedEntries.map((entry) => {
      cumulativeValue += entry.value;
      return {
        name: entry.name,
        value: cumulativeValue,
        unit: entry.unit,
      };
    });
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Progress Overview</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last 7 days</SelectItem>
            <SelectItem value="month">Last 30 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Workouts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWorkouts}</div>
            <p className="text-xs text-muted-foreground">
              {timeRange === "week"
                ? "in the last 7 days"
                : timeRange === "month"
                ? "in the last 30 days"
                : "all time"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Calories Burned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCalories}</div>
            <p className="text-xs text-muted-foreground">
              Avg. {avgCaloriesPerWorkout} per workout
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Duration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDuration} min</div>
            <p className="text-xs text-muted-foreground">
              Avg. {avgDurationPerWorkout} min per workout
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4">
      <Tabs defaultValue="calories " className="flex flex-col gap-10">
        <TabsList className="flex flex-col gap-2 sm:flex-row sm:bg-muted">
          <TabsTrigger className="data-[state=active]:bg-gray-400 bg-gray-100"  value="calories">Calories Burned</TabsTrigger>
          <TabsTrigger className=" data-[state=active]:bg-gray-400 bg-gray-100" value="duration">Workout Duration</TabsTrigger>
          {goals.length > 0 && (
            <TabsTrigger className="data-[state=active]:bg-gray-400 bg-gray-100" value="goals">Goal Progress</TabsTrigger>
          )}
        </TabsList>
          <div>
        <TabsContent value="calories">
          <Card>
            <CardHeader>
              <CardTitle>Calories Burned Over Time</CardTitle>
              <CardDescription>
                Track your calorie burning progress
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {caloriesData.length > 0 ? (
                <BarChart data={caloriesData} />
              ) : (
                <p className="flex h-full items-center justify-center text-muted-foreground">
                  No data available for the selected time range
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="duration">
          <Card>
            <CardHeader>
              <CardTitle>Workout Duration Over Time</CardTitle>
              <CardDescription>
                Track your workout duration progress
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {durationData.length > 0 ? (
                <LineChart data={durationData} />
              ) : (
                <p className="flex h-full items-center justify-center text-muted-foreground">
                  No data available for the selected time range
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="goals">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <CardTitle>Goal Progress Over Time</CardTitle>
                  <CardDescription>
                    Track your progress towards specific goals
                  </CardDescription>
                </div>
                <Select
                  value={selectedGoal || ""}
                  onValueChange={setSelectedGoal}
                >
                  <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Select a goal to view" />
                  </SelectTrigger>
                  <SelectContent>
                    {goals.map((goal) => (
                      <SelectItem key={goal.id} value={goal.id}>
                        {goal.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent className="h-[300px]">
              {selectedGoal ? (
                goalProgressData().length > 0 ? (
                  <LineChart data={goalProgressData()} />
                ) : (
                  <p className="flex h-full items-center justify-center text-muted-foreground">
                    No progress data available for this goal
                  </p>
                )
              ) : (
                <p className="flex h-full items-center justify-center text-muted-foreground">
                  Select a goal to view its progress
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
          </div>
      </Tabs>
      </div>
    </div>
  );
}
