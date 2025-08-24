import request from "supertest"
import { app } from "../../backend/app"
import { AppDataSource } from "../../backend/config/database"
import { User } from "../../backend/entities/User"
import { WorkoutPlan } from "../../backend/entities/WorkoutPlan"
import { WorkoutSession } from "../../backend/entities/WorkoutSession"
import { WorkoutGoal } from "../../backend/entities/WorkoutGoal"
import { Machine } from "../../backend/entities/Machine"
import { generateToken } from "../../backend/utils/jwt"

describe("WorkoutJournal API Integration Tests", () => {
  let authToken: string
  let testUser: User
  let testMachine: Machine

  beforeAll(async () => {
    // 데이터베이스 연결
    await AppDataSource.initialize()

    // 테스트 사용자 생성
    const userRepository = AppDataSource.getRepository(User)
    testUser = userRepository.create({
      email: "test@workoutjournal.com",
      password: "hashedPassword",
      nickname: "TestUser",
      birthDate: new Date("1990-01-01"),
      gender: "male",
      phoneNumber: "010-1234-5678",
      level: 1,
      exp: 0,
    })
    await userRepository.save(testUser)

    // 테스트 기계 생성
    const machineRepository = AppDataSource.getRepository(Machine)
    testMachine = machineRepository.create({
      name: "벤치프레스",
      description: "가슴 근육을 발달시키는 운동",
      category: "chest",
      difficulty: "intermediate",
      instructions: "벤치에 누워서 바벨을 밀어올리는 운동",
      imageUrl: "/images/bench-press.jpg",
    })
    await machineRepository.save(testMachine)

    // JWT 토큰 생성
    authToken = generateToken({ userId: testUser.id, email: testUser.email })
  })

  afterAll(async () => {
    // 테스트 데이터 정리
    const userRepository = AppDataSource.getRepository(User)
    const machineRepository = AppDataSource.getRepository(Machine)
    const planRepository = AppDataSource.getRepository(WorkoutPlan)
    const sessionRepository = AppDataSource.getRepository(WorkoutSession)
    const goalRepository = AppDataSource.getRepository(WorkoutGoal)

    await planRepository.delete({ userId: testUser.id })
    await sessionRepository.delete({ userId: testUser.id })
    await goalRepository.delete({ userId: testUser.id })
    await userRepository.delete({ id: testUser.id })
    await machineRepository.delete({ id: testMachine.id })

    // 데이터베이스 연결 종료
    await AppDataSource.destroy()
  })

  describe("GET /api/workout-journal/dashboard", () => {
    it("should return dashboard data for authenticated user", async () => {
      const response = await request(app)
        .get("/api/workout-journal/dashboard")
        .set("Authorization", `Bearer ${authToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty("summary")
      expect(response.body.data).toHaveProperty("weeklyStats")
      expect(response.body.data).toHaveProperty("recentSessions")
      expect(response.body.data).toHaveProperty("recentProgress")
      expect(response.body.data).toHaveProperty("activeGoals")
    })

    it("should return 401 for unauthenticated request", async () => {
      await request(app).get("/api/workout-journal/dashboard").expect(401)
    })
  })

  describe("Workout Plans", () => {
    describe("GET /api/workout-journal/plans", () => {
      it("should return empty plans list for new user", async () => {
        const response = await request(app)
          .get("/api/workout-journal/plans")
          .set("Authorization", `Bearer ${authToken}`)
          .expect(200)

        expect(response.body.success).toBe(true)
        expect(response.body.data).toEqual([])
      })
    })

    describe("POST /api/workout-journal/plans", () => {
      it("should create a new workout plan", async () => {
        const planData = {
          name: "상체 운동",
          description: "상체 근력 향상을 위한 운동",
          difficulty: "intermediate",
          estimated_duration_minutes: 60,
          target_muscle_groups: ["chest", "back", "shoulders"],
          exercises: [
            {
              machineId: testMachine.id,
              exerciseName: "벤치프레스",
              order: 1,
              sets: 3,
              reps: 12,
              weight: 80,
              restTime: 60,
            },
          ],
        }

        const response = await request(app)
          .post("/api/workout-journal/plans")
          .set("Authorization", `Bearer ${authToken}`)
          .send(planData)
          .expect(200)

        expect(response.body.success).toBe(true)
        expect(response.body.data).toHaveProperty("id")
        expect(response.body.data.name).toBe(planData.name)
        expect(response.body.data.userId).toBe(testUser.id)
        expect(response.body.data.exercises).toHaveLength(1)
      })

      it("should validate required fields", async () => {
        const invalidPlanData = {
          description: "상체 근력 향상을 위한 운동",
          // name is missing
        }

        const response = await request(app)
          .post("/api/workout-journal/plans")
          .set("Authorization", `Bearer ${authToken}`)
          .send(invalidPlanData)
          .expect(400)

        expect(response.body.success).toBe(false)
        expect(response.body.error).toContain("name")
      })
    })

    describe("PUT /api/workout-journal/plans/:id", () => {
      let createdPlanId: number

      beforeEach(async () => {
        // 테스트용 계획 생성
        const planData = {
          name: "테스트 계획",
          description: "테스트용 계획",
          difficulty: "beginner",
          estimated_duration_minutes: 30,
          target_muscle_groups: ["chest"],
          exercises: [],
        }

        const response = await request(app)
          .post("/api/workout-journal/plans")
          .set("Authorization", `Bearer ${authToken}`)
          .send(planData)

        createdPlanId = response.body.data.id
      })

      it("should update an existing workout plan", async () => {
        const updateData = {
          name: "수정된 테스트 계획",
          description: "수정된 설명",
        }

        const response = await request(app)
          .put(`/api/workout-journal/plans/${createdPlanId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send(updateData)
          .expect(200)

        expect(response.body.success).toBe(true)
        expect(response.body.data.name).toBe(updateData.name)
        expect(response.body.data.description).toBe(updateData.description)
      })

      it("should return 404 for non-existent plan", async () => {
        const updateData = {
          name: "수정된 계획",
        }

        await request(app)
          .put("/api/workout-journal/plans/99999")
          .set("Authorization", `Bearer ${authToken}`)
          .send(updateData)
          .expect(404)
      })
    })

    describe("DELETE /api/workout-journal/plans/:id", () => {
      let createdPlanId: number

      beforeEach(async () => {
        // 테스트용 계획 생성
        const planData = {
          name: "삭제용 계획",
          description: "삭제될 계획",
          difficulty: "beginner",
          estimated_duration_minutes: 30,
          target_muscle_groups: ["chest"],
          exercises: [],
        }

        const response = await request(app)
          .post("/api/workout-journal/plans")
          .set("Authorization", `Bearer ${authToken}`)
          .send(planData)

        createdPlanId = response.body.data.id
      })

      it("should delete an existing workout plan", async () => {
        const response = await request(app)
          .delete(`/api/workout-journal/plans/${createdPlanId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .expect(200)

        expect(response.body.success).toBe(true)
        expect(response.body.message).toBe("운동 계획이 삭제되었습니다.")

        // 삭제 확인
        await request(app)
          .get(`/api/workout-journal/plans/${createdPlanId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .expect(404)
      })
    })
  })

  describe("Workout Sessions", () => {
    describe("GET /api/workout-journal/sessions", () => {
      it("should return empty sessions list for new user", async () => {
        const response = await request(app)
          .get("/api/workout-journal/sessions")
          .set("Authorization", `Bearer ${authToken}`)
          .expect(200)

        expect(response.body.success).toBe(true)
        expect(response.body.data).toEqual([])
      })
    })

    describe("POST /api/workout-journal/sessions", () => {
      it("should create a new workout session", async () => {
        const sessionData = {
          name: "오늘의 운동",
          description: "상체 운동 세션",
          startTime: new Date().toISOString(),
        }

        const response = await request(app)
          .post("/api/workout-journal/sessions")
          .set("Authorization", `Bearer ${authToken}`)
          .send(sessionData)
          .expect(200)

        expect(response.body.success).toBe(true)
        expect(response.body.data).toHaveProperty("id")
        expect(response.body.data.name).toBe(sessionData.name)
        expect(response.body.data.userId).toBe(testUser.id)
        expect(response.body.data.isCompleted).toBe(false)
      })

      it("should validate required fields", async () => {
        const invalidSessionData = {
          description: "상체 운동 세션",
          // name is missing
        }

        const response = await request(app)
          .post("/api/workout-journal/sessions")
          .set("Authorization", `Bearer ${authToken}`)
          .send(invalidSessionData)
          .expect(400)

        expect(response.body.success).toBe(false)
        expect(response.body.error).toContain("name")
      })
    })

    describe("Session Control", () => {
      let createdSessionId: number

      beforeEach(async () => {
        // 테스트용 세션 생성
        const sessionData = {
          name: "테스트 세션",
          description: "테스트용 세션",
          startTime: new Date().toISOString(),
        }

        const response = await request(app)
          .post("/api/workout-journal/sessions")
          .set("Authorization", `Bearer ${authToken}`)
          .send(sessionData)

        createdSessionId = response.body.data.id
      })

      describe("POST /api/workout-journal/sessions/:id/start", () => {
        it("should start a workout session", async () => {
          const startData = {
            startTime: new Date().toISOString(),
          }

          const response = await request(app)
            .post(`/api/workout-journal/sessions/${createdSessionId}/start`)
            .set("Authorization", `Bearer ${authToken}`)
            .send(startData)
            .expect(200)

          expect(response.body.success).toBe(true)
          expect(response.body.data.status).toBe("in_progress")
        })
      })

      describe("POST /api/workout-journal/sessions/:id/pause", () => {
        it("should pause a workout session", async () => {
          const response = await request(app)
            .post(`/api/workout-journal/sessions/${createdSessionId}/pause`)
            .set("Authorization", `Bearer ${authToken}`)
            .expect(200)

          expect(response.body.success).toBe(true)
          expect(response.body.data.status).toBe("paused")
        })
      })

      describe("POST /api/workout-journal/sessions/:id/resume", () => {
        it("should resume a workout session", async () => {
          const response = await request(app)
            .post(`/api/workout-journal/sessions/${createdSessionId}/resume`)
            .set("Authorization", `Bearer ${authToken}`)
            .expect(200)

          expect(response.body.success).toBe(true)
          expect(response.body.data.status).toBe("in_progress")
        })
      })

      describe("POST /api/workout-journal/sessions/:id/complete", () => {
        it("should complete a workout session", async () => {
          const completeData = {
            endTime: new Date().toISOString(),
            duration: 60,
            caloriesBurned: 300,
          }

          const response = await request(app)
            .post(`/api/workout-journal/sessions/${createdSessionId}/complete`)
            .set("Authorization", `Bearer ${authToken}`)
            .send(completeData)
            .expect(200)

          expect(response.body.success).toBe(true)
          expect(response.body.data.status).toBe("completed")
          expect(response.body.data.isCompleted).toBe(true)
        })
      })
    })
  })

  describe("Workout Goals", () => {
    describe("GET /api/workout-journal/goals", () => {
      it("should return empty goals list for new user", async () => {
        const response = await request(app)
          .get("/api/workout-journal/goals")
          .set("Authorization", `Bearer ${authToken}`)
          .expect(200)

        expect(response.body.success).toBe(true)
        expect(response.body.data).toEqual([])
      })
    })

    describe("POST /api/workout-journal/goals", () => {
      it("should create a new workout goal", async () => {
        const goalData = {
          title: "벤치프레스 100kg 달성",
          description: "3개월 내에 벤치프레스 100kg 달성",
          type: "weight",
          targetValue: 100,
          unit: "kg",
          deadline: new Date(
            Date.now() + 90 * 24 * 60 * 60 * 1000
          ).toISOString(), // 90 days from now
        }

        const response = await request(app)
          .post("/api/workout-journal/goals")
          .set("Authorization", `Bearer ${authToken}`)
          .send(goalData)
          .expect(200)

        expect(response.body.success).toBe(true)
        expect(response.body.data).toHaveProperty("id")
        expect(response.body.data.title).toBe(goalData.title)
        expect(response.body.data.userId).toBe(testUser.id)
        expect(response.body.data.currentValue).toBe(0)
        expect(response.body.data.isCompleted).toBe(false)
      })

      it("should validate required fields", async () => {
        const invalidGoalData = {
          description: "3개월 내에 벤치프레스 100kg 달성",
          // title is missing
        }

        const response = await request(app)
          .post("/api/workout-journal/goals")
          .set("Authorization", `Bearer ${authToken}`)
          .send(invalidGoalData)
          .expect(400)

        expect(response.body.success).toBe(false)
        expect(response.body.error).toContain("title")
      })
    })

    describe("PUT /api/workout-journal/goals/:id", () => {
      let createdGoalId: number

      beforeEach(async () => {
        // 테스트용 목표 생성
        const goalData = {
          title: "테스트 목표",
          description: "테스트용 목표",
          type: "weight",
          targetValue: 50,
          unit: "kg",
        }

        const response = await request(app)
          .post("/api/workout-journal/goals")
          .set("Authorization", `Bearer ${authToken}`)
          .send(goalData)

        createdGoalId = response.body.data.id
      })

      it("should update an existing workout goal", async () => {
        const updateData = {
          currentValue: 30,
          title: "수정된 테스트 목표",
        }

        const response = await request(app)
          .put(`/api/workout-journal/goals/${createdGoalId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send(updateData)
          .expect(200)

        expect(response.body.success).toBe(true)
        expect(response.body.data.currentValue).toBe(updateData.currentValue)
        expect(response.body.data.title).toBe(updateData.title)
      })

      it("should handle goal completion", async () => {
        const updateData = {
          currentValue: 50,
          isCompleted: true,
        }

        const response = await request(app)
          .put(`/api/workout-journal/goals/${createdGoalId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .send(updateData)
          .expect(200)

        expect(response.body.success).toBe(true)
        expect(response.body.data.isCompleted).toBe(true)
        expect(response.body.data.completedAt).toBeDefined()
      })
    })
  })

  describe("Exercise Sets", () => {
    let createdSessionId: number

    beforeEach(async () => {
      // 테스트용 세션 생성
      const sessionData = {
        name: "세트 테스트 세션",
        description: "세트 테스트용 세션",
        startTime: new Date().toISOString(),
      }

      const response = await request(app)
        .post("/api/workout-journal/sessions")
        .set("Authorization", `Bearer ${authToken}`)
        .send(sessionData)

      createdSessionId = response.body.data.id
    })

    describe("GET /api/workout-journal/sets", () => {
      it("should return empty sets list for new session", async () => {
        const response = await request(app)
          .get(`/api/workout-journal/sets?sessionId=${createdSessionId}`)
          .set("Authorization", `Bearer ${authToken}`)
          .expect(200)

        expect(response.body.success).toBe(true)
        expect(response.body.data).toEqual([])
      })
    })

    describe("POST /api/workout-journal/sets", () => {
      it("should create a new exercise set", async () => {
        const setData = {
          sessionId: createdSessionId,
          machineId: testMachine.id,
          exerciseName: "벤치프레스",
          setNumber: 1,
          weight: 80,
          reps: 10,
          restTime: 60,
        }

        const response = await request(app)
          .post("/api/workout-journal/sets")
          .set("Authorization", `Bearer ${authToken}`)
          .send(setData)
          .expect(200)

        expect(response.body.success).toBe(true)
        expect(response.body.data).toHaveProperty("id")
        expect(response.body.data.sessionId).toBe(createdSessionId)
        expect(response.body.data.machineId).toBe(testMachine.id)
        expect(response.body.data.exerciseName).toBe(setData.exerciseName)
      })

      it("should validate required fields", async () => {
        const invalidSetData = {
          sessionId: createdSessionId,
          exerciseName: "벤치프레스",
          // machineId is missing
        }

        const response = await request(app)
          .post("/api/workout-journal/sets")
          .set("Authorization", `Bearer ${authToken}`)
          .send(invalidSetData)
          .expect(400)

        expect(response.body.success).toBe(false)
        expect(response.body.error).toContain("machineId")
      })
    })
  })

  describe("Error Handling", () => {
    it("should handle invalid JWT token", async () => {
      await request(app)
        .get("/api/workout-journal/plans")
        .set("Authorization", "Bearer invalid-token")
        .expect(401)
    })

    it("should handle missing Authorization header", async () => {
      await request(app).get("/api/workout-journal/plans").expect(401)
    })

    it("should handle malformed request body", async () => {
      await request(app)
        .post("/api/workout-journal/plans")
        .set("Authorization", `Bearer ${authToken}`)
        .send("invalid json")
        .set("Content-Type", "application/json")
        .expect(400)
    })
  })

  describe("Data Consistency", () => {
    it("should maintain data consistency across related entities", async () => {
      // 1. 계획 생성
      const planData = {
        name: "일관성 테스트 계획",
        description: "데이터 일관성 테스트용",
        difficulty: "beginner",
        estimated_duration_minutes: 30,
        target_muscle_groups: ["chest"],
        exercises: [],
      }

      const planResponse = await request(app)
        .post("/api/workout-journal/plans")
        .set("Authorization", `Bearer ${authToken}`)
        .send(planData)

      const planId = planResponse.body.data.id

      // 2. 세션 생성 (계획과 연결)
      const sessionData = {
        name: "일관성 테스트 세션",
        description: "데이터 일관성 테스트용",
        planId: planId,
        startTime: new Date().toISOString(),
      }

      const sessionResponse = await request(app)
        .post("/api/workout-journal/sessions")
        .set("Authorization", `Bearer ${authToken}`)
        .send(sessionData)

      const sessionId = sessionResponse.body.data.id

      // 3. 세트 생성 (세션과 연결)
      const setData = {
        sessionId: sessionId,
        machineId: testMachine.id,
        exerciseName: "벤치프레스",
        setNumber: 1,
        weight: 80,
        reps: 10,
        restTime: 60,
      }

      const setResponse = await request(app)
        .post("/api/workout-journal/sets")
        .set("Authorization", `Bearer ${authToken}`)
        .send(setData)

      // 4. 데이터 일관성 확인
      expect(planResponse.body.data.userId).toBe(testUser.id)
      expect(sessionResponse.body.data.userId).toBe(testUser.id)
      expect(sessionResponse.body.data.planId).toBe(planId)
      expect(setResponse.body.data.sessionId).toBe(sessionId)
      expect(setResponse.body.data.machineId).toBe(testMachine.id)

      // 5. 대시보드에서 데이터 확인
      const dashboardResponse = await request(app)
        .get("/api/workout-journal/dashboard")
        .set("Authorization", `Bearer ${authToken}`)

      expect(dashboardResponse.body.data.summary.totalPlans).toBeGreaterThan(0)
      expect(dashboardResponse.body.data.summary.totalSessions).toBeGreaterThan(
        0
      )
    })
  })
})
