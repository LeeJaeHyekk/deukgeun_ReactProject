import { AppDataSource } from "../config/database"
import { User } from "../entities/User"
import { accountRecoveryService } from "../services/accountRecoveryService"

async function testAccountRecovery() {
  try {
    // 데이터베이스 연결
    await AppDataSource.initialize()
    console.log("✅ Database connected")

    // 테스트 사용자 생성
    const userRepo = AppDataSource.getRepository(User)

    // 기존 테스트 사용자 삭제
    await userRepo.delete({ email: "test@example.com" })

    // 새 테스트 사용자 생성
    const testUser = userRepo.create({
      email: "test@example.com",
      password: "hashedpassword",
      nickname: "테스트사용자",
      phone: "010-1234-5678",
      gender: "male",
      birthday: new Date("1990-01-01"),
    })

    await userRepo.save(testUser)
    console.log("✅ Test user created:", testUser.email)

    // 보안 정보
    const securityInfo = {
      ipAddress: "127.0.0.1",
      userAgent: "test-agent",
      timestamp: new Date(),
    }

    // 아이디 찾기 테스트
    console.log("\n🧪 Testing Find ID Simple...")
    const findIdResult = await accountRecoveryService.findIdSimple(
      "테스트사용자",
      "010-1234-5678",
      securityInfo,
      "male",
      "1990-01-01"
    )
    console.log("Find ID Result:", findIdResult)

    // 비밀번호 재설정 테스트
    console.log("\n🧪 Testing Reset Password Simple...")
    const resetPasswordResult =
      await accountRecoveryService.resetPasswordSimpleStep1(
        "test@example.com",
        "테스트사용자",
        "010-1234-5678",
        securityInfo,
        "1990-01-01"
      )
    console.log("Reset Password Result:", resetPasswordResult)

    // 테스트 사용자 삭제
    await userRepo.delete({ email: "test@example.com" })
    console.log("✅ Test user cleaned up")
  } catch (error) {
    console.error("❌ Test failed:", error)
  } finally {
    await AppDataSource.destroy()
    console.log("✅ Database disconnected")
  }
}

// 스크립트 실행
if (require.main === module) {
  testAccountRecovery()
}
