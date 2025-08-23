import { renderHook, act, waitFor } from "@testing-library/react"
import { useWorkoutPlans } from "../../../../../frontend/features/workout/hooks/useWorkoutPlans"
import { WorkoutJournalApi } from "../../../../../frontend/shared/api/workoutJournalApi"
import type { WorkoutPlan } from "../../../../../shared/types"

// Mock the API
jest.mock("../../../../../frontend/shared/api/workoutJournalApi")
const mockedWorkoutJournalApi = WorkoutJournalApi as jest.Mocked<
  typeof WorkoutJournalApi
>

describe("useWorkoutPlans", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

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
      createdAt: new Date("2024-01-15T10:00:00Z"),
      updatedAt: new Date("2024-01-15T10:00:00Z"),
    },
    {
      id: 2,
      userId: 1,
      name: "하체 운동",
      description: "하체 근력 향상을 위한 운동",
      difficulty: "beginner",
      duration: 45,
      targetMuscleGroups: ["legs", "glutes"],
      isActive: true,
      exercises: [],
      createdAt: new Date("2024-01-16T10:00:00Z"),
      updatedAt: new Date("2024-01-16T10:00:00Z"),
    },
  ]

  describe("getUserPlans", () => {
    it("should fetch plans successfully", async () => {
      mockedWorkoutJournalApi.getWorkoutPlans.mockResolvedValue(mockPlans)

      const { result } = renderHook(() => useWorkoutPlans())

      await act(async () => {
        await result.current.getUserPlans()
      })

      expect(mockedWorkoutJournalApi.getWorkoutPlans).toHaveBeenCalledTimes(1)
      expect(result.current.plans).toEqual(mockPlans)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it("should handle API errors", async () => {
      const errorMessage = "Failed to fetch plans"
      mockedWorkoutJournalApi.getWorkoutPlans.mockRejectedValue(
        new Error(errorMessage)
      )

      const { result } = renderHook(() => useWorkoutPlans())

      await act(async () => {
        await result.current.getUserPlans()
      })

      expect(mockedWorkoutJournalApi.getWorkoutPlans).toHaveBeenCalledTimes(1)
      expect(result.current.plans).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(errorMessage)
    })

    it("should set loading state correctly", async () => {
      let resolvePromise: (value: WorkoutPlan[]) => void
      const promise = new Promise<WorkoutPlan[]>(resolve => {
        resolvePromise = resolve
      })
      mockedWorkoutJournalApi.getWorkoutPlans.mockReturnValue(promise)

      const { result } = renderHook(() => useWorkoutPlans())

      act(() => {
        result.current.getUserPlans()
      })

      expect(result.current.loading).toBe(true)

      await act(async () => {
        resolvePromise!(mockPlans)
        await promise
      })

      expect(result.current.loading).toBe(false)
    })
  })

  describe("createPlan", () => {
    it("should create plan successfully", async () => {
      const newPlanData = {
        name: "새로운 운동 계획",
        description: "새로운 계획 설명",
        difficulty: "beginner" as const,
        duration: 30,
        targetMuscleGroups: ["chest"],
        exercises: [],
      }

      const createdPlan: WorkoutPlan = {
        id: 3,
        userId: 1,
        ...newPlanData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockedWorkoutJournalApi.createWorkoutPlan.mockResolvedValue(createdPlan)

      const { result } = renderHook(() => useWorkoutPlans())

      // Set initial plans
      act(() => {
        result.current.plans = mockPlans
      })

      let createdPlanResult: WorkoutPlan | undefined

      await act(async () => {
        createdPlanResult = await result.current.createPlan(newPlanData)
      })

      expect(mockedWorkoutJournalApi.createWorkoutPlan).toHaveBeenCalledWith(
        newPlanData
      )
      expect(createdPlanResult).toEqual(createdPlan)
      expect(result.current.plans).toEqual([createdPlan, ...mockPlans])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it("should handle creation errors", async () => {
      const newPlanData = {
        name: "새로운 운동 계획",
        description: "새로운 계획 설명",
      }

      const errorMessage = "Failed to create plan"
      mockedWorkoutJournalApi.createWorkoutPlan.mockRejectedValue(
        new Error(errorMessage)
      )

      const { result } = renderHook(() => useWorkoutPlans())

      await act(async () => {
        try {
          await result.current.createPlan(newPlanData)
        } catch (error) {
          // Expected to throw
        }
      })

      expect(mockedWorkoutJournalApi.createWorkoutPlan).toHaveBeenCalledWith(
        newPlanData
      )
      expect(result.current.plans).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(errorMessage)
    })

    it("should remove userId from plan data before sending to API", async () => {
      const planDataWithUserId = {
        userId: 1,
        name: "새로운 운동 계획",
        description: "새로운 계획 설명",
      }

      const createdPlan: WorkoutPlan = {
        id: 3,
        userId: 1,
        name: "새로운 운동 계획",
        description: "새로운 계획 설명",
        difficulty: "beginner",
        duration: 30,
        targetMuscleGroups: [],
        isActive: true,
        exercises: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockedWorkoutJournalApi.createWorkoutPlan.mockResolvedValue(createdPlan)

      const { result } = renderHook(() => useWorkoutPlans())

      await act(async () => {
        await result.current.createPlan(planDataWithUserId)
      })

      expect(mockedWorkoutJournalApi.createWorkoutPlan).toHaveBeenCalledWith({
        name: "새로운 운동 계획",
        description: "새로운 계획 설명",
      })
    })
  })

  describe("updatePlan", () => {
    it("should update plan successfully", async () => {
      const planId = 1
      const updateData = {
        name: "수정된 상체 운동",
        description: "수정된 설명",
      }

      const updatedPlan: WorkoutPlan = {
        ...mockPlans[0],
        ...updateData,
        updatedAt: new Date("2024-01-17T10:00:00Z"),
      }

      mockedWorkoutJournalApi.updateWorkoutPlan.mockResolvedValue(updatedPlan)

      const { result } = renderHook(() => useWorkoutPlans())

      // Set initial plans
      act(() => {
        result.current.plans = mockPlans
      })

      let updatedPlanResult: WorkoutPlan | undefined

      await act(async () => {
        updatedPlanResult = await result.current.updatePlan(planId, updateData)
      })

      expect(mockedWorkoutJournalApi.updateWorkoutPlan).toHaveBeenCalledWith(
        planId,
        updateData
      )
      expect(updatedPlanResult).toEqual(updatedPlan)
      expect(result.current.plans).toEqual([updatedPlan, mockPlans[1]])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it("should handle update errors", async () => {
      const planId = 1
      const updateData = {
        name: "수정된 상체 운동",
      }

      const errorMessage = "Failed to update plan"
      mockedWorkoutJournalApi.updateWorkoutPlan.mockRejectedValue(
        new Error(errorMessage)
      )

      const { result } = renderHook(() => useWorkoutPlans())

      // Set initial plans
      act(() => {
        result.current.plans = mockPlans
      })

      await act(async () => {
        try {
          await result.current.updatePlan(planId, updateData)
        } catch (error) {
          // Expected to throw
        }
      })

      expect(mockedWorkoutJournalApi.updateWorkoutPlan).toHaveBeenCalledWith(
        planId,
        updateData
      )
      expect(result.current.plans).toEqual(mockPlans) // Should remain unchanged
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe("deletePlan", () => {
    it("should delete plan successfully", async () => {
      const planId = 1

      mockedWorkoutJournalApi.deleteWorkoutPlan.mockResolvedValue()

      const { result } = renderHook(() => useWorkoutPlans())

      // Set initial plans
      act(() => {
        result.current.plans = mockPlans
      })

      await act(async () => {
        await result.current.deletePlan(planId)
      })

      expect(mockedWorkoutJournalApi.deleteWorkoutPlan).toHaveBeenCalledWith(
        planId
      )
      expect(result.current.plans).toEqual([mockPlans[1]]) // First plan should be removed
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it("should handle deletion errors", async () => {
      const planId = 1

      const errorMessage = "Failed to delete plan"
      mockedWorkoutJournalApi.deleteWorkoutPlan.mockRejectedValue(
        new Error(errorMessage)
      )

      const { result } = renderHook(() => useWorkoutPlans())

      // Set initial plans
      act(() => {
        result.current.plans = mockPlans
      })

      await act(async () => {
        try {
          await result.current.deletePlan(planId)
        } catch (error) {
          // Expected to throw
        }
      })

      expect(mockedWorkoutJournalApi.deleteWorkoutPlan).toHaveBeenCalledWith(
        planId
      )
      expect(result.current.plans).toEqual(mockPlans) // Should remain unchanged
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe("clearError", () => {
    it("should clear error state", async () => {
      const errorMessage = "Some error"
      mockedWorkoutJournalApi.getWorkoutPlans.mockRejectedValue(
        new Error(errorMessage)
      )

      const { result } = renderHook(() => useWorkoutPlans())

      // Trigger an error
      await act(async () => {
        await result.current.getUserPlans()
      })

      expect(result.current.error).toBe(errorMessage)

      // Clear the error
      act(() => {
        result.current.clearError()
      })

      expect(result.current.error).toBeNull()
    })
  })

  describe("initialization", () => {
    it("should automatically fetch plans on mount", async () => {
      mockedWorkoutJournalApi.getWorkoutPlans.mockResolvedValue(mockPlans)

      renderHook(() => useWorkoutPlans())

      await waitFor(() => {
        expect(mockedWorkoutJournalApi.getWorkoutPlans).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe("state management", () => {
    it("should maintain state between operations", async () => {
      mockedWorkoutJournalApi.getWorkoutPlans.mockResolvedValue(mockPlans)

      const { result } = renderHook(() => useWorkoutPlans())

      // Initial fetch
      await act(async () => {
        await result.current.getUserPlans()
      })

      expect(result.current.plans).toEqual(mockPlans)

      // Create new plan
      const newPlan: WorkoutPlan = {
        id: 3,
        userId: 1,
        name: "새로운 계획",
        description: "새로운 설명",
        difficulty: "beginner",
        duration: 30,
        targetMuscleGroups: [],
        isActive: true,
        exercises: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockedWorkoutJournalApi.createWorkoutPlan.mockResolvedValue(newPlan)

      await act(async () => {
        await result.current.createPlan({
          name: "새로운 계획",
          description: "새로운 설명",
        })
      })

      expect(result.current.plans).toEqual([newPlan, ...mockPlans])
    })
  })
})
