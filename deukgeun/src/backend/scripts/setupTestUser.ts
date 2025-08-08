import { connectDatabase } from "../config/database"
import { User } from "../entities/User"
import { UserLevel } from "../entities/UserLevel"
import { ExpHistory } from "../entities/ExpHistory"
import { UserReward } from "../entities/UserReward"
import { UserStreak } from "../entities/UserStreak"

async function setupTestUser() {
  try {
    console.log("🔧 테스트 사용자 초기값 설정을 시작합니다...")

    const connection = await connectDatabase()
    const userRepo = connection.getRepository(User)
    const userLevelRepo = connection.getRepository(UserLevel)
    const expHistoryRepo = connection.getRepository(ExpHistory)
    const userRewardRepo = connection.getRepository(UserReward)
    const userStreakRepo = connection.getRepository(UserStreak)

    // 테스트 사용자 정보
    const testUserData = {
      email: "test@test.com",
      password: "$2b$12$T7FtGwFkihZhLa6vMR4SVOvtIGUHK6awiN2.yDdghEHo0Rjc9z0h.",
      nickname: "tester",
      role: "user" as const,
    }

    // 기존 테스트 사용자 확인
    let testUser = await userRepo.findOne({
      where: { email: testUserData.email },
    })

    if (!testUser) {
      console.log("📝 테스트 사용자를 생성합니다...")

      // 새 사용자 생성
      testUser = userRepo.create({
        email: testUserData.email,
        password: testUserData.password,
        nickname: testUserData.nickname,
        role: testUserData.role,
      })

      await userRepo.save(testUser)
      console.log("✅ 테스트 사용자 생성 완료")
    } else {
      console.log("ℹ️ 테스트 사용자가 이미 존재합니다. 업데이트합니다...")

      // 기존 사용자 정보 업데이트
      testUser.nickname = testUserData.nickname
      testUser.role = testUserData.role
      await userRepo.save(testUser)
      console.log("✅ 테스트 사용자 정보 업데이트 완료")
    }

    // UserLevel 초기값 설정
    let userLevel = await userLevelRepo.findOne({
      where: { userId: testUser.id },
    })

    if (!userLevel) {
      console.log("📊 사용자 레벨 정보를 생성합니다...")

      userLevel = userLevelRepo.create({
        userId: testUser.id,
        level: 1,
        currentExp: 0,
        totalExp: 0,
        seasonExp: 0,
      })

      await userLevelRepo.save(userLevel)
      console.log("✅ 사용자 레벨 정보 생성 완료")
    }

    // ExpHistory 초기값 설정 (샘플 경험치 기록)
    const existingExpHistory = await expHistoryRepo.count({
      where: { userId: testUser.id },
    })

    if (existingExpHistory === 0) {
      console.log("📈 경험치 히스토리를 생성합니다...")

      const expHistoryEntries = [
        {
          userId: testUser.id,
          actionType: "post_create",
          expGained: 50,
          source: "첫 게시글 작성",
        },
        {
          userId: testUser.id,
          actionType: "comment_create",
          expGained: 20,
          source: "댓글 작성",
        },
        {
          userId: testUser.id,
          actionType: "like_give",
          expGained: 10,
          source: "좋아요 누르기",
        },
      ]

      for (const entry of expHistoryEntries) {
        const expHistory = expHistoryRepo.create(entry)
        await expHistoryRepo.save(expHistory)
      }

      console.log("✅ 경험치 히스토리 생성 완료")
    }

    // UserReward 초기값 설정
    const existingRewards = await userRewardRepo.count({
      where: { userId: testUser.id },
    })

    if (existingRewards === 0) {
      console.log("🏆 사용자 보상을 생성합니다...")

      const rewards = [
        {
          userId: testUser.id,
          rewardId: "first_post",
          rewardName: "첫 게시글",
          rewardType: "badge",
          description: "첫 번째 게시글을 작성했습니다!",
          claimed: true,
          claimedAt: new Date(),
        },
        {
          userId: testUser.id,
          rewardId: "level_1",
          rewardName: "레벨 1 달성",
          rewardType: "achievement",
          description: "레벨 1에 도달했습니다!",
          claimed: true,
          claimedAt: new Date(),
        },
      ]

      for (const reward of rewards) {
        const userReward = userRewardRepo.create(reward)
        await userRewardRepo.save(userReward)
      }

      console.log("✅ 사용자 보상 생성 완료")
    }

    // UserStreak 초기값 설정
    let userStreak = await userStreakRepo.findOne({
      where: { userId: testUser.id },
    })

    if (!userStreak) {
      console.log("🔥 연속 활동 기록을 생성합니다...")

      userStreak = userStreakRepo.create({
        userId: testUser.id,
        currentCount: 3,
        lastActivity: new Date(),
        streakType: "daily_login",
      })

      await userStreakRepo.save(userStreak)
      console.log("✅ 연속 활동 기록 생성 완료")
    }

    console.log("🎉 테스트 사용자 초기값 설정이 완료되었습니다!")
    console.log("📋 설정된 정보:")
    console.log(`   - 사용자 ID: ${testUser.id}`)
    console.log(`   - 이메일: ${testUser.email}`)
    console.log(`   - 닉네임: ${testUser.nickname}`)
    console.log(`   - 레벨: ${userLevel.level}`)
    console.log(`   - 총 경험치: ${userLevel.totalExp}`)
    console.log(`   - 연속 활동: ${userStreak.currentCount}일`)

    await connection.close()
  } catch (error) {
    console.error("❌ 테스트 사용자 초기값 설정 중 오류 발생:", error)
    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  setupTestUser()
}

export { setupTestUser }
