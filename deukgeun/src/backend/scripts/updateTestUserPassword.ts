import { connectDatabase } from "../config/database.js"
import { User } from "../entities/User.js"
import bcrypt from "bcrypt"

async function updateTestUserPassword() {
  try {
    const connection = await connectDatabase()
    const userRepository = connection.getRepository(User)

    // 테스트 사용자 찾기
    const testUser = await userRepository.findOne({
      where: { email: "test@test.com" },
    })

    if (!testUser) {
      console.log("테스트 사용자를 찾을 수 없습니다.")
      return
    }

    console.log("현재 사용자 정보:", {
      id: testUser.id,
      email: testUser.email,
      nickname: testUser.nickname,
      passwordLength: testUser.password.length,
    })

    // 비밀번호가 이미 해시화되어 있는지 확인
    if (testUser.password.length > 20) {
      console.log("비밀번호가 이미 해시화되어 있습니다.")
      return
    }

    // 비밀번호 해시화
    const hashedPassword = await bcrypt.hash("12345678", 12)

    // 비밀번호 업데이트
    testUser.password = hashedPassword
    await userRepository.save(testUser)

    console.log("테스트 사용자 비밀번호 업데이트 완료:")
    console.log("- 이메일: test@test.com")
    console.log("- 새 비밀번호: 12345678 (해시화됨)")

    await connection.close()
  } catch (error) {
    console.error("비밀번호 업데이트 중 오류:", error)
  }
}

// 스크립트 실행
updateTestUserPassword()
