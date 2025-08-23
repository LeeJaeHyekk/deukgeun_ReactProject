import request from "supertest"
import { createApp } from "../../../backend/app"
import { getConnection } from "typeorm"
import { User } from "../../../backend/entities/User"

const app = createApp()

describe("Auth Integration Tests", () => {
  beforeAll(async () => {
    // 테스트 데이터베이스 연결 확인
    const connection = getConnection()
    if (!connection.isConnected) {
      await connection.connect()
    }
  })

  afterAll(async () => {
    // 테스트 후 연결 정리
    const connection = getConnection()
    if (connection.isConnected) {
      await connection.close()
    }
  })

  beforeEach(async () => {
    // 각 테스트 전에 사용자 테이블 정리
    const connection = getConnection()
    await connection.getRepository(User).clear()
  })

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
        nickname: "TestUser",
        birthDate: "1990-01-01",
        gender: "male",
        phoneNumber: "010-1234-5678",
      }

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(201)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty("id")
      expect(response.body.data.email).toBe(userData.email)
      expect(response.body.data.nickname).toBe(userData.nickname)
      expect(response.body.data).not.toHaveProperty("password")
    })

    it("should return error for duplicate email", async () => {
      const userData = {
        email: "duplicate@example.com",
        password: "password123",
        nickname: "TestUser",
      }

      // 첫 번째 사용자 등록
      await request(app).post("/api/auth/register").send(userData).expect(201)

      // 중복 이메일로 두 번째 사용자 등록 시도
      const response = await request(app)
        .post("/api/auth/register")
        .send(userData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain("이미 존재하는 이메일")
    })

    it("should validate required fields", async () => {
      const invalidData = {
        email: "invalid-email",
        password: "123", // 너무 짧음
      }

      const response = await request(app)
        .post("/api/auth/register")
        .send(invalidData)
        .expect(400)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain("유효하지 않은 이메일")
    })
  })

  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // 테스트용 사용자 생성
      const userData = {
        email: "login@example.com",
        password: "password123",
        nickname: "LoginUser",
      }

      await request(app).post("/api/auth/register").send(userData)
    })

    it("should login successfully with valid credentials", async () => {
      const loginData = {
        email: "login@example.com",
        password: "password123",
      }

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty("accessToken")
      expect(response.body.data).toHaveProperty("refreshToken")
      expect(response.body.data.user.email).toBe(loginData.email)
    })

    it("should return error for invalid credentials", async () => {
      const loginData = {
        email: "login@example.com",
        password: "wrongpassword",
      }

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain("잘못된 이메일 또는 비밀번호")
    })

    it("should return error for non-existent user", async () => {
      const loginData = {
        email: "nonexistent@example.com",
        password: "password123",
      }

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData)
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain("잘못된 이메일 또는 비밀번호")
    })
  })

  describe("POST /api/auth/refresh", () => {
    let refreshToken: string

    beforeEach(async () => {
      // 테스트용 사용자 생성 및 로그인
      const userData = {
        email: "refresh@example.com",
        password: "password123",
        nickname: "RefreshUser",
      }

      await request(app).post("/api/auth/register").send(userData)

      const loginResponse = await request(app).post("/api/auth/login").send({
        email: "refresh@example.com",
        password: "password123",
      })

      refreshToken = loginResponse.body.data.refreshToken
    })

    it("should refresh access token successfully", async () => {
      const response = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken })
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.data).toHaveProperty("accessToken")
      expect(response.body.data).toHaveProperty("refreshToken")
    })

    it("should return error for invalid refresh token", async () => {
      const response = await request(app)
        .post("/api/auth/refresh")
        .send({ refreshToken: "invalid-token" })
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain("유효하지 않은 토큰")
    })
  })

  describe("POST /api/auth/logout", () => {
    let accessToken: string

    beforeEach(async () => {
      // 테스트용 사용자 생성 및 로그인
      const userData = {
        email: "logout@example.com",
        password: "password123",
        nickname: "LogoutUser",
      }

      await request(app).post("/api/auth/register").send(userData)

      const loginResponse = await request(app).post("/api/auth/login").send({
        email: "logout@example.com",
        password: "password123",
      })

      accessToken = loginResponse.body.data.accessToken
    })

    it("should logout successfully", async () => {
      const response = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${accessToken}`)
        .expect(200)

      expect(response.body.success).toBe(true)
      expect(response.body.message).toContain("로그아웃되었습니다")
    })

    it("should return error for invalid token", async () => {
      const response = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", "Bearer invalid-token")
        .expect(401)

      expect(response.body.success).toBe(false)
      expect(response.body.message).toContain("유효하지 않은 토큰")
    })
  })
})
