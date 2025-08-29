import { useState, useEffect } from "react"
import {
  WorkoutPlanDTO,
  WorkoutGoalDTO,
  WorkoutSessionDTO,
  WorkoutStats,
  WorkoutReminderDTO,
} from "../types"

export function useWorkoutData() {
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlanDTO[]>([])
  const [workoutGoals, setWorkoutGoals] = useState<WorkoutGoalDTO[]>([])
  const [workoutSessions, setWorkoutSessions] = useState<WorkoutSessionDTO[]>(
    []
  )
  const [workoutStats, setWorkoutStats] = useState<WorkoutStats>({
    totalSessions: 0,
    totalDurationMinutes: 0,
    totalCaloriesBurned: 0,
    longestStreak: 0,
    currentStreak: 0,
    favoriteMachines: [],
    favoriteExercises: [],
    startDate: new Date().toISOString(),
    dailyStats: [],
    weeklyStats: [],
    monthlyStats: [],
  })
  const [workoutReminders, setWorkoutReminders] = useState<
    WorkoutReminderDTO[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // 실제 API 호출로 대체 예정
    const fetchWorkoutData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // 임시 데이터 (나중에 API 호출로 대체)
        const mockData = {
          plans: [
            {
              id: 1,
              name: "상체 운동",
              description: "가슴, 어깨, 팔 운동",
              difficulty: "보통" as const,
              totalDurationMinutes: 60,
              exercises: [
                {
                  id: 1,
                  name: "벤치프레스",
                  machineId: 1,
                  setCount: 3,
                  setDurationSeconds: 60,
                  order: 1,
                },
                {
                  id: 2,
                  name: "오버헤드프레스",
                  machineId: 2,
                  setCount: 3,
                  setDurationSeconds: 60,
                  order: 2,
                },
              ],
              progress: 75,
              streak: 5,
              badge: "🔥",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 2,
              name: "하체 운동",
              description: "다리, 엉덩이 중심 운동",
              difficulty: "어려움" as const,
              totalDurationMinutes: 45,
              exercises: [
                {
                  id: 3,
                  name: "스쿼트",
                  machineId: 3,
                  setCount: 4,
                  setDurationSeconds: 90,
                  order: 1,
                },
                {
                  id: 4,
                  name: "데드리프트",
                  machineId: 4,
                  setCount: 3,
                  setDurationSeconds: 120,
                  order: 2,
                },
              ],
              progress: 60,
              streak: 3,
              badge: "💪",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 3,
              name: "유산소 운동",
              description: "심폐지구력 향상",
              difficulty: "쉬움" as const,
              totalDurationMinutes: 30,
              exercises: [
                {
                  id: 5,
                  name: "러닝",
                  machineId: 5,
                  setCount: 1,
                  setDurationSeconds: 1800,
                  order: 1,
                },
              ],
              progress: 90,
              streak: 7,
              badge: "🏃‍♂️",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          goals: [
            {
              id: 1,
              title: "주 3회 운동",
              description: "일주일에 3번 이상 운동하기",
              type: "frequency" as const,
              targetValue: 3,
              currentValue: 2,
              unit: "회/주",
              isCompleted: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 2,
              title: "벤치프레스 100kg",
              description: "벤치프레스 1RM 100kg 달성",
              type: "weight" as const,
              targetValue: 100,
              currentValue: 85,
              unit: "kg",
              isCompleted: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 3,
              title: "연속 30일 운동",
              description: "30일 연속으로 운동하기",
              type: "streak" as const,
              targetValue: 30,
              currentValue: 15,
              unit: "일",
              isCompleted: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          sessions: [
            {
              id: 1,
              planId: 1,
              name: "상체 운동 세션",
              startTime: new Date(Date.now() - 3600000).toISOString(),
              endTime: new Date().toISOString(),
              totalDurationMinutes: 60,
              moodRating: 8,
              energyLevel: 7,
              notes: "오늘 컨디션이 좋았다",
              status: "completed" as const,
              exerciseSets: [
                {
                  id: 1,
                  machineId: 1,
                  exerciseName: "벤치프레스",
                  setNumber: 1,
                  repsCompleted: 12,
                  weightKg: 60,
                  rpeRating: 7,
                  notes: "첫 세트는 가벼운 무게로",
                  isPersonalBest: false,
                  isCompleted: true,
                },
                {
                  id: 2,
                  machineId: 1,
                  exerciseName: "벤치프레스",
                  setNumber: 2,
                  repsCompleted: 10,
                  weightKg: 65,
                  rpeRating: 8,
                  notes: "무게를 올렸다",
                  isPersonalBest: false,
                  isCompleted: true,
                },
              ],
              caloriesBurned: 450,
              totalWeight: 720,
              totalSets: 6,
              totalReps: 66,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 2,
              planId: 2,
              name: "하체 운동 세션",
              startTime: new Date(Date.now() - 7200000).toISOString(),
              endTime: new Date(Date.now() - 3600000).toISOString(),
              totalDurationMinutes: 45,
              moodRating: 6,
              energyLevel: 5,
              notes: "다리가 아프다",
              status: "completed" as const,
              exerciseSets: [
                {
                  id: 3,
                  machineId: 3,
                  exerciseName: "스쿼트",
                  setNumber: 1,
                  repsCompleted: 10,
                  weightKg: 80,
                  rpeRating: 8,
                  notes: "무거웠다",
                  isPersonalBest: false,
                  isCompleted: true,
                },
              ],
              caloriesBurned: 380,
              totalWeight: 800,
              totalSets: 4,
              totalReps: 40,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          reminders: [
            {
              id: 1,
              title: "운동 알림",
              description: "매일 운동할 시간입니다",
              message: "운동할 시간입니다! 건강한 하루를 위해 운동해보세요.",
              time: "18:00",
              days: ["monday", "wednesday", "friday"],
              repeatInterval: "weekly" as const,
              reminderType: "push" as const,
              advanceNotice: 15,
              snoozeTime: 5,
              isActive: true,
              notes: "저녁 6시에 운동 알림",
              totalNotifications: 45,
              successRate: 85,
              lastNotificationTime: new Date().toISOString(),
              createdAt: new Date(
                Date.now() - 30 * 24 * 60 * 60 * 1000
              ).toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: 2,
              title: "물 마시기 알림",
              description: "수분 섭취를 위한 알림",
              message:
                "물을 마실 시간입니다! 하루 8잔 마시기 목표를 달성해보세요.",
              time: "10:00",
              days: [
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
                "sunday",
              ],
              repeatInterval: "daily" as const,
              reminderType: "push" as const,
              advanceNotice: 5,
              snoozeTime: 10,
              isActive: false,
              notes: "매일 아침 10시에 물 마시기 알림",
              totalNotifications: 120,
              successRate: 92,
              lastNotificationTime: new Date(
                Date.now() - 2 * 24 * 60 * 60 * 1000
              ).toISOString(),
              createdAt: new Date(
                Date.now() - 60 * 24 * 60 * 60 * 1000
              ).toISOString(),
              updatedAt: new Date(
                Date.now() - 2 * 24 * 60 * 60 * 1000
              ).toISOString(),
            },
          ],
          stats: {
            totalSessions: 25,
            totalDurationMinutes: 1500,
            totalCaloriesBurned: 12500,
            longestStreak: 7,
            currentStreak: 3,
            favoriteMachines: ["벤치프레스", "스쿼트랙", "레그프레스"],
            favoriteExercises: ["벤치프레스", "스쿼트", "데드리프트"],
            startDate: new Date(
              Date.now() - 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
            lastWorkoutDate: new Date().toISOString(),
            dailyStats: [],
            weeklyStats: [],
            monthlyStats: [],
          },
        }

        setWorkoutPlans(mockData.plans as any)
        setWorkoutGoals(mockData.goals as any)
        setWorkoutSessions(mockData.sessions as any)
        setWorkoutReminders(mockData.reminders as any)
        setWorkoutStats(mockData.stats as any)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "데이터를 불러오는데 실패했습니다."
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchWorkoutData()
  }, [])

  return {
    workoutPlans,
    workoutGoals,
    workoutSessions,
    workoutStats,
    workoutReminders,
    isLoading,
    error,
  }
}
