import { renderHook, act, waitFor } from "@testing-library/react"
import { useWorkoutGoals } from "../../../../../frontend/features/workout/hooks/useWorkoutGoals"
import { WorkoutJournalApi } from "../../../../../frontend/shared/api/workoutJournalApi"
import type { WorkoutGoal } from "../../../../../types"

// Mock the API
jest.mock("../../../../../frontend/shared/api/workoutJournalApi")
const mockedWorkoutJournalApi = WorkoutJournalApi as jest.Mocked<
  typeof WorkoutJournalApi
>

describe("useWorkoutGoals", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

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
      createdAt: new Date("2024-01-15T10:00:00Z"),
      updatedAt: new Date("2024-01-15T10:00:00Z"),
    },
    {
      id: 2,
      userId: 1,
      title: "스쿼트 150kg 달성",
      description: "6개월 내에 스쿼트 150kg 달성",
      type: "weight",
      targetValue: 150,
      currentValue: 120,
      unit: "kg",
      deadline: new Date("2024-07-15"),
      isCompleted: false,
      createdAt: new Date("2024-01-16T10:00:00Z"),
      updatedAt: new Date("2024-01-16T10:00:00Z"),
    },
  ]

  describe("getUserGoals", () => {
    it("should fetch goals successfully", async () => {
      mockedWorkoutJournalApi.getWorkoutGoals.mockResolvedValue(mockGoals)

      const { result } = renderHook(() => useWorkoutGoals())

      await act(async () => {
        await result.current.getUserGoals()
      })

      expect(mockedWorkoutJournalApi.getWorkoutGoals).toHaveBeenCalledTimes(1)
      expect(result.current.goals).toEqual(mockGoals)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it("should handle API errors", async () => {
      const errorMessage = "Failed to fetch goals"
      mockedWorkoutJournalApi.getWorkoutGoals.mockRejectedValue(
        new Error(errorMessage)
      )

      const { result } = renderHook(() => useWorkoutGoals())

      await act(async () => {
        await result.current.getUserGoals()
      })

      expect(mockedWorkoutJournalApi.getWorkoutGoals).toHaveBeenCalledTimes(1)
      expect(result.current.goals).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(errorMessage)
    })

    it("should set loading state correctly", async () => {
      let resolvePromise: (value: WorkoutGoal[]) => void
      const promise = new Promise<WorkoutGoal[]>(resolve => {
        resolvePromise = resolve
      })
      mockedWorkoutJournalApi.getWorkoutGoals.mockReturnValue(promise)

      const { result } = renderHook(() => useWorkoutGoals())

      act(() => {
        result.current.getUserGoals()
      })

      expect(result.current.loading).toBe(true)

      await act(async () => {
        resolvePromise!(mockGoals)
        await promise
      })

      expect(result.current.loading).toBe(false)
    })
  })

  describe("createGoal", () => {
    it("should create goal successfully", async () => {
      const newGoalData = {
        title: "데드리프트 200kg 달성",
        description: "1년 내에 데드리프트 200kg 달성",
        type: "weight" as const,
        targetValue: 200,
        unit: "kg",
        deadline: new Date("2024-12-31"),
      }

      const createdGoal: WorkoutGoal = {
        id: 3,
        userId: 1,
        ...newGoalData,
        currentValue: 0,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockedWorkoutJournalApi.createWorkoutGoal.mockResolvedValue(createdGoal)

      const { result } = renderHook(() => useWorkoutGoals())

      // Set initial goals
      act(() => {
        result.current.goals = mockGoals
      })

      let createdGoalResult: WorkoutGoal | undefined

      await act(async () => {
        createdGoalResult = await result.current.createGoal(newGoalData)
      })

      expect(mockedWorkoutJournalApi.createWorkoutGoal).toHaveBeenCalledWith(
        newGoalData
      )
      expect(createdGoalResult).toEqual(createdGoal)
      expect(result.current.goals).toEqual([createdGoal, ...mockGoals])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it("should handle creation errors", async () => {
      const newGoalData = {
        title: "새로운 목표",
        description: "새로운 목표 설명",
        type: "weight" as const,
        targetValue: 100,
        unit: "kg",
      }

      const errorMessage = "Failed to create goal"
      mockedWorkoutJournalApi.createWorkoutGoal.mockRejectedValue(
        new Error(errorMessage)
      )

      const { result } = renderHook(() => useWorkoutGoals())

      await act(async () => {
        try {
          await result.current.createGoal(newGoalData)
        } catch (error) {
          // Expected to throw
        }
      })

      expect(mockedWorkoutJournalApi.createWorkoutGoal).toHaveBeenCalledWith(
        newGoalData
      )
      expect(result.current.goals).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(errorMessage)
    })

    it("should remove userId from goal data before sending to API", async () => {
      const goalDataWithUserId = {
        userId: 1,
        title: "새로운 목표",
        description: "새로운 목표 설명",
        type: "weight" as const,
        targetValue: 100,
        unit: "kg",
      }

      const createdGoal: WorkoutGoal = {
        id: 3,
        userId: 1,
        title: "새로운 목표",
        description: "새로운 목표 설명",
        type: "weight",
        targetValue: 100,
        currentValue: 0,
        unit: "kg",
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockedWorkoutJournalApi.createWorkoutGoal.mockResolvedValue(createdGoal)

      const { result } = renderHook(() => useWorkoutGoals())

      await act(async () => {
        await result.current.createGoal(goalDataWithUserId)
      })

      expect(mockedWorkoutJournalApi.createWorkoutGoal).toHaveBeenCalledWith({
        title: "새로운 목표",
        description: "새로운 목표 설명",
        type: "weight",
        targetValue: 100,
        unit: "kg",
      })
    })
  })

  describe("updateGoal", () => {
    it("should update goal successfully", async () => {
      const goalId = 1
      const updateData = {
        currentValue: 85,
        title: "수정된 벤치프레스 목표",
      }

      const updatedGoal: WorkoutGoal = {
        ...mockGoals[0],
        ...updateData,
        updatedAt: new Date("2024-01-17T10:00:00Z"),
      }

      mockedWorkoutJournalApi.updateWorkoutGoal.mockResolvedValue(updatedGoal)

      const { result } = renderHook(() => useWorkoutGoals())

      // Set initial goals
      act(() => {
        result.current.goals = mockGoals
      })

      let updatedGoalResult: WorkoutGoal | undefined

      await act(async () => {
        updatedGoalResult = await result.current.updateGoal(goalId, updateData)
      })

      expect(mockedWorkoutJournalApi.updateWorkoutGoal).toHaveBeenCalledWith(
        goalId,
        {
          ...updateData,
          goalId,
        }
      )
      expect(updatedGoalResult).toEqual(updatedGoal)
      expect(result.current.goals).toEqual([updatedGoal, mockGoals[1]])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it("should handle update errors", async () => {
      const goalId = 1
      const updateData = {
        currentValue: 85,
      }

      const errorMessage = "Failed to update goal"
      mockedWorkoutJournalApi.updateWorkoutGoal.mockRejectedValue(
        new Error(errorMessage)
      )

      const { result } = renderHook(() => useWorkoutGoals())

      // Set initial goals
      act(() => {
        result.current.goals = mockGoals
      })

      await act(async () => {
        try {
          await result.current.updateGoal(goalId, updateData)
        } catch (error) {
          // Expected to throw
        }
      })

      expect(mockedWorkoutJournalApi.updateWorkoutGoal).toHaveBeenCalledWith(
        goalId,
        {
          ...updateData,
          goalId,
        }
      )
      expect(result.current.goals).toEqual(mockGoals) // Should remain unchanged
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(errorMessage)
    })

    it("should handle goal completion", async () => {
      const goalId = 1
      const updateData = {
        currentValue: 100,
        isCompleted: true,
      }

      const completedGoal: WorkoutGoal = {
        ...mockGoals[0],
        ...updateData,
        completedAt: new Date(),
        updatedAt: new Date("2024-01-17T10:00:00Z"),
      }

      mockedWorkoutJournalApi.updateWorkoutGoal.mockResolvedValue(completedGoal)

      const { result } = renderHook(() => useWorkoutGoals())

      // Set initial goals
      act(() => {
        result.current.goals = mockGoals
      })

      await act(async () => {
        await result.current.updateGoal(goalId, updateData)
      })

      expect(mockedWorkoutJournalApi.updateWorkoutGoal).toHaveBeenCalledWith(
        goalId,
        {
          ...updateData,
          goalId,
        }
      )
      expect(result.current.goals[0].isCompleted).toBe(true)
      expect(result.current.goals[0].currentValue).toBe(100)
    })
  })

  describe("deleteGoal", () => {
    it("should delete goal successfully", async () => {
      const goalId = 1

      mockedWorkoutJournalApi.deleteWorkoutGoal.mockResolvedValue()

      const { result } = renderHook(() => useWorkoutGoals())

      // Set initial goals
      act(() => {
        result.current.goals = mockGoals
      })

      await act(async () => {
        await result.current.deleteGoal(goalId)
      })

      expect(mockedWorkoutJournalApi.deleteWorkoutGoal).toHaveBeenCalledWith(
        goalId
      )
      expect(result.current.goals).toEqual([mockGoals[1]]) // First goal should be removed
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it("should handle deletion errors", async () => {
      const goalId = 1

      const errorMessage = "Failed to delete goal"
      mockedWorkoutJournalApi.deleteWorkoutGoal.mockRejectedValue(
        new Error(errorMessage)
      )

      const { result } = renderHook(() => useWorkoutGoals())

      // Set initial goals
      act(() => {
        result.current.goals = mockGoals
      })

      await act(async () => {
        try {
          await result.current.deleteGoal(goalId)
        } catch (error) {
          // Expected to throw
        }
      })

      expect(mockedWorkoutJournalApi.deleteWorkoutGoal).toHaveBeenCalledWith(
        goalId
      )
      expect(result.current.goals).toEqual(mockGoals) // Should remain unchanged
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe("clearError", () => {
    it("should clear error state", async () => {
      const errorMessage = "Some error"
      mockedWorkoutJournalApi.getWorkoutGoals.mockRejectedValue(
        new Error(errorMessage)
      )

      const { result } = renderHook(() => useWorkoutGoals())

      // Trigger an error
      await act(async () => {
        await result.current.getUserGoals()
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
    it("should automatically fetch goals on mount", async () => {
      mockedWorkoutJournalApi.getWorkoutGoals.mockResolvedValue(mockGoals)

      renderHook(() => useWorkoutGoals())

      await waitFor(() => {
        expect(mockedWorkoutJournalApi.getWorkoutGoals).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe("goal types", () => {
    it("should handle different goal types", async () => {
      const goalsWithDifferentTypes: WorkoutGoal[] = [
        {
          id: 1,
          userId: 1,
          title: "벤치프레스 100kg",
          type: "weight",
          targetValue: 100,
          currentValue: 80,
          unit: "kg",
          isCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          userId: 1,
          title: "팔굽혀펴기 50회",
          type: "reps",
          targetValue: 50,
          currentValue: 30,
          unit: "회",
          isCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          userId: 1,
          title: "운동 30분",
          type: "duration",
          targetValue: 30,
          currentValue: 20,
          unit: "분",
          isCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 4,
          userId: 1,
          title: "주 3회 운동",
          type: "frequency",
          targetValue: 3,
          currentValue: 2,
          unit: "회/주",
          isCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 5,
          userId: 1,
          title: "연속 운동 7일",
          type: "streak",
          targetValue: 7,
          currentValue: 5,
          unit: "일",
          isCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockedWorkoutJournalApi.getWorkoutGoals.mockResolvedValue(
        goalsWithDifferentTypes
      )

      const { result } = renderHook(() => useWorkoutGoals())

      await act(async () => {
        await result.current.getUserGoals()
      })

      expect(result.current.goals).toEqual(goalsWithDifferentTypes)
      expect(result.current.goals).toHaveLength(5)
    })
  })

  describe("goal progress calculation", () => {
    it("should handle goals with different progress levels", async () => {
      const goalsWithProgress: WorkoutGoal[] = [
        {
          id: 1,
          userId: 1,
          title: "벤치프레스 100kg",
          type: "weight",
          targetValue: 100,
          currentValue: 100, // 100% 완료
          unit: "kg",
          isCompleted: true,
          completedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          userId: 1,
          title: "스쿼트 150kg",
          type: "weight",
          targetValue: 150,
          currentValue: 75, // 50% 완료
          unit: "kg",
          isCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 3,
          userId: 1,
          title: "데드리프트 200kg",
          type: "weight",
          targetValue: 200,
          currentValue: 0, // 0% 완료
          unit: "kg",
          isCompleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockedWorkoutJournalApi.getWorkoutGoals.mockResolvedValue(
        goalsWithProgress
      )

      const { result } = renderHook(() => useWorkoutGoals())

      await act(async () => {
        await result.current.getUserGoals()
      })

      expect(result.current.goals[0].isCompleted).toBe(true)
      expect(result.current.goals[0].currentValue).toBe(100)
      expect(result.current.goals[1].isCompleted).toBe(false)
      expect(result.current.goals[1].currentValue).toBe(75)
      expect(result.current.goals[2].isCompleted).toBe(false)
      expect(result.current.goals[2].currentValue).toBe(0)
    })
  })

  describe("error handling edge cases", () => {
    it("should handle non-Error exceptions", async () => {
      mockedWorkoutJournalApi.getWorkoutGoals.mockRejectedValue("String error")

      const { result } = renderHook(() => useWorkoutGoals())

      await act(async () => {
        await result.current.getUserGoals()
      })

      expect(result.current.error).toBe("운동 목표를 불러오는데 실패했습니다.")
    })

    it("should handle undefined error messages", async () => {
      const error = new Error()
      error.message = undefined as any
      mockedWorkoutJournalApi.getWorkoutGoals.mockRejectedValue(error)

      const { result } = renderHook(() => useWorkoutGoals())

      await act(async () => {
        await result.current.getUserGoals()
      })

      expect(result.current.error).toBe("운동 목표를 불러오는데 실패했습니다.")
    })
  })
})
