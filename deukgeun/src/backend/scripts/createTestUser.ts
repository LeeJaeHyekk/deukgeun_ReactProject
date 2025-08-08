import { connectDatabase } from "../config/database"
import { User } from "../entities/User"
import bcrypt from "bcrypt"

async function createTestUser() {
  try {
    const connection = await connectDatabase()
    const userRepository = connection.getRepository(User)

    // 기존 테스트 사용자 확인
    const existingUser = await userRepository.findOne({
      where: { email: "test@test.com" },
    })

    if (existingUser) {
      console.log("테스트 사용자가 이미 존재합니다:", existingUser.email)
      return
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash("12345678", 12)

    // 새 테스트 사용자 생성
    const testUser = userRepository.create({
      email: "test@test.com",
      password: hashedPassword,
      nickname: "테스트 사용자",
    })

    await userRepository.save(testUser)

    console.log("테스트 사용자 생성 완료:")
    console.log("- 이메일: test@test.com")
    console.log("- 비밀번호: 12345678")
    console.log("- 닉네임: 테스트 사용자")

    await connection.close()
  } catch (error) {
    console.error("테스트 사용자 생성 중 오류:", error)
  }
}

// 스크립트 실행
createTestUser()
