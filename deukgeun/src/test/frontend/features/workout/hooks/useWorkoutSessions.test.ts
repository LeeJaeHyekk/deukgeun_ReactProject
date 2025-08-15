import { renderHook, act, waitFor } from "@testing-library/react"
import { useWorkoutSessions } from "../../../../../frontend/features/workout/hooks/useWorkoutSessions"
import { WorkoutJournalApi } from "../../../../../frontend/shared/api/workoutJournalApi"
import type { WorkoutSession } from "../../../../../types"

// Mock the API
jest.mock("../../../../../frontend/shared/api/workoutJournalApi")
const mockedWorkoutJournalApi = WorkoutJournalApi as jest.Mocked<
  typeof WorkoutJournalApi
>

describe("useWorkoutSessions", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockSessions: WorkoutSession[] = [
    {
      id: 1,
      userId: 1,
      name: "오늘의 상체 운동",
      description: "상체 근력 향상을 위한 운동 세션",
      startTime: new Date("2024-01-15T10:00:00Z"),
      endTime: new Date("2024-01-15T11:00:00Z"),
      duration: 60,
      caloriesBurned: 300,
      notes: "컨디션이 좋았다",
      isCompleted: true,
      createdAt: new Date("2024-01-15T10:00:00Z"),
      updatedAt: new Date("2024-01-15T11:00:00Z"),
    },
    {
      id: 2,
      userId: 1,
      name: "하체 운동 세션",
      description: "하체 근력 향상을 위한 운동 세션",
      startTime: new Date("2024-01-16T14:00:00Z"),
      endTime: new Date("2024-01-16T15:30:00Z"),
      duration: 90,
      caloriesBurned: 450,
      notes: "다리가 아프다",
      isCompleted: true,
      createdAt: new Date("2024-01-16T14:00:00Z"),
      updatedAt: new Date("2024-01-16T15:30:00Z"),
    },
  ]

  describe("getUserSessions", () => {
    it("should fetch sessions successfully", async () => {
      mockedWorkoutJournalApi.getWorkoutSessions.mockResolvedValue(mockSessions)

      const { result } = renderHook(() => useWorkoutSessions())

      await act(async () => {
        await result.current.getUserSessions()
      })

      expect(mockedWorkoutJournalApi.getWorkoutSessions).toHaveBeenCalledTimes(
        1
      )
      expect(result.current.sessions).toEqual(mockSessions)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it("should handle API errors", async () => {
      const errorMessage = "Failed to fetch sessions"
      mockedWorkoutJournalApi.getWorkoutSessions.mockRejectedValue(
        new Error(errorMessage)
      )

      const { result } = renderHook(() => useWorkoutSessions())

      await act(async () => {
        await result.current.getUserSessions()
      })

      expect(mockedWorkoutJournalApi.getWorkoutSessions).toHaveBeenCalledTimes(
        1
      )
      expect(result.current.sessions).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(errorMessage)
    })

    it("should set loading state correctly", async () => {
      let resolvePromise: (value: WorkoutSession[]) => void
      const promise = new Promise<WorkoutSession[]>(resolve => {
        resolvePromise = resolve
      })
      mockedWorkoutJournalApi.getWorkoutSessions.mockReturnValue(promise)

      const { result } = renderHook(() => useWorkoutSessions())

      act(() => {
        result.current.getUserSessions()
      })

      expect(result.current.loading).toBe(true)

      await act(async () => {
        resolvePromise!(mockSessions)
        await promise
      })

      expect(result.current.loading).toBe(false)
    })
  })

  describe("createSession", () => {
    it("should create session successfully", async () => {
      const newSessionData = {
        name: "새로운 운동 세션",
        description: "새로운 세션 설명",
        planId: 1,
        startTime: new Date("2024-01-17T10:00:00Z"),
      }

      const createdSession: WorkoutSession = {
        id: 3,
        userId: 1,
        ...newSessionData,
        isCompleted: false,
        createdAt: new Date("2024-01-17T10:00:00Z"),
        updatedAt: new Date("2024-01-17T10:00:00Z"),
      }

      mockedWorkoutJournalApi.createWorkoutSession.mockResolvedValue(
        createdSession
      )

      const { result } = renderHook(() => useWorkoutSessions())

      // Set initial sessions
      act(() => {
        result.current.sessions = mockSessions
      })

      let createdSessionResult: WorkoutSession | undefined

      await act(async () => {
        createdSessionResult =
          await result.current.createSession(newSessionData)
      })

      expect(mockedWorkoutJournalApi.createWorkoutSession).toHaveBeenCalledWith(
        newSessionData
      )
      expect(createdSessionResult).toEqual(createdSession)
      expect(result.current.sessions).toEqual([createdSession, ...mockSessions])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it("should handle creation errors", async () => {
      const newSessionData = {
        name: "새로운 운동 세션",
        description: "새로운 세션 설명",
      }

      const errorMessage = "Failed to create session"
      mockedWorkoutJournalApi.createWorkoutSession.mockRejectedValue(
        new Error(errorMessage)
      )

      const { result } = renderHook(() => useWorkoutSessions())

      await act(async () => {
        try {
          await result.current.createSession(newSessionData)
        } catch (error) {
          // Expected to throw
        }
      })

      expect(mockedWorkoutJournalApi.createWorkoutSession).toHaveBeenCalledWith(
        newSessionData
      )
      expect(result.current.sessions).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(errorMessage)
    })

    it("should remove userId from session data before sending to API", async () => {
      const sessionDataWithUserId = {
        userId: 1,
        name: "새로운 운동 세션",
        description: "새로운 세션 설명",
      }

      const createdSession: WorkoutSession = {
        id: 3,
        userId: 1,
        name: "새로운 운동 세션",
        description: "새로운 세션 설명",
        startTime: new Date(),
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockedWorkoutJournalApi.createWorkoutSession.mockResolvedValue(
        createdSession
      )

      const { result } = renderHook(() => useWorkoutSessions())

      await act(async () => {
        await result.current.createSession(sessionDataWithUserId)
      })

      expect(mockedWorkoutJournalApi.createWorkoutSession).toHaveBeenCalledWith(
        {
          name: "새로운 운동 세션",
          description: "새로운 세션 설명",
        }
      )
    })
  })

  describe("updateSession", () => {
    it("should update session successfully", async () => {
      const sessionId = 1
      const updateData = {
        name: "수정된 상체 운동",
        description: "수정된 설명",
        endTime: new Date("2024-01-15T11:30:00Z"),
        duration: 90,
        caloriesBurned: 350,
        isCompleted: true,
      }

      const updatedSession: WorkoutSession = {
        ...mockSessions[0],
        ...updateData,
        updatedAt: new Date("2024-01-17T10:00:00Z"),
      }

      mockedWorkoutJournalApi.updateWorkoutSession.mockResolvedValue(
        updatedSession
      )

      const { result } = renderHook(() => useWorkoutSessions())

      // Set initial sessions
      act(() => {
        result.current.sessions = mockSessions
      })

      let updatedSessionResult: WorkoutSession | undefined

      await act(async () => {
        updatedSessionResult = await result.current.updateSession(
          sessionId,
          updateData
        )
      })

      expect(mockedWorkoutJournalApi.updateWorkoutSession).toHaveBeenCalledWith(
        sessionId,
        {
          ...updateData,
          sessionId,
        }
      )
      expect(updatedSessionResult).toEqual(updatedSession)
      expect(result.current.sessions).toEqual([updatedSession, mockSessions[1]])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it("should handle update errors", async () => {
      const sessionId = 1
      const updateData = {
        name: "수정된 상체 운동",
      }

      const errorMessage = "Failed to update session"
      mockedWorkoutJournalApi.updateWorkoutSession.mockRejectedValue(
        new Error(errorMessage)
      )

      const { result } = renderHook(() => useWorkoutSessions())

      // Set initial sessions
      act(() => {
        result.current.sessions = mockSessions
      })

      await act(async () => {
        try {
          await result.current.updateSession(sessionId, updateData)
        } catch (error) {
          // Expected to throw
        }
      })

      expect(mockedWorkoutJournalApi.updateWorkoutSession).toHaveBeenCalledWith(
        sessionId,
        {
          ...updateData,
          sessionId,
        }
      )
      expect(result.current.sessions).toEqual(mockSessions) // Should remain unchanged
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe("deleteSession", () => {
    it("should delete session successfully", async () => {
      const sessionId = 1

      mockedWorkoutJournalApi.deleteWorkoutSession.mockResolvedValue()

      const { result } = renderHook(() => useWorkoutSessions())

      // Set initial sessions
      act(() => {
        result.current.sessions = mockSessions
      })

      await act(async () => {
        await result.current.deleteSession(sessionId)
      })

      expect(mockedWorkoutJournalApi.deleteWorkoutSession).toHaveBeenCalledWith(
        sessionId
      )
      expect(result.current.sessions).toEqual([mockSessions[1]]) // First session should be removed
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it("should handle deletion errors", async () => {
      const sessionId = 1

      const errorMessage = "Failed to delete session"
      mockedWorkoutJournalApi.deleteWorkoutSession.mockRejectedValue(
        new Error(errorMessage)
      )

      const { result } = renderHook(() => useWorkoutSessions())

      // Set initial sessions
      act(() => {
        result.current.sessions = mockSessions
      })

      await act(async () => {
        try {
          await result.current.deleteSession(sessionId)
        } catch (error) {
          // Expected to throw
        }
      })

      expect(mockedWorkoutJournalApi.deleteWorkoutSession).toHaveBeenCalledWith(
        sessionId
      )
      expect(result.current.sessions).toEqual(mockSessions) // Should remain unchanged
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(errorMessage)
    })
  })

  describe("clearError", () => {
    it("should clear error state", async () => {
      const errorMessage = "Some error"
      mockedWorkoutJournalApi.getWorkoutSessions.mockRejectedValue(
        new Error(errorMessage)
      )

      const { result } = renderHook(() => useWorkoutSessions())

      // Trigger an error
      await act(async () => {
        await result.current.getUserSessions()
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
    it("should automatically fetch sessions on mount", async () => {
      mockedWorkoutJournalApi.getWorkoutSessions.mockResolvedValue(mockSessions)

      renderHook(() => useWorkoutSessions())

      await waitFor(() => {
        expect(
          mockedWorkoutJournalApi.getWorkoutSessions
        ).toHaveBeenCalledTimes(1)
      })
    })
  })

  describe("state management", () => {
    it("should maintain state between operations", async () => {
      mockedWorkoutJournalApi.getWorkoutSessions.mockResolvedValue(mockSessions)

      const { result } = renderHook(() => useWorkoutSessions())

      // Initial fetch
      await act(async () => {
        await result.current.getUserSessions()
      })

      expect(result.current.sessions).toEqual(mockSessions)

      // Create new session
      const newSession: WorkoutSession = {
        id: 3,
        userId: 1,
        name: "새로운 세션",
        description: "새로운 설명",
        startTime: new Date(),
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockedWorkoutJournalApi.createWorkoutSession.mockResolvedValue(newSession)

      await act(async () => {
        await result.current.createSession({
          name: "새로운 세션",
          description: "새로운 설명",
        })
      })

      expect(result.current.sessions).toEqual([newSession, ...mockSessions])
    })
  })

  describe("session filtering and sorting", () => {
    it("should handle sessions with different statuses", async () => {
      const sessionsWithStatus = [
        {
          ...mockSessions[0],
          session_id: 1,
          session_name: "상체 운동",
          start_time: new Date("2024-01-15T10:00:00Z"),
          end_time: new Date("2024-01-15T11:00:00Z"),
          status: "completed",
        },
        {
          ...mockSessions[1],
          session_id: 2,
          session_name: "하체 운동",
          start_time: new Date("2024-01-16T14:00:00Z"),
          status: "in_progress",
        },
      ]

      mockedWorkoutJournalApi.getWorkoutSessions.mockResolvedValue(
        sessionsWithStatus
      )

      const { result } = renderHook(() => useWorkoutSessions())

      await act(async () => {
        await result.current.getUserSessions()
      })

      expect(result.current.sessions).toEqual(sessionsWithStatus)
    })
  })

  describe("error handling edge cases", () => {
    it("should handle non-Error exceptions", async () => {
      mockedWorkoutJournalApi.getWorkoutSessions.mockRejectedValue(
        "String error"
      )

      const { result } = renderHook(() => useWorkoutSessions())

      await act(async () => {
        await result.current.getUserSessions()
      })

      expect(result.current.error).toBe("운동 세션을 불러오는데 실패했습니다.")
    })

    it("should handle undefined error messages", async () => {
      const error = new Error()
      error.message = undefined as any
      mockedWorkoutJournalApi.getWorkoutSessions.mockRejectedValue(error)

      const { result } = renderHook(() => useWorkoutSessions())

      await act(async () => {
        await result.current.getUserSessions()
      })

      expect(result.current.error).toBe("운동 세션을 불러오는데 실패했습니다.")
    })
  })
})
