"use client"

import { useTheme } from "next-themes"
import {
  BarChart as RechartsBarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { useState, useEffect } from "react"

interface ChartData {
  name: string
  value: number
}

interface ChartProps {
  data: ChartData[]
}

export function BarChart({ data }: ChartProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-full w-full flex items-center justify-center">Loading chart...</div>
  }

  const isDark = theme === "dark"
  const textColor = isDark ? "#e1e1e1" : "#333333"
  const gridColor = isDark ? "#444444" : "#dddddd"
  const barColor = "hsl(0, 0%, 50%)"

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 20,
          bottom: 40,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis
          dataKey="name"
          stroke={textColor}
          tick={{ fill: textColor }}
          tickLine={{ stroke: textColor }}
          axisLine={{ stroke: textColor }}
          angle={-45}
          textAnchor="end"
          height={70}
        />
        <YAxis
          stroke={textColor}
          tick={{ fill: textColor }}
          tickLine={{ stroke: textColor }}
          axisLine={{ stroke: textColor }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "#1f2937" : "#ffffff",
            color: textColor,
            border: `1px solid ${gridColor}`,
            borderRadius: "6px",
          }}
          itemStyle={{ color: textColor }}
          labelStyle={{ color: textColor, fontWeight: "bold", marginBottom: "5px" }}
          formatter={(value: number) => [`${value} calories`, "Calories Burned"]}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Bar dataKey="value" fill={barColor} radius={[4, 4, 0, 0]} />
      </RechartsBarChart>
    </ResponsiveContainer>
  )
}

export function LineChart({ data }: ChartProps) {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className="h-full w-full flex items-center justify-center">Loading chart...</div>
  }

  const isDark = theme === "dark"
  const textColor = isDark ? "#e1e1e1" : "#333333"
  const gridColor = isDark ? "#444444" : "#dddddd"
  const lineColor = "hsl(0, 0%, 50%)"

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 20,
          bottom: 40,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis
          dataKey="name"
          stroke={textColor}
          tick={{ fill: textColor }}
          tickLine={{ stroke: textColor }}
          axisLine={{ stroke: textColor }}
          angle={-45}
          textAnchor="end"
          height={70}
        />
        <YAxis
          stroke={textColor}
          tick={{ fill: textColor }}
          tickLine={{ stroke: textColor }}
          axisLine={{ stroke: textColor }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: isDark ? "#1f2937" : "#ffffff",
            color: textColor,
            border: `1px solid ${gridColor}`,
            borderRadius: "6px",
          }}
          itemStyle={{ color: textColor }}
          labelStyle={{ color: textColor, fontWeight: "bold", marginBottom: "5px" }}
          formatter={(value: number) => [`${value} minutes`, "Duration"]}
          labelFormatter={(label) => `Date: ${label}`}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={lineColor}
          strokeWidth={2}
          dot={{ fill: lineColor, stroke: lineColor, strokeWidth: 2, r: 4 }}
          activeDot={{ fill: lineColor, stroke: lineColor, strokeWidth: 2, r: 6 }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  )
}

