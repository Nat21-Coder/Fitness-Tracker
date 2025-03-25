import type { Metadata } from "next"
import DashboardPage from "@/components/dashboard"

export const metadata: Metadata = {
  title: "FitTrack - Your Workout Companion",
  description: "Track your workouts, set goals, and monitor your fitness progress",
}

export default function Home() {
  return <DashboardPage />
}

