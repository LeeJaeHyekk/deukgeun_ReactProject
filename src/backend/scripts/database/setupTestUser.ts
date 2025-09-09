import { AppDataSource } from "../../shared/database"
import { User } from "../../domains/auth/entities/User"
import { UserLevel } from "../../domains/level/entities/UserLevel"
import { ExpHistory } from "../../domains/level/entities/ExpHistory"
import { UserReward } from "../../domains/level/entities/UserReward"
import { UserStreak } from "../../entities/UserStreak"
import bcrypt from "bcrypt"

async function setupTestUser() {
  try {
    // 데이터베이스 연결
    await AppDataSource.initialize()
    const connection = AppDataSource

    const userRepo = connection.getRepository(User)
    const userLevelRepo = connection.getRepository(UserLevel)
    const expHistoryRepo = connection.getRepository(ExpHistory)
    const userRewardRepo = connection.getRepository(UserReward)
    const userStreakRepo = connection.getRepository(UserStreak)

    // 테스트 사용자 생성
    const hashedPassword = await bcrypt.hash("test1234", 10)

    const testUser = userRepo.create({
      email: "test@example.com",
      password: hashedPassword,
      nickname: "테스트유저",
      phone: "010-1234-5678",
      gender: "male",
      birthday: new Date("1990-01-01"),
      role: "user",
    })

    const savedUser = await userRepo.save(testUser)
    console.log("✅ 테스트 사용자 생성 완료:", savedUser.id)

    // 사용자 레벨 정보 생성
    const userLevel = userLevelRepo.create({
      userId: savedUser.id,
      level: 1,
      currentExp: 0,
      totalExp: 0,
      seasonExp: 0,
    })

    await userLevelRepo.save(userLevel)
    console.log("✅ 사용자 레벨 정보 생성 완료")

    // 초기 경험치 히스토리 생성
    const expHistory = expHistoryRepo.create({
      userId: savedUser.id,
      actionType: "daily_login",
      source: "회원가입",
      expGained: 50,
      metadata: { source: "welcome_bonus" },
    })

    await expHistoryRepo.save(expHistory)
    console.log("✅ 초기 경험치 히스토리 생성 완료")

    // 초기 리워드 생성
    const userReward = userRewardRepo.create({
      userId: savedUser.id,
      rewardType: "badge",
      rewardId: "welcome_badge_001",
      rewardName: "환영 뱃지",
      rewardDescription: "첫 가입을 축하합니다!",
      metadata: {
        name: "환영 뱃지",
        description: "첫 가입을 축하합니다!",
        icon: "🎉",
      },
    })

    await userRewardRepo.save(userReward)
    console.log("✅ 초기 리워드 생성 완료")

    // 사용자 스트릭 정보 생성
    const userStreak = userStreakRepo.create({
      userId: savedUser.id,
      streakType: "daily",
      currentCount: 0,
      lastActivity: new Date(),
    })

    await userStreakRepo.save(userStreak)
    console.log("✅ 사용자 스트릭 정보 생성 완료")

    console.log("🎉 테스트 사용자 설정이 완료되었습니다!")
    console.log("이메일: test@example.com")
    console.log("비밀번호: test1234")
  } catch (error) {
    console.error("❌ 테스트 사용자 설정 실패:", error)
  } finally {
    await AppDataSource.destroy()
  }
}

setupTestUser()
