import { WorkoutJournalApi } from "../../../../frontend/shared/api/workoutJournalApi"
import type {
  WorkoutPlan,
  WorkoutSession,
  WorkoutGoal,
  DashboardData,
  CreatePlanRequest,
  CreateSessionRequest,
  CreateGoalRequest,
} from "../../../../shared/types"

// Mock storage
const mockStorage = {
  get: jest.fn(),
  set: jest.fn(),
  remove: jest.fn(),
  clear: jest.fn(),
}

// Mock fetch
global.fetch = jest.fn()

describe("WorkoutJournalApi", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    // Mock storage implementation
    jest.doMock("../../../../frontend/shared/lib", () => ({
      storage: mockStorage,
    }))
  })

  describe("getDashboardData", () => {
    it("should fetch dashboard data successfully", async () => {
      const mockDashboardData: DashboardData = {
        summary: {
          totalWorkouts: 20,
          totalGoals: 5,
          totalSessions: 20,
          totalPlans: 5,
          completedSessions: 18,
          streak: 7,
        },
        weeklyStats: {
          totalSessions: 4,
          totalDuration: 240,
          averageMood: 4.2,
          averageEnergy: 3.8,
        },
        recentSessions: [],
        recentProgress: [],
        activeGoals: [],
      }

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: mockDashboardData,
        }),
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)
      mockStorage.get.mockReturnValue("test-token")

      const result = await WorkoutJournalApi.getDashboardData()

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/workout-journal/dashboard",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
        }
      )
      expect(result).toEqual(mockDashboardData)
    })

    it("should throw error when API returns error", async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({
          error: "Database connection failed",
        }),
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)
      mockStorage.get.mockReturnValue("test-token")

      await expect(WorkoutJournalApi.getDashboardData()).rejects.toThrow(
        "Database connection failed"
      )
    })

    it("should throw error when response is not successful", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: false,
          error: "Invalid request",
        }),
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)
      mockStorage.get.mockReturnValue("test-token")

      await expect(WorkoutJournalApi.getDashboardData()).rejects.toThrow(
        "Invalid request"
      )
    })
  })

  describe("getWorkoutPlans", () => {
    it("should fetch workout plans successfully", async () => {
      const mockPlans: WorkoutPlan[] = [
        {
          id: 1,
          userId: 1,
          name: "상체 운동",
          description: "상체 근력 향상을 위한 운동",
          difficulty: "intermediate",
          duration: 60,
          targetMuscleGroups: ["chest", "back", "shoulders"],
          isActive: true,
          exercises: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: mockPlans,
        }),
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)
      mockStorage.get.mockReturnValue("test-token")

      const result = await WorkoutJournalApi.getWorkoutPlans()

      expect(global.fetch).toHaveBeenCalledWith("/api/workout-journal/plans", {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
      })
      expect(result).toEqual(mockPlans)
    })

    it("should return empty array when no plans exist", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: [],
        }),
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)
      mockStorage.get.mockReturnValue("test-token")

      const result = await WorkoutJournalApi.getWorkoutPlans()

      expect(result).toEqual([])
    })
  })

  describe("createWorkoutPlan", () => {
    it("should create workout plan successfully", async () => {
      const planData: CreatePlanRequest = {
        name: "하체 운동",
        description: "하체 근력 향상을 위한 운동",
        difficulty: "beginner",
        estimated_duration_minutes: 45,
        target_muscle_groups: ["legs", "glutes"],
        exercises: [
          {
            machineId: 1,
            exerciseName: "스쿼트",
            order: 1,
            sets: 3,
            reps: 12,
            weight: 50,
            restTime: 60,
          },
        ],
      }

      const createdPlan: WorkoutPlan = {
        id: 2,
        userId: 1,
        name: "하체 운동",
        description: "하체 근력 향상을 위한 운동",
        difficulty: "beginner",
        duration: 45,
        targetMuscleGroups: ["legs", "glutes"],
        isActive: true,
        exercises: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: createdPlan,
        }),
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)
      mockStorage.get.mockReturnValue("test-token")

      const result = await WorkoutJournalApi.createWorkoutPlan(planData)

      expect(global.fetch).toHaveBeenCalledWith("/api/workout-journal/plans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify(planData),
      })
      expect(result).toEqual(createdPlan)
    })
  })

  describe("updateWorkoutPlan", () => {
    it("should update workout plan successfully", async () => {
      const planId = 1
      const updateData = {
        name: "수정된 상체 운동",
        description: "수정된 설명",
      }

      const updatedPlan: WorkoutPlan = {
        id: 1,
        userId: 1,
        name: "수정된 상체 운동",
        description: "수정된 설명",
        difficulty: "intermediate",
        duration: 60,
        targetMuscleGroups: ["chest", "back"],
        isActive: true,
        exercises: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: updatedPlan,
        }),
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)
      mockStorage.get.mockReturnValue("test-token")

      const result = await WorkoutJournalApi.updateWorkoutPlan(
        planId,
        updateData
      )

      expect(global.fetch).toHaveBeenCalledWith(
        `/api/workout-journal/plans/${planId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
          body: JSON.stringify(updateData),
        }
      )
      expect(result).toEqual(updatedPlan)
    })
  })

  describe("deleteWorkoutPlan", () => {
    it("should delete workout plan successfully", async () => {
      const planId = 1

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
        }),
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)
      mockStorage.get.mockReturnValue("test-token")

      await expect(
        WorkoutJournalApi.deleteWorkoutPlan(planId)
      ).resolves.toBeUndefined()

      expect(global.fetch).toHaveBeenCalledWith(
        `/api/workout-journal/plans/${planId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
        }
      )
    })
  })

  describe("getWorkoutSessions", () => {
    it("should fetch workout sessions successfully", async () => {
      const mockSessions: WorkoutSession[] = [
        {
          id: 1,
          userId: 1,
          name: "오늘의 운동",
          description: "상체 운동 세션",
          startTime: new Date("2024-01-15T10:00:00Z"),
          endTime: new Date("2024-01-15T11:00:00Z"),
          duration: 60,
          status: "completed" as const,
          notes: "컨디션이 좋았다",
          isCompleted: true,
          exerciseSets: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: mockSessions,
        }),
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)
      mockStorage.get.mockReturnValue("test-token")

      const result = await WorkoutJournalApi.getWorkoutSessions()

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/workout-journal/sessions",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
        }
      )
      expect(result).toEqual(mockSessions)
    })
  })

  describe("createWorkoutSession", () => {
    it("should create workout session successfully", async () => {
      const sessionData: CreateSessionRequest = {
        name: "새로운 운동 세션",
        planId: 1,
        startTime: new Date("2024-01-15T10:00:00Z"),
        exerciseSets: [],
      }

      const createdSession: WorkoutSession = {
        id: 2,
        userId: 1,
        name: "새로운 운동 세션",
        startTime: new Date("2024-01-15T10:00:00Z"),
        status: "in_progress" as const,
        isCompleted: false,
        exerciseSets: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: createdSession,
        }),
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)
      mockStorage.get.mockReturnValue("test-token")

      const result = await WorkoutJournalApi.createWorkoutSession(sessionData)

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/workout-journal/sessions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
          body: JSON.stringify(sessionData),
        }
      )
      expect(result).toEqual(createdSession)
    })
  })

  describe("getWorkoutGoals", () => {
    it("should fetch workout goals successfully", async () => {
      const mockGoals: WorkoutGoal[] = [
        {
          id: 1,
          userId: 1,
          title: "벤치프레스 100kg 달성",
          description: "3개월 내에 벤치프레스 100kg 달성",
          type: "weight",
          targetValue: 100,
          currentValue: 80,
          unit: "kg",
          isCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: mockGoals,
        }),
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)
      mockStorage.get.mockReturnValue("test-token")

      const result = await WorkoutJournalApi.getWorkoutGoals()

      expect(global.fetch).toHaveBeenCalledWith("/api/workout-journal/goals", {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
      })
      expect(result).toEqual(mockGoals)
    })
  })

  describe("createWorkoutGoal", () => {
    it("should create workout goal successfully", async () => {
      const goalData: CreateGoalRequest = {
        userId: 1,
        title: "스쿼트 150kg 달성",
        description: "6개월 내에 스쿼트 150kg 달성",
        type: "weight",
        targetValue: 150,
        unit: "kg",
        deadline: new Date("2024-07-15"),
      }

      const createdGoal: WorkoutGoal = {
        id: 2,
        userId: 1,
        title: "스쿼트 150kg 달성",
        description: "6개월 내에 스쿼트 150kg 달성",
        type: "weight",
        targetValue: 150,
        currentValue: 0,
        unit: "kg",
        deadline: new Date("2024-07-15"),
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: createdGoal,
        }),
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)
      mockStorage.get.mockReturnValue("test-token")

      const result = await WorkoutJournalApi.createWorkoutGoal(goalData)

      expect(global.fetch).toHaveBeenCalledWith("/api/workout-journal/goals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify(goalData),
      })
      expect(result).toEqual(createdGoal)
    })
  })

  describe("Session control methods", () => {
    it("should start workout session", async () => {
      const sessionId = 1
      const startData = { startTime: new Date() }

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: { sessionId, status: "in_progress" },
        }),
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)
      mockStorage.get.mockReturnValue("test-token")

      const result = await WorkoutJournalApi.startWorkoutSession(
        sessionId,
        startData
      )

      expect(global.fetch).toHaveBeenCalledWith(
        `/api/workout-journal/sessions/${sessionId}/start`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
          body: JSON.stringify(startData),
        }
      )
      expect(result).toEqual({ sessionId, status: "in_progress" })
    })

    it("should pause workout session", async () => {
      const sessionId = 1

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: { sessionId, status: "paused" },
        }),
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)
      mockStorage.get.mockReturnValue("test-token")

      const result = await WorkoutJournalApi.pauseWorkoutSession(sessionId)

      expect(global.fetch).toHaveBeenCalledWith(
        `/api/workout-journal/sessions/${sessionId}/pause`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
        }
      )
      expect(result).toEqual({ sessionId, status: "paused" })
    })

    it("should resume workout session", async () => {
      const sessionId = 1

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: { sessionId, status: "in_progress" },
        }),
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)
      mockStorage.get.mockReturnValue("test-token")

      const result = await WorkoutJournalApi.resumeWorkoutSession(sessionId)

      expect(global.fetch).toHaveBeenCalledWith(
        `/api/workout-journal/sessions/${sessionId}/resume`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
        }
      )
      expect(result).toEqual({ sessionId, status: "in_progress" })
    })

    it("should complete workout session", async () => {
      const sessionId = 1
      const completeData = { endTime: new Date(), duration: 60 }

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: { sessionId, status: "completed" },
        }),
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)
      mockStorage.get.mockReturnValue("test-token")

      const result = await WorkoutJournalApi.completeWorkoutSession(
        sessionId,
        completeData
      )

      expect(global.fetch).toHaveBeenCalledWith(
        `/api/workout-journal/sessions/${sessionId}/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
          body: JSON.stringify(completeData),
        }
      )
      expect(result).toEqual({ sessionId, status: "completed" })
    })
  })

  describe("Exercise set methods", () => {
    it("should get exercise sets", async () => {
      const sessionId = 1
      const mockSets = [
        {
          id: 1,
          sessionId: 1,
          machineId: 1,
          exerciseName: "벤치프레스",
          setNumber: 1,
          weight: 80,
          reps: 10,
          restTime: 60,
          createdAt: new Date(),
        },
      ]

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: mockSets,
        }),
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)
      mockStorage.get.mockReturnValue("test-token")

      const result = await WorkoutJournalApi.getExerciseSets(sessionId)

      expect(global.fetch).toHaveBeenCalledWith(
        "/api/workout-journal/sets?sessionId=1",
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer test-token",
          },
        }
      )
      expect(result).toEqual(mockSets)
    })

    it("should create exercise set", async () => {
      const setData = {
        sessionId: 1,
        machineId: 1,
        exerciseName: "벤치프레스",
        setNumber: 1,
        weight: 80,
        reps: 10,
        restTime: 60,
      }

      const createdSet = {
        id: 1,
        ...setData,
        createdAt: new Date(),
      }

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: createdSet,
        }),
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)
      mockStorage.get.mockReturnValue("test-token")

      const result = await WorkoutJournalApi.createExerciseSet(setData)

      expect(global.fetch).toHaveBeenCalledWith("/api/workout-journal/sets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer test-token",
        },
        body: JSON.stringify(setData),
      })
      expect(result).toEqual(createdSet)
    })
  })

  describe("Error handling", () => {
    it("should handle network errors", async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"))
      mockStorage.get.mockReturnValue("test-token")

      await expect(WorkoutJournalApi.getWorkoutPlans()).rejects.toThrow(
        "Network error"
      )
    })

    it("should handle JSON parse errors", async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)
      mockStorage.get.mockReturnValue("test-token")

      await expect(WorkoutJournalApi.getWorkoutPlans()).rejects.toThrow(
        "운동 계획을 불러오는데 실패했습니다."
      )
    })

    it("should handle missing authorization token", async () => {
      mockStorage.get.mockReturnValue(null)

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          data: [],
        }),
      }

      ;(global.fetch as jest.Mock).mockResolvedValue(mockResponse)

      await WorkoutJournalApi.getWorkoutPlans()

      expect(global.fetch).toHaveBeenCalledWith("/api/workout-journal/plans", {
        headers: {
          "Content-Type": "application/json",
        },
      })
    })
  })
})
