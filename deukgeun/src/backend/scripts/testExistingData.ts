import { AppDataSource } from "../config/database"
import { User } from "../entities/User"
import { Machine } from "../entities/Machine"
import { WorkoutGoal } from "../entities/WorkoutGoal"
import { WorkoutSession } from "../entities/WorkoutSession"
import { Post } from "../entities/Post"
import { UserLevel } from "../entities/UserLevel"
import axios from "axios"

const BASE_URL = "http://localhost:5000/api"

async function testExistingData() {
  console.log("🧪 기존 데이터 정상 동작 확인 시작...\n")

  try {
    // 데이터베이스 연결
    await AppDataSource.initialize()
    console.log("✅ 데이터베이스 연결 성공")

    // 1. 사용자 데이터 확인
    console.log("1️⃣ 사용자 데이터 확인")
    await testUserData()

    // 2. 머신 데이터 확인
    console.log("\n2️⃣ 머신 데이터 확인")
    await testMachineData()

    // 3. 운동 목표 데이터 확인
    console.log("\n3️⃣ 운동 목표 데이터 확인")
    await testWorkoutGoalData()

    // 4. 운동 세션 데이터 확인
    console.log("\n4️⃣ 운동 세션 데이터 확인")
    await testWorkoutSessionData()

    // 5. 커뮤니티 데이터 확인
    console.log("\n5️⃣ 커뮤니티 데이터 확인")
    await testCommunityData()

    // 6. 레벨 시스템 데이터 확인
    console.log("\n6️⃣ 레벨 시스템 데이터 확인")
    await testLevelSystemData()

    // 7. API 엔드포인트 테스트
    console.log("\n7️⃣ API 엔드포인트 테스트")
    await testAPIEndpoints()

    console.log("\n🎉 기존 데이터 정상 동작 확인 완료!")
  } catch (error) {
    console.error("❌ 기존 데이터 확인 실패:", error)
    throw error
  } finally {
    // 데이터베이스 연결 종료
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
    }
  }
}

async function testUserData() {
  const userRepository = AppDataSource.getRepository(User)
  const users = await userRepository.find({ take: 5 })

  console.log(`   📊 총 사용자 수: ${await userRepository.count()}`)
  if (users.length > 0) {
    const sampleUser = users[0]
    console.log(`   👤 샘플 사용자: ${sampleUser.nickname || sampleUser.email}`)
    console.log(`   📧 이메일: ${sampleUser.email}`)
    console.log(`   📅 가입일: ${sampleUser.createdAt}`)
  }
}

async function testMachineData() {
  const machineRepository = AppDataSource.getRepository(Machine)
  const machines = await machineRepository.find({ take: 5 })

  console.log(`   📊 총 머신 수: ${await machineRepository.count()}`)
  if (machines.length > 0) {
    const sampleMachine = machines[0]
    console.log(`   🏋️ 샘플 머신: ${sampleMachine.name}`)
    console.log(`   🏷️ 카테고리: ${sampleMachine.category}`)
    console.log(`   📝 설명: ${sampleMachine.shortDesc}`)
  }
}

async function testWorkoutGoalData() {
  const goalRepository = AppDataSource.getRepository(WorkoutGoal)
  const goals = await goalRepository.find({ take: 5 })

  console.log(`   📊 총 목표 수: ${await goalRepository.count()}`)
  if (goals.length > 0) {
    const sampleGoal = goals[0]
    console.log(`   🎯 샘플 목표: ${sampleGoal.title}`)
    console.log(`   📅 마감일: ${sampleGoal.deadline || "설정 안됨"}`)
    console.log(
      `   📊 진행률: ${sampleGoal.currentValue}/${sampleGoal.targetValue} ${sampleGoal.unit}`
    )
  }
}

async function testWorkoutSessionData() {
  const sessionRepository = AppDataSource.getRepository(WorkoutSession)
  const sessions = await sessionRepository.find({ take: 5 })

  console.log(`   📊 총 세션 수: ${await sessionRepository.count()}`)
  if (sessions.length > 0) {
    const sampleSession = sessions[0]
    console.log(`   🏃 샘플 세션: ${sampleSession.session_name || "이름 없음"}`)
    console.log(`   ⏰ 시작 시간: ${sampleSession.start_time}`)
    console.log(`   ⏱️ 총 시간: ${sampleSession.total_duration_minutes || 0}분`)
    console.log(`   📊 상태: ${sampleSession.status}`)
  }
}

async function testCommunityData() {
  const postRepository = AppDataSource.getRepository(Post)
  const posts = await postRepository.find({ take: 5 })

  console.log(`   📊 총 포스트 수: ${await postRepository.count()}`)
  if (posts.length > 0) {
    const samplePost = posts[0]
    console.log(`   📝 샘플 포스트: ${samplePost.title}`)
    console.log(`   👤 작성자: ${samplePost.author}`)
    console.log(`   🏷️ 카테고리: ${samplePost.category}`)
    console.log(`   👍 좋아요: ${samplePost.like_count}`)
    console.log(`   💬 댓글: ${samplePost.comment_count}`)
  }
}

async function testLevelSystemData() {
  const levelRepository = AppDataSource.getRepository(UserLevel)
  const levels = await levelRepository.find({ take: 5 })

  console.log(`   📊 총 레벨 데이터 수: ${await levelRepository.count()}`)
  if (levels.length > 0) {
    const sampleLevel = levels[0]
    console.log(`   👤 사용자 ID: ${sampleLevel.userId}`)
    console.log(`   📊 현재 레벨: ${sampleLevel.level}`)
    console.log(`   ⭐ 경험치: ${sampleLevel.currentExp}`)
    console.log(`   🎯 총 경험치: ${sampleLevel.totalExp}`)
  }
}

async function testAPIEndpoints() {
  try {
    // 머신 API 테스트
    const machineResponse = await axios.get(`${BASE_URL}/machines`)
    console.log(
      `   🏋️ 머신 API: ${machineResponse.status} (${machineResponse.data.length}개 머신)`
    )

    // 사용자 API 테스트
    const userResponse = await axios.get(`${BASE_URL}/users`)
    console.log(
      `   👤 사용자 API: ${userResponse.status} (${userResponse.data.length}명 사용자)`
    )

    // 포스트 API 테스트
    const postResponse = await axios.get(`${BASE_URL}/posts`)
    console.log(
      `   📝 포스트 API: ${postResponse.status} (${postResponse.data.length}개 포스트)`
    )

    // 레벨 API 테스트
    const levelResponse = await axios.get(`${BASE_URL}/levels`)
    console.log(`   📊 레벨 API: ${levelResponse.status}`)
  } catch (error) {
    console.log(`   ⚠️ API 테스트 실패: ${error.message}`)
  }
}

// 스크립트 실행
if (require.main === module) {
  testExistingData()
    .then(() => {
      console.log("✅ 기존 데이터 확인 완료")
      process.exit(0)
    })
    .catch(error => {
      console.error("❌ 기존 데이터 확인 실패:", error)
      process.exit(1)
    })
}
