import { useState, useMemo } from "react"
import type { WorkoutSession } from "../../../../../../shared/api/workoutJournalApi"

type ChartType = "weekly" | "monthly" | "yearly"
type TimeRange = "7days" | "30days" | "90days" | "1year"

export function useProgressData(sessions: WorkoutSession[]) {
  const [selectedChartType, setSelectedChartType] =
    useState<ChartType>("weekly")
  const [selectedTimeRange, setSelectedTimeRange] =
    useState<TimeRange>("30days")

  // 차트 데이터 계산
  const chartData = useMemo(() => {
    if (!sessions || sessions.length === 0) return []

    const now = new Date()
    const filteredSessions = sessions.filter(session => {
      const sessionDate = new Date(session.createdAt)
      const diffTime = now.getTime() - sessionDate.getTime()
      const diffDays = diffTime / (1000 * 60 * 60 * 24)

      switch (selectedTimeRange) {
        case "7days":
          return diffDays <= 7
        case "30days":
          return diffDays <= 30
        case "90days":
          return diffDays <= 90
        case "1year":
          return diffDays <= 365
        default:
          return true
      }
    })

    // 날짜별로 그룹화
    const groupedData = filteredSessions.reduce(
      (acc, session) => {
        const date = new Date(session.createdAt).toLocaleDateString()
        if (!acc[date]) {
          acc[date] = {
            date,
            duration: 0,
            sessions: 0,
            exercises: 0,
          }
        }
        acc[date].duration += session.duration || 0
        acc[date].sessions += 1
        acc[date].exercises += session.exerciseSets?.length || 0
        return acc
      },
      {} as Record<string, any>
    )

    return Object.values(groupedData).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }, [sessions, selectedTimeRange])

  // 통계 계산
  const stats = useMemo(() => {
    if (!sessions || sessions.length === 0) {
      return {
        totalSessions: 0,
        totalDuration: 0,
        totalExercises: 0,
        averageDuration: 0,
        completionRate: 0,
      }
    }

    const completedSessions = sessions.filter(s => s.status === "completed")
    const totalDuration = sessions.reduce(
      (sum, s) => sum + (s.duration || 0),
      0
    )
    const totalExercises = sessions.reduce(
      (sum, s) => sum + (s.exerciseSets?.length || 0),
      0
    )

    return {
      totalSessions: sessions.length,
      totalDuration,
      totalExercises,
      averageDuration:
        sessions.length > 0 ? Math.round(totalDuration / sessions.length) : 0,
      completionRate:
        sessions.length > 0
          ? Math.round((completedSessions.length / sessions.length) * 100)
          : 0,
    }
  }, [sessions])

  return {
    selectedChartType,
    selectedTimeRange,
    chartData,
    stats,
    setSelectedChartType,
    setSelectedTimeRange,
  }
}
