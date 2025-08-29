import { useState, useMemo } from "react"
import type { WorkoutSession } from "../../../../types"

type ChartType = "weekly" | "monthly" | "yearly"
type TimeRange = "7days" | "30days" | "90days" | "1year"

interface ChartDataPoint {
  day: string
  value: number
  date: string
  duration: number
  sessions: number
  exercises: number
}

interface ProgressStats {
  totalSessions: number
  totalDuration: number
  totalExercises: number
  averageDuration: number
  completionRate: number
  totalCalories?: number
  averageCalories?: number
}

export function useProgressData(sessions: WorkoutSession[]) {
  const [selectedChartType, setSelectedChartType] =
    useState<ChartType>("weekly")
  const [selectedTimeRange, setSelectedTimeRange] =
    useState<TimeRange>("30days")

  // 차트 데이터 계산
  const chartData = useMemo((): ChartDataPoint[] => {
    if (!sessions || sessions.length === 0) {
      // 테스트 데이터 생성 (실제 데이터가 없을 때)
      const testData: ChartDataPoint[] = []
      const now = new Date()

      for (let i = 6; i >= 0; i--) {
        const date = new Date(now)
        date.setDate(date.getDate() - i)
        const dayKey = date.toLocaleDateString("ko-KR", {
          month: "short",
          day: "numeric",
        })

        testData.push({
          day: dayKey,
          value: Math.floor(Math.random() * 5) + 1, // 1-5 사이의 랜덤 값
          date: date.toLocaleDateString(),
          duration: Math.floor(Math.random() * 60) + 30, // 30-90분
          sessions: Math.floor(Math.random() * 3) + 1, // 1-3세션
          exercises: Math.floor(Math.random() * 8) + 4, // 4-12운동
        })
      }

      console.log("테스트 데이터 생성:", testData)
      return testData
    }

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

    console.log("필터링된 세션:", filteredSessions.length)

    // 날짜별로 그룹화
    const groupedData = filteredSessions.reduce(
      (acc, session) => {
        const sessionDate = new Date(session.createdAt)
        const dateKey = sessionDate.toLocaleDateString()
        const dayKey = sessionDate.toLocaleDateString("ko-KR", {
          month: "short",
          day: "numeric",
        })

        if (!acc[dateKey]) {
          acc[dateKey] = {
            day: dayKey,
            value: 0,
            date: dateKey,
            duration: 0,
            sessions: 0,
            exercises: 0,
          }
        }

        // 세션 수를 기본 값으로 사용
        acc[dateKey].sessions += 1
        acc[dateKey].value = acc[dateKey].sessions

        // 운동 시간 추가
        acc[dateKey].duration +=
          session.totalDurationMinutes || session.duration || 0

        // 운동 세트 수 추가
        acc[dateKey].exercises += session.exerciseSets?.length || 0

        return acc
      },
      {} as Record<string, ChartDataPoint>
    )

    const result = Object.values(groupedData).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )

    console.log("차트 데이터 결과:", result)
    return result
  }, [sessions, selectedTimeRange])

  // 통계 계산
  const stats = useMemo((): ProgressStats => {
    if (!sessions || sessions.length === 0) {
      return {
        totalSessions: 7, // 테스트 데이터
        totalDuration: 420, // 테스트 데이터
        totalExercises: 56, // 테스트 데이터
        averageDuration: 60, // 테스트 데이터
        completionRate: 85, // 테스트 데이터
        totalCalories: 3360, // 테스트 데이터
        averageCalories: 480, // 테스트 데이터
      }
    }

    const completedSessions = sessions.filter(s => s.status === "completed")
    const totalDuration = sessions.reduce(
      (sum, s) => sum + (s.totalDurationMinutes || s.duration || 0),
      0
    )
    const totalExercises = sessions.reduce(
      (sum, s) => sum + (s.exerciseSets?.length || 0),
      0
    )

    // 칼로리 계산 (예시 - 실제 데이터에 따라 조정 필요)
    const totalCalories = sessions.reduce((sum, s) => {
      // 운동 시간 * 평균 칼로리 소모량 (예: 분당 8칼로리)
      const sessionCalories = (s.totalDurationMinutes || s.duration || 0) * 8
      return sum + sessionCalories
    }, 0)

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
      totalCalories: Math.round(totalCalories),
      averageCalories:
        sessions.length > 0 ? Math.round(totalCalories / sessions.length) : 0,
    }
  }, [sessions])

  // 시간별 차트 데이터 (운동 시간 기준)
  const durationChartData = useMemo((): ChartDataPoint[] => {
    return chartData.map(item => ({
      ...item,
      value: item.duration,
    }))
  }, [chartData])

  // 세션별 차트 데이터 (세션 수 기준)
  const sessionChartData = useMemo((): ChartDataPoint[] => {
    return chartData.map(item => ({
      ...item,
      value: item.sessions,
    }))
  }, [chartData])

  // 운동별 차트 데이터 (운동 세트 수 기준)
  const exerciseChartData = useMemo((): ChartDataPoint[] => {
    return chartData.map(item => ({
      ...item,
      value: item.exercises,
    }))
  }, [chartData])

  return {
    selectedChartType,
    selectedTimeRange,
    chartData,
    durationChartData,
    sessionChartData,
    exerciseChartData,
    stats,
    setSelectedChartType,
    setSelectedTimeRange,
  }
}
