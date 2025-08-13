import axios from "axios"
import { AppDataSource } from "../config/database"
import { UserLevel } from "../entities/UserLevel"
import { ExpHistory } from "../entities/ExpHistory"
import { User } from "../entities/User"
import { LevelService } from "../services/levelService"

const BASE_URL = "http://localhost:5000"
let testUserId: number
let authToken: string

// 테스트용 사용자 생성
async function createTestUser() {
  try {
    const userRepo = AppDataSource.getRepository(User)

    // 기존 테스트 사용자 확인
    let testUser = await userRepo.findOne({
      where: { email: "leveltest@example.com" },
    })

    if (!testUser) {
      testUser = userRepo.create({
        email: "leveltest@example.com",
        password: "TestPassword123!",
        nickname: "레벨테스트",
        phone: "010-1234-5678",
        birthday: new Date("1990-01-01"),
        gender: "male",
        role: "user",
      })
      await userRepo.save(testUser)
      console.log("✅ 테스트 사용자 생성 완료:", testUser.id)
    } else {
      console.log("✅ 기존 테스트 사용자 사용:", testUser.id)
    }

    testUserId = testUser.id
    return testUser
  } catch (error) {
    console.error("❌ 테스트 사용자 생성 실패:", error)
    throw error
  }
}

// 로그인하여 토큰 획득
async function loginAndGetToken() {
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: "leveltest@example.com",
      password: "TestPassword123!",
      recaptchaToken: "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI", // 테스트용 더미 토큰
    })

    authToken = response.data.accessToken
    console.log("✅ 로그인 성공, 토큰 획득")
    return authToken
  } catch (error) {
    console.error("❌ 로그인 실패:", error.response?.data || error.message)
    throw error
  }
}

// 레벨 정보 조회 테스트
async function testGetUserLevel() {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/level/user/${testUserId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    )

    console.log("✅ 레벨 정보 조회 성공:")
    console.log("  - 사용자 레벨:", response.data.data.userLevel)
    console.log("  - 진행률:", response.data.data.progress)

    return response.data.data
  } catch (error) {
    console.error(
      "❌ 레벨 정보 조회 실패:",
      error.response?.data || error.message
    )
    throw error
  }
}

// 경험치 부여 테스트
async function testGrantExp(action: string, reason: string, data?: any) {
  try {
    const response = await axios.post(
      `${BASE_URL}/api/level/exp/grant`,
      {
        userId: testUserId,
        action,
        reason,
        data,
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    )

    const result = response.data.data
    console.log(`✅ 경험치 부여 성공 (${action}/${reason}):`)
    console.log(`  - 획득 경험치: ${result.expGained}`)
    console.log(`  - 현재 레벨: ${result.level}`)
    console.log(`  - 현재 경험치: ${result.currentExp}`)
    console.log(`  - 레벨업: ${result.leveledUp ? "예" : "아니오"}`)

    return result
  } catch (error) {
    console.error(
      `❌ 경험치 부여 실패 (${action}/${reason}):`,
      error.response?.data || error.message
    )
    throw error
  }
}

// 쿨다운 테스트
async function testCooldown(action: string) {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/level/cooldown/${action}/${testUserId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    )

    const result = response.data.data
    console.log(`✅ 쿨다운 확인 (${action}):`)
    console.log(`  - 쿨다운 중: ${result.isOnCooldown}`)
    if (result.isOnCooldown) {
      console.log(`  - 남은 시간: ${result.remainingTime}ms`)
    }

    return result
  } catch (error) {
    console.error(
      `❌ 쿨다운 확인 실패 (${action}):`,
      error.response?.data || error.message
    )
    throw error
  }
}

// 리더보드 테스트
async function testLeaderboard() {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/level/leaderboard/global?page=1&limit=10`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    )

    console.log("✅ 전체 리더보드 조회 성공:")
    console.log(`  - 총 사용자 수: ${response.data.data.total}`)
    console.log(`  - 현재 페이지: ${response.data.data.page}`)
    console.log(`  - 상위 3명:`)
    response.data.data.leaderboard
      .slice(0, 3)
      .forEach((user: any, index: number) => {
        console.log(
          `    ${index + 1}. ${user.name} (레벨 ${user.level}, 경험치 ${user.totalExp})`
        )
      })

    return response.data.data
  } catch (error) {
    console.error(
      "❌ 리더보드 조회 실패:",
      error.response?.data || error.message
    )
    throw error
  }
}

// 보상 시스템 테스트
async function testRewards() {
  try {
    const response = await axios.get(
      `${BASE_URL}/api/level/user/${testUserId}/rewards`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    )

    console.log("✅ 보상 목록 조회 성공:")
    console.log(`  - 획득한 보상 수: ${response.data.data.length}`)
    response.data.data.forEach((reward: any) => {
      console.log(`    - ${reward.name}: ${reward.description}`)
    })

    return response.data.data
  } catch (error) {
    console.error(
      "❌ 보상 목록 조회 실패:",
      error.response?.data || error.message
    )
    throw error
  }
}

// 데이터베이스 직접 검증
async function verifyDatabaseState() {
  try {
    const userLevelRepo = AppDataSource.getRepository(UserLevel)
    const expHistoryRepo = AppDataSource.getRepository(ExpHistory)

    const userLevel = await userLevelRepo.findOne({
      where: { userId: testUserId },
    })
    const expHistory = await expHistoryRepo.find({
      where: { userId: testUserId },
      order: { createdAt: "DESC" },
      take: 5,
    })

    console.log("✅ 데이터베이스 상태 검증:")
    console.log("  - 사용자 레벨 정보:", userLevel)
    console.log("  - 최근 경험치 히스토리:")
    expHistory.forEach((history, index) => {
      console.log(
        `    ${index + 1}. ${history.actionType}/${history.source}: +${history.expGained} EXP`
      )
    })

    return { userLevel, expHistory }
  } catch (error) {
    console.error("❌ 데이터베이스 검증 실패:", error)
    throw error
  }
}

// 레벨업 시나리오 테스트
async function testLevelUpScenario() {
  console.log("\n🎯 레벨업 시나리오 테스트 시작...")

  try {
    // 초기 상태 확인
    const initialLevel = await testGetUserLevel()

    // 게시글 작성으로 경험치 획득
    await testGrantExp("post", "post_creation", {
      postId: 1,
      title: "테스트 게시글",
    })

    // 댓글 작성으로 경험치 획득
    await testGrantExp("comment", "comment_creation", {
      commentId: 1,
      content: "테스트 댓글입니다.",
    })

    // 좋아요로 경험치 획득
    await testGrantExp("like", "post_like", {
      postId: 1,
    })

    // 운동 로그로 경험치 획득
    await testGrantExp("workout", "workout_log", {
      workoutId: 1,
      duration: 60,
    })

    // 헬스장 방문으로 경험치 획득
    await testGrantExp("gym_visit", "gym_visit", {
      gymId: 1,
      gymName: "테스트 헬스장",
    })

    // 최종 상태 확인
    const finalLevel = await testGetUserLevel()

    console.log("\n📊 레벨업 시나리오 결과:")
    console.log(`  - 초기 레벨: ${initialLevel.userLevel?.level || 1}`)
    console.log(`  - 최종 레벨: ${finalLevel.userLevel?.level || 1}`)
    console.log(`  - 총 경험치: ${finalLevel.userLevel?.totalExp || 0}`)
  } catch (error) {
    console.error("❌ 레벨업 시나리오 테스트 실패:", error)
  }
}

// 쿨다운 시나리오 테스트
async function testCooldownScenario() {
  console.log("\n⏰ 쿨다운 시나리오 테스트 시작...")

  try {
    // 첫 번째 게시글 작성
    await testGrantExp("post", "post_creation", {
      postId: 2,
      title: "쿨다운 테스트 게시글 1",
    })

    // 쿨다운 상태 확인
    await testCooldown("post")

    // 두 번째 게시글 작성 시도 (쿨다운으로 실패해야 함)
    try {
      await testGrantExp("post", "post_creation", {
        postId: 3,
        title: "쿨다운 테스트 게시글 2",
      })
      console.log("⚠️  쿨다운이 제대로 작동하지 않음")
    } catch (error) {
      console.log("✅ 쿨다운이 정상적으로 작동함")
    }
  } catch (error) {
    console.error("❌ 쿨다운 시나리오 테스트 실패:", error)
  }
}

// 메인 테스트 함수
async function runLevelSystemTests() {
  console.log("🚀 레벨링 시스템 종합 테스트 시작...\n")

  try {
    // 1. 데이터베이스 연결
    await AppDataSource.initialize()
    console.log("✅ 데이터베이스 연결 성공\n")

    // 2. 테스트 사용자 생성
    await createTestUser()
    console.log()

    // 3. 로그인
    await loginAndGetToken()
    console.log()

    // 4. 기본 기능 테스트
    console.log("📋 기본 기능 테스트...")
    await testGetUserLevel()
    console.log()

    // 5. 경험치 부여 테스트
    console.log("🎁 경험치 부여 테스트...")
    await testGrantExp("post", "post_creation", { postId: 1, title: "테스트" })
    await testGrantExp("comment", "comment_creation", {
      commentId: 1,
      content: "테스트",
    })
    await testGrantExp("like", "post_like", { postId: 1 })
    console.log()

    // 6. 쿨다운 테스트
    console.log("⏰ 쿨다운 테스트...")
    await testCooldown("post")
    await testCooldown("comment")
    await testCooldown("like")
    console.log()

    // 7. 리더보드 테스트
    console.log("🏆 리더보드 테스트...")
    await testLeaderboard()
    console.log()

    // 8. 보상 시스템 테스트
    console.log("🎖️ 보상 시스템 테스트...")
    await testRewards()
    console.log()

    // 9. 데이터베이스 검증
    console.log("🔍 데이터베이스 검증...")
    await verifyDatabaseState()
    console.log()

    // 10. 시나리오 테스트
    await testLevelUpScenario()
    await testCooldownScenario()

    console.log("\n🎉 모든 테스트 완료!")
  } catch (error) {
    console.error("\n💥 테스트 중 오류 발생:", error)
  } finally {
    // 데이터베이스 연결 종료
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
    }
    process.exit(0)
  }
}

// 스크립트 실행
runLevelSystemTests()
