// ============================================================================
// WorkoutChart - 진행량 그래프
// ============================================================================

import React from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import type { CompletedWorkout } from "../slices/workoutSlice"
import styles from "./WorkoutChart.module.css"

interface Props {
  workouts: CompletedWorkout[]
}

export function WorkoutChart({ workouts }: Props) {
  // 날짜별로 그룹화
  const chartData = React.useMemo(() => {
    const grouped = workouts.reduce((acc, workout) => {
      const date = new Date(workout.completedAt).toLocaleDateString("ko-KR", {
        month: "short",
        day: "numeric",
      })

      if (!acc[date]) {
        acc[date] = {
          date,
          세트: 0,
          EXP: 0,
        }
      }

      acc[date].세트 += workout.totalSets
      acc[date].EXP += workout.expEarned

      return acc
    }, {} as Record<string, { date: string; 세트: number; EXP: number }>)

    return Object.values(grouped).slice(-7) // 최근 7일
  }, [workouts])

  if (chartData.length === 0) {
    return null
  }

  return (
    <div className={styles.workoutChart}>
      <h3>최근 운동 통계</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="세트" fill="#8884d8" />
          <Bar dataKey="EXP" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

