import { Request, Response } from "express"
import { WorkoutJournalController } from "../../backend/controllers/workoutJournalController"
import { WorkoutJournalService } from "../../backend/services/workoutJournalService"
import { AuthenticatedRequest } from "../../backend/types"

// Mock the service
jest.mock("../../backend/services/workoutJournalService")
const mockedWorkoutJournalService = WorkoutJournalService as jest.MockedClass<
  typeof WorkoutJournalService
>

describe("WorkoutJournalController", () => {
  let controller: WorkoutJournalController
  let mockRequest: Partial<AuthenticatedRequest>
  let mockResponse: Partial<Response>
  let mockJson: jest.Mock
  let mockStatus: jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    controller = new WorkoutJournalController()

    mockJson = jest.fn()
    mockStatus = jest.fn().mockReturnValue({ json: mockJson })

    mockResponse = {
      json: mockJson,
      status: mockStatus,
    }
  })

  describe("getWorkoutPlans", () => {
    it("should return user plans successfully", async () => {
      const mockPlans = [
        {
          id: 1,
          userId: 1,
          name: "상체 운동",
          description: "상체 근력 향상을 위한 운동",
          difficulty: "intermediate",
          estimatedDurationMinutes: 60,
          targetMuscleGroups: ["chest", "back", "shoulders"],
          isActive: true,
          exercises: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockRequest = {
        user: { userId: 1 },
      }

      mockedWorkoutJournalService.prototype.getUserPlans = jest
        .fn()
        .mockResolvedValue(mockPlans)

      await controller.getWorkoutPlans(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(
        mockedWorkoutJournalService.prototype.getUserPlans
      ).toHaveBeenCalledWith(1)
      expect(mockJson).toHaveBeenCalledWith({ success: true, data: mockPlans })
    })

    it("should handle service errors", async () => {
      mockRequest = {
        user: { userId: 1 },
      }

      const error = new Error("Database connection failed")
      mockedWorkoutJournalService.prototype.getUserPlans = jest
        .fn()
        .mockRejectedValue(error)

      await controller.getWorkoutPlans(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toHaveBeenCalledWith({
        error: "운동 계획 조회에 실패했습니다.",
      })
    })

    it("should return 401 when user is not authenticated", async () => {
      mockRequest = {
        user: undefined,
      }

      await controller.getWorkoutPlans(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(mockStatus).toHaveBeenCalledWith(401)
      expect(mockJson).toHaveBeenCalledWith({ error: "인증이 필요합니다." })
    })
  })

  describe("createWorkoutPlan", () => {
    it("should create workout plan successfully", async () => {
      const planData = {
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

      const createdPlan = {
        id: 2,
        userId: 1,
        ...planData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockRequest = {
        user: { userId: 1 },
        body: planData,
      }

      mockedWorkoutJournalService.prototype.createUserPlan = jest
        .fn()
        .mockResolvedValue(createdPlan)

      await controller.createWorkoutPlan(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(
        mockedWorkoutJournalService.prototype.createUserPlan
      ).toHaveBeenCalledWith(1, planData)
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: createdPlan,
      })
    })

    it("should handle validation errors", async () => {
      mockRequest = {
        user: { userId: 1 },
        body: { name: "" }, // Invalid data
      }

      const error = new Error("Plan name is required")
      mockedWorkoutJournalService.prototype.createUserPlan = jest
        .fn()
        .mockRejectedValue(error)

      await controller.createWorkoutPlan(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockJson).toHaveBeenCalledWith({ error: "Plan name is required" })
    })
  })

  describe("updateWorkoutPlan", () => {
    it("should update workout plan successfully", async () => {
      const planId = 1
      const updateData = {
        name: "수정된 상체 운동",
        description: "수정된 설명",
      }

      const updatedPlan = {
        id: 1,
        userId: 1,
        ...updateData,
        difficulty: "intermediate",
        estimatedDurationMinutes: 60,
        targetMuscleGroups: ["chest", "back"],
        isActive: true,
        exercises: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockRequest = {
        user: { userId: 1 },
        params: { id: planId.toString() },
        body: updateData,
      }

      mockedWorkoutJournalService.prototype.updateUserPlan = jest
        .fn()
        .mockResolvedValue(updatedPlan)

      await controller.updateWorkoutPlan(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(
        mockedWorkoutJournalService.prototype.updateUserPlan
      ).toHaveBeenCalledWith(1, planId, updateData)
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: updatedPlan,
      })
    })

    it("should handle plan not found", async () => {
      const planId = 999
      mockRequest = {
        user: { userId: 1 },
        params: { id: planId.toString() },
        body: { name: "Updated Plan" },
      }

      const error = new Error("Plan not found")
      mockedWorkoutJournalService.prototype.updateUserPlan = jest
        .fn()
        .mockRejectedValue(error)

      await controller.updateWorkoutPlan(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(mockStatus).toHaveBeenCalledWith(404)
      expect(mockJson).toHaveBeenCalledWith({ error: "Plan not found" })
    })
  })

  describe("deleteWorkoutPlan", () => {
    it("should delete workout plan successfully", async () => {
      const planId = 1

      mockRequest = {
        user: { userId: 1 },
        params: { id: planId.toString() },
      }

      mockedWorkoutJournalService.prototype.deleteUserPlan = jest
        .fn()
        .mockResolvedValue(true)

      await controller.deleteWorkoutPlan(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(
        mockedWorkoutJournalService.prototype.deleteUserPlan
      ).toHaveBeenCalledWith(1, planId)
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: "운동 계획이 삭제되었습니다.",
      })
    })

    it("should handle plan not found during deletion", async () => {
      const planId = 999
      mockRequest = {
        user: { userId: 1 },
        params: { id: planId.toString() },
      }

      const error = new Error("Plan not found")
      mockedWorkoutJournalService.prototype.deleteUserPlan = jest
        .fn()
        .mockRejectedValue(error)

      await controller.deleteWorkoutPlan(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(mockStatus).toHaveBeenCalledWith(404)
      expect(mockJson).toHaveBeenCalledWith({ error: "Plan not found" })
    })
  })

  describe("getWorkoutSessions", () => {
    it("should return user sessions successfully", async () => {
      const mockSessions = [
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
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      mockRequest = {
        user: { userId: 1 },
      }

      mockedWorkoutJournalService.prototype.getUserSessions = jest
        .fn()
        .mockResolvedValue(mockSessions)

      await controller.getWorkoutSessions(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(
        mockedWorkoutJournalService.prototype.getUserSessions
      ).toHaveBeenCalledWith(1)
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockSessions,
      })
    })

    it("should handle service errors", async () => {
      mockRequest = {
        user: { userId: 1 },
      }

      const error = new Error("Database connection failed")
      mockedWorkoutJournalService.prototype.getUserSessions = jest
        .fn()
        .mockRejectedValue(error)

      await controller.getWorkoutSessions(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toHaveBeenCalledWith({
        error: "운동 세션 조회에 실패했습니다.",
      })
    })
  })

  describe("createWorkoutSession", () => {
    it("should create workout session successfully", async () => {
      const sessionData = {
        name: "새로운 운동 세션",
        description: "하체 운동",
        planId: 1,
        startTime: new Date("2024-01-17T10:00:00Z"),
      }

      const createdSession = {
        id: 2,
        userId: 1,
        ...sessionData,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockRequest = {
        user: { userId: 1 },
        body: sessionData,
      }

      mockedWorkoutJournalService.prototype.createUserSession = jest
        .fn()
        .mockResolvedValue(createdSession)

      await controller.createWorkoutSession(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(
        mockedWorkoutJournalService.prototype.createUserSession
      ).toHaveBeenCalledWith(1, sessionData)
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: createdSession,
      })
    })

    it("should handle validation errors", async () => {
      mockRequest = {
        user: { userId: 1 },
        body: { name: "" }, // Invalid data
      }

      const error = new Error("Session name is required")
      mockedWorkoutJournalService.prototype.createUserSession = jest
        .fn()
        .mockRejectedValue(error)

      await controller.createWorkoutSession(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockJson).toHaveBeenCalledWith({
        error: "Session name is required",
      })
    })
  })

  describe("getWorkoutGoals", () => {
    it("should return user goals successfully", async () => {
      const mockGoals = [
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

      mockRequest = {
        user: { userId: 1 },
      }

      mockedWorkoutJournalService.prototype.getUserGoals = jest
        .fn()
        .mockResolvedValue(mockGoals)

      await controller.getWorkoutGoals(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(
        mockedWorkoutJournalService.prototype.getUserGoals
      ).toHaveBeenCalledWith(1)
      expect(mockJson).toHaveBeenCalledWith({ success: true, data: mockGoals })
    })

    it("should handle service errors", async () => {
      mockRequest = {
        user: { userId: 1 },
      }

      const error = new Error("Database connection failed")
      mockedWorkoutJournalService.prototype.getUserGoals = jest
        .fn()
        .mockRejectedValue(error)

      await controller.getWorkoutGoals(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toHaveBeenCalledWith({
        error: "운동 목표 조회에 실패했습니다.",
      })
    })
  })

  describe("createWorkoutGoal", () => {
    it("should create workout goal successfully", async () => {
      const goalData = {
        title: "스쿼트 150kg 달성",
        description: "6개월 내에 스쿼트 150kg 달성",
        type: "weight",
        targetValue: 150,
        unit: "kg",
        deadline: new Date("2024-07-15"),
      }

      const createdGoal = {
        id: 2,
        userId: 1,
        ...goalData,
        currentValue: 0,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockRequest = {
        user: { userId: 1 },
        body: goalData,
      }

      mockedWorkoutJournalService.prototype.createUserGoal = jest
        .fn()
        .mockResolvedValue(createdGoal)

      await controller.createWorkoutGoal(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(
        mockedWorkoutJournalService.prototype.createUserGoal
      ).toHaveBeenCalledWith(1, goalData)
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: createdGoal,
      })
    })

    it("should handle validation errors", async () => {
      mockRequest = {
        user: { userId: 1 },
        body: { title: "" }, // Invalid data
      }

      const error = new Error("Goal title is required")
      mockedWorkoutJournalService.prototype.createUserGoal = jest
        .fn()
        .mockRejectedValue(error)

      await controller.createWorkoutGoal(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(mockStatus).toHaveBeenCalledWith(400)
      expect(mockJson).toHaveBeenCalledWith({ error: "Goal title is required" })
    })
  })

  describe("getDashboardData", () => {
    it("should return dashboard data successfully", async () => {
      const mockDashboardData = {
        summary: {
          totalPlans: 5,
          totalSessions: 20,
          completedSessions: 18,
          activeGoals: 3,
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

      mockRequest = {
        user: { userId: 1 },
      }

      mockedWorkoutJournalService.prototype.getDashboardData = jest
        .fn()
        .mockResolvedValue(mockDashboardData)

      await controller.getDashboardData(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(
        mockedWorkoutJournalService.prototype.getDashboardData
      ).toHaveBeenCalledWith(1)
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        data: mockDashboardData,
      })
    })

    it("should handle service errors", async () => {
      mockRequest = {
        user: { userId: 1 },
      }

      const error = new Error("Database connection failed")
      mockedWorkoutJournalService.prototype.getDashboardData = jest
        .fn()
        .mockRejectedValue(error)

      await controller.getDashboardData(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toHaveBeenCalledWith({
        error: "대시보드 데이터 조회에 실패했습니다.",
      })
    })
  })

  describe("Session control methods", () => {
    describe("startWorkoutSession", () => {
      it("should start workout session successfully", async () => {
        const sessionId = 1
        const startData = { startTime: new Date() }

        mockRequest = {
          user: { userId: 1 },
          params: { id: sessionId.toString() },
          body: startData,
        }

        const updatedSession = {
          id: sessionId,
          userId: 1,
          status: "in_progress",
          startTime: new Date(),
        }

        mockedWorkoutJournalService.prototype.startUserSession = jest
          .fn()
          .mockResolvedValue(updatedSession)

        await controller.startWorkoutSession(
          mockRequest as AuthenticatedRequest,
          mockResponse as Response
        )

        expect(
          mockedWorkoutJournalService.prototype.startUserSession
        ).toHaveBeenCalledWith(1, sessionId, startData)
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          data: updatedSession,
        })
      })
    })

    describe("pauseWorkoutSession", () => {
      it("should pause workout session successfully", async () => {
        const sessionId = 1

        mockRequest = {
          user: { userId: 1 },
          params: { id: sessionId.toString() },
        }

        const updatedSession = {
          id: sessionId,
          userId: 1,
          status: "paused",
        }

        mockedWorkoutJournalService.prototype.pauseUserSession = jest
          .fn()
          .mockResolvedValue(updatedSession)

        await controller.pauseWorkoutSession(
          mockRequest as AuthenticatedRequest,
          mockResponse as Response
        )

        expect(
          mockedWorkoutJournalService.prototype.pauseUserSession
        ).toHaveBeenCalledWith(1, sessionId)
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          data: updatedSession,
        })
      })
    })

    describe("resumeWorkoutSession", () => {
      it("should resume workout session successfully", async () => {
        const sessionId = 1

        mockRequest = {
          user: { userId: 1 },
          params: { id: sessionId.toString() },
        }

        const updatedSession = {
          id: sessionId,
          userId: 1,
          status: "in_progress",
        }

        mockedWorkoutJournalService.prototype.resumeUserSession = jest
          .fn()
          .mockResolvedValue(updatedSession)

        await controller.resumeWorkoutSession(
          mockRequest as AuthenticatedRequest,
          mockResponse as Response
        )

        expect(
          mockedWorkoutJournalService.prototype.resumeUserSession
        ).toHaveBeenCalledWith(1, sessionId)
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          data: updatedSession,
        })
      })
    })

    describe("completeWorkoutSession", () => {
      it("should complete workout session successfully", async () => {
        const sessionId = 1
        const completeData = { endTime: new Date(), duration: 60 }

        mockRequest = {
          user: { userId: 1 },
          params: { id: sessionId.toString() },
          body: completeData,
        }

        const updatedSession = {
          id: sessionId,
          userId: 1,
          status: "completed",
          endTime: new Date(),
          duration: 60,
        }

        mockedWorkoutJournalService.prototype.completeUserSession = jest
          .fn()
          .mockResolvedValue(updatedSession)

        await controller.completeWorkoutSession(
          mockRequest as AuthenticatedRequest,
          mockResponse as Response
        )

        expect(
          mockedWorkoutJournalService.prototype.completeUserSession
        ).toHaveBeenCalledWith(1, sessionId, completeData)
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          data: updatedSession,
        })
      })
    })
  })

  describe("Exercise set methods", () => {
    describe("getExerciseSets", () => {
      it("should return exercise sets successfully", async () => {
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

        mockRequest = {
          user: { userId: 1 },
          query: { sessionId: sessionId.toString() },
        }

        mockedWorkoutJournalService.prototype.getUserExerciseSets = jest
          .fn()
          .mockResolvedValue(mockSets)

        await controller.getExerciseSets(
          mockRequest as AuthenticatedRequest,
          mockResponse as Response
        )

        expect(
          mockedWorkoutJournalService.prototype.getUserExerciseSets
        ).toHaveBeenCalledWith(1, sessionId)
        expect(mockJson).toHaveBeenCalledWith({ success: true, data: mockSets })
      })
    })

    describe("createExerciseSet", () => {
      it("should create exercise set successfully", async () => {
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

        mockRequest = {
          user: { userId: 1 },
          body: setData,
        }

        mockedWorkoutJournalService.prototype.createUserExerciseSet = jest
          .fn()
          .mockResolvedValue(createdSet)

        await controller.createExerciseSet(
          mockRequest as AuthenticatedRequest,
          mockResponse as Response
        )

        expect(
          mockedWorkoutJournalService.prototype.createUserExerciseSet
        ).toHaveBeenCalledWith(1, setData)
        expect(mockJson).toHaveBeenCalledWith({
          success: true,
          data: createdSet,
        })
      })
    })
  })

  describe("Error handling", () => {
    it("should handle unknown errors", async () => {
      mockRequest = {
        user: { userId: 1 },
      }

      const error = "Unknown error"
      mockedWorkoutJournalService.prototype.getUserPlans = jest
        .fn()
        .mockRejectedValue(error)

      await controller.getWorkoutPlans(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(mockStatus).toHaveBeenCalledWith(500)
      expect(mockJson).toHaveBeenCalledWith({
        error: "운동 계획 조회에 실패했습니다.",
      })
    })

    it("should handle missing user ID", async () => {
      mockRequest = {
        user: { userId: undefined as any },
      }

      await controller.getWorkoutPlans(
        mockRequest as AuthenticatedRequest,
        mockResponse as Response
      )

      expect(mockStatus).toHaveBeenCalledWith(401)
      expect(mockJson).toHaveBeenCalledWith({ error: "인증이 필요합니다." })
    })
  })
})
