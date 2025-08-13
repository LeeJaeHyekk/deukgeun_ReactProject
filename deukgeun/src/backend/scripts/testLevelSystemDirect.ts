import { AppDataSource } from "../config/database"
import { UserLevel } from "../entities/UserLevel"
import { ExpHistory } from "../entities/ExpHistory"
import { User } from "../entities/User"
import { LevelService } from "../services/levelService"
import bcrypt from "bcrypt"

let testUserId: number

// 테스트용 사용자 생성 및 비밀번호 업데이트
async function setupTestUser() {
  try {
    const userRepo = AppDataSource.getRepository(User)

    // 기존 테스트 사용자 확인
    let testUser = await userRepo.findOne({
      where: { email: "leveltest@example.com" },
    })

    if (!testUser) {
      testUser = userRepo.create({
        email: "leveltest@example.com",
        password: await bcrypt.hash("TestPassword123!", 10),
        nickname: "레벨테스트",
        phone: "010-1234-5678",
        birthday: new Date("1990-01-01"),
        gender: "male",
        role: "user",
      })
      await userRepo.save(testUser)
      console.log("✅ 테스트 사용자 생성 완료:", testUser.id)
    } else {
      // 비밀번호 업데이트
      testUser.password = await bcrypt.hash("TestPassword123!", 10)
      await userRepo.save(testUser)
      console.log("✅ 기존 테스트 사용자 비밀번호 업데이트:", testUser.id)
    }

    testUserId = testUser.id
    return testUser
  } catch (error) {
    console.error("❌ 테스트 사용자 설정 실패:", error)
    throw error
  }
}

// 레벨 서비스 직접 테스트
async function testLevelService() {
  try {
    const levelService = new LevelService()

    console.log("\n🎯 레벨 서비스 직접 테스트...")

    // 1. 사용자 레벨 정보 조회
    console.log("\n1️⃣ 사용자 레벨 정보 조회")
    const userLevel = await levelService.getUserLevel(testUserId)
    console.log("  - 사용자 레벨:", userLevel)

    // 2. 레벨 진행률 조회
    console.log("\n2️⃣ 레벨 진행률 조회")
    const progress = await levelService.getLevelProgress(testUserId)
    console.log("  - 진행률:", progress)

    // 3. 경험치 부여 테스트
    console.log("\n3️⃣ 경험치 부여 테스트")

    // 게시글 작성
    const postResult = await levelService.grantExp(
      testUserId,
      "post",
      "post_creation",
      {
        postId: 1,
        title: "테스트 게시글",
      }
    )
    console.log("  - 게시글 작성:", postResult)

    // 댓글 작성
    const commentResult = await levelService.grantExp(
      testUserId,
      "comment",
      "comment_creation",
      {
        commentId: 1,
        content: "테스트 댓글입니다.",
      }
    )
    console.log("  - 댓글 작성:", commentResult)

    // 좋아요
    const likeResult = await levelService.grantExp(
      testUserId,
      "like",
      "post_like",
      {
        postId: 1,
      }
    )
    console.log("  - 좋아요:", likeResult)

    // 운동 로그
    const workoutResult = await levelService.grantExp(
      testUserId,
      "workout",
      "workout_log",
      {
        workoutId: 1,
        duration: 60,
      }
    )
    console.log("  - 운동 로그:", workoutResult)

    // 헬스장 방문
    const gymResult = await levelService.grantExp(
      testUserId,
      "gym_visit",
      "gym_visit",
      {
        gymId: 1,
        gymName: "테스트 헬스장",
      }
    )
    console.log("  - 헬스장 방문:", gymResult)

    // 4. 최종 상태 확인
    console.log("\n4️⃣ 최종 상태 확인")
    const finalLevel = await levelService.getUserLevel(testUserId)
    const finalProgress = await levelService.getLevelProgress(testUserId)
    console.log("  - 최종 레벨:", finalLevel)
    console.log("  - 최종 진행률:", finalProgress)

    return { userLevel, progress, finalLevel, finalProgress }
  } catch (error) {
    console.error("❌ 레벨 서비스 테스트 실패:", error)
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
      take: 10,
    })

    console.log("\n🔍 데이터베이스 상태 검증:")
    console.log("  - 사용자 레벨 정보:", userLevel)
    console.log("  - 경험치 히스토리:")
    expHistory.forEach((history, index) => {
      console.log(
        `    ${index + 1}. ${history.actionType}/${history.source}: +${history.expGained} EXP (${history.createdAt})`
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
  console.log("\n🎯 레벨업 시나리오 테스트...")

  try {
    const levelService = new LevelService()

    // 초기 상태 확인
    const initialLevel = await levelService.getUserLevel(testUserId)
    console.log("  - 초기 레벨:", initialLevel?.level || 1)

    // 레벨업을 위한 경험치 계산 (수동으로 계산)
    const currentLevel = initialLevel?.level || 1
    const requiredExp = Math.floor(100 * Math.pow(1.5, currentLevel - 1))
    console.log("  - 레벨업 필요 경험치:", requiredExp)

    // 충분한 경험치를 부여하여 레벨업 테스트
    const expNeeded = requiredExp - (initialLevel?.currentExp || 0) + 10
    console.log("  - 추가 필요 경험치:", expNeeded)

    // 게시글 작성으로 경험치 획득 (20 EXP씩)
    const postsNeeded = Math.ceil(expNeeded / 20)
    console.log("  - 필요한 게시글 수:", postsNeeded)

    for (let i = 0; i < postsNeeded; i++) {
      const result = await levelService.grantExp(
        testUserId,
        "post",
        "post_creation",
        {
          postId: i + 100,
          title: `레벨업 테스트 게시글 ${i + 1}`,
        }
      )

      if (result.leveledUp) {
        console.log(`  - 레벨업 성공! 레벨 ${result.level} 달성`)
        break
      }
    }

    // 최종 상태 확인
    const finalLevel = await levelService.getUserLevel(testUserId)
    console.log("  - 최종 레벨:", finalLevel?.level || 1)
    console.log("  - 총 경험치:", finalLevel?.totalExp || 0)
  } catch (error) {
    console.error("❌ 레벨업 시나리오 테스트 실패:", error)
  }
}

// 경험치 계산 테스트
async function testExpCalculation() {
  console.log("\n🧮 경험치 계산 테스트...")

  try {
    const levelService = new LevelService()

    // 각 액션별 경험치 확인
    const actions = [
      { action: "post", reason: "post_creation", expected: 20 },
      { action: "comment", reason: "comment_creation", expected: 5 },
      { action: "like", reason: "post_like", expected: 2 },
      { action: "workout", reason: "workout_log", expected: 15 },
      { action: "gym_visit", reason: "gym_visit", expected: 25 },
    ]

    for (const { action, reason, expected } of actions) {
      const result = await levelService.grantExp(testUserId, action, reason, {
        test: true,
      })

      console.log(
        `  - ${action}/${reason}: ${result.expGained} EXP (예상: ${expected})`
      )

      if (result.expGained !== expected) {
        console.log(`    ⚠️ 경험치 불일치!`)
      }
    }
  } catch (error) {
    console.error("❌ 경험치 계산 테스트 실패:", error)
  }
}

// 쿨다운 시스템 테스트
async function testCooldownSystem() {
  console.log("\n⏰ 쿨다운 시스템 테스트...")

  try {
    const levelService = new LevelService()

    // 첫 번째 좋아요 (성공해야 함)
    console.log("  - 첫 번째 좋아요 시도...")
    const firstLike = await levelService.grantExp(
      testUserId,
      "like",
      "post_like",
      { postId: 1 }
    )
    console.log(
      `    결과: ${firstLike.success ? "성공" : "실패"} (${firstLike.expGained} EXP)`
    )

    // 두 번째 좋아요 (쿨다운으로 실패해야 함)
    console.log("  - 두 번째 좋아요 시도 (쿨다운 테스트)...")
    const secondLike = await levelService.grantExp(
      testUserId,
      "like",
      "post_like",
      { postId: 2 }
    )
    console.log(`    결과: ${secondLike.success ? "성공" : "실패"}`)
    if (!secondLike.success && secondLike.cooldownInfo?.isOnCooldown) {
      console.log(
        `    쿨다운 정보: ${Math.ceil(secondLike.cooldownInfo.remainingTime / 1000)}초 남음`
      )
    }
  } catch (error) {
    console.error("❌ 쿨다운 시스템 테스트 실패:", error)
  }
}

// 보상 시스템 테스트
async function testRewardSystem() {
  console.log("\n🎁 보상 시스템 테스트...")

  try {
    const levelService = new LevelService()

    // 레벨업을 위한 충분한 경험치 부여
    console.log("  - 레벨업을 위한 경험치 부여...")
    const currentLevel = await levelService.getUserLevel(testUserId)
    const requiredExp = Math.floor(
      100 * Math.pow(1.5, (currentLevel?.level || 1) - 1)
    )
    const neededExp = requiredExp - (currentLevel?.currentExp || 0) + 10

    // 게시글 작성으로 경험치 획득
    const postsNeeded = Math.ceil(neededExp / 20)
    for (let i = 0; i < postsNeeded; i++) {
      const result = await levelService.grantExp(
        testUserId,
        "post",
        "post_creation",
        {
          postId: i + 200,
          title: `보상 테스트 게시글 ${i + 1}`,
        }
      )

      if (result.leveledUp && result.rewards) {
        console.log(`    레벨업 성공! 레벨 ${result.level} 달성`)
        console.log(`    획득한 보상: ${result.rewards.length}개`)
        result.rewards.forEach((reward, index) => {
          console.log(
            `      ${index + 1}. ${reward.rewardType}: ${reward.metadata?.name || "알 수 없는 보상"}`
          )
        })
        break
      }
    }
  } catch (error) {
    console.error("❌ 보상 시스템 테스트 실패:", error)
  }
}

// 일일 경험치 한도 테스트
async function testDailyExpLimit() {
  console.log("\n📊 일일 경험치 한도 테스트...")

  try {
    const levelService = new LevelService()

    // 현재 일일 경험치 확인
    const currentLevel = await levelService.getUserLevel(testUserId)
    console.log(`  - 현재 총 경험치: ${currentLevel?.totalExp || 0}`)

    // 한도에 도달할 때까지 경험치 부여
    let attempts = 0
    const maxAttempts = 50 // 무한 루프 방지

    while (attempts < maxAttempts) {
      const result = await levelService.grantExp(
        testUserId,
        "like",
        "post_like",
        {
          postId: attempts + 300,
        }
      )

      if (!result.success) {
        if (result.dailyLimitInfo && !result.dailyLimitInfo.withinLimit) {
          console.log(`    일일 한도 도달!`)
          console.log(
            `    오늘 획득한 경험치: ${result.dailyLimitInfo.dailyExp}/${result.dailyLimitInfo.limit}`
          )
          break
        } else if (result.cooldownInfo?.isOnCooldown) {
          console.log(`    쿨다운으로 인한 실패`)
          break
        }
      }

      attempts++
    }
  } catch (error) {
    console.error("❌ 일일 경험치 한도 테스트 실패:", error)
  }
}

// 메인 테스트 함수
async function runDirectLevelTests() {
  console.log("🚀 레벨링 시스템 직접 테스트 시작...\n")

  try {
    // 1. 데이터베이스 연결
    await AppDataSource.initialize()
    console.log("✅ 데이터베이스 연결 성공\n")

    // 2. 테스트 사용자 설정
    await setupTestUser()
    console.log()

    // 3. 레벨 서비스 테스트
    await testLevelService()
    console.log()

    // 4. 데이터베이스 검증
    await verifyDatabaseState()
    console.log()

    // 5. 경험치 계산 테스트
    await testExpCalculation()
    console.log()

    // 6. 레벨업 시나리오 테스트
    await testLevelUpScenario()
    console.log()

    // 7. 쿨다운 시스템 테스트
    await testCooldownSystem()
    console.log()

    // 8. 보상 시스템 테스트
    await testRewardSystem()
    console.log()

    // 9. 일일 경험치 한도 테스트
    await testDailyExpLimit()
    console.log()

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
runDirectLevelTests()
