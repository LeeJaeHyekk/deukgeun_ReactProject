import { AppDataSource } from "../config/database"
import { WorkoutGoal } from "../entities/WorkoutGoal"
import { User } from "../entities/User"
import axios from "axios"

const BASE_URL = "http://localhost:5000/api"

async function testWorkoutGoalFeatures() {
  console.log("🧪 WorkoutGoal 관련 기능 테스트 시작...\n")

  try {
    // 데이터베이스 연결
    await AppDataSource.initialize()
    console.log("✅ 데이터베이스 연결 성공")

    // 1. WorkoutGoal 데이터베이스 테스트
    console.log("1️⃣ WorkoutGoal 데이터베이스 테스트")
    await testWorkoutGoalDatabase()

    // 2. WorkoutGoal API 테스트
    console.log("\n2️⃣ WorkoutGoal API 테스트")
    await testWorkoutGoalAPI()

    // 3. 목표 진행 상황 테스트
    console.log("\n3️⃣ 목표 진행 상황 테스트")
    await testGoalProgress()

    console.log("\n🎉 WorkoutGoal 관련 기능 테스트 완료!")
  } catch (error) {
    console.error("❌ WorkoutGoal 테스트 실패:", error)
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
    }
  }
}

// WorkoutGoal 데이터베이스 테스트
async function testWorkoutGoalDatabase() {
  const workoutGoalRepo = AppDataSource.getRepository(WorkoutGoal)
  const userRepo = AppDataSource.getRepository(User)

  // 기존 목표 데이터 확인
  const existingGoals = await workoutGoalRepo.find()
  console.log(`   - 기존 목표 수: ${existingGoals.length}`)

  // 테스트 사용자 확인
  const testUser = await userRepo.findOne({
    where: { email: "test@example.com" },
  })
  if (!testUser) {
    console.log("   ⚠️ 테스트 사용자가 없습니다. 테스트 사용자를 생성하세요.")
    return
  }

  console.log(`   - 테스트 사용자: ${testUser.nickname} (ID: ${testUser.id})`)

  if (existingGoals.length > 0) {
    const sampleGoal = existingGoals[0]
    console.log(`   - 샘플 목표: ${sampleGoal.title} (${sampleGoal.type})`)

    // 목표 상세 정보 조회
    const goalDetail = await workoutGoalRepo.findOne({
      where: { id: sampleGoal.id },
    })
    console.log(`   - 목표 상세 정보 조회 성공: ${goalDetail?.title}`)
  }

  // 사용자별 목표 조회
  const userGoals = await workoutGoalRepo.find({
    where: { userId: testUser.id },
  })
  console.log(`   - 사용자 목표 조회: ${userGoals.length}개`)

  // 목표 타입별 통계
  const goalTypes = ["weight", "reps", "duration", "frequency", "streak"]
  for (const goalType of goalTypes) {
    const typeGoals = userGoals.filter(g => g.type === goalType)
    console.log(`   - ${goalType} 타입: ${typeGoals.length}개`)
  }
}

// WorkoutGoal API 테스트
async function testWorkoutGoalAPI() {
  try {
    // 전체 목표 목록 조회
    const response = await axios.get(`${BASE_URL}/workout-goals`)
    console.log(`   - API 목표 목록 조회: ${response.data.data?.length || 0}개`)

    // 사용자별 목표 조회
    const userResponse = await axios.get(`${BASE_URL}/workout-goals/user`)
    console.log(
      `   - API 사용자 목표 조회: ${userResponse.data.data?.length || 0}개`
    )

    // 목표 상세 정보 조회 (첫 번째 목표)
    if (response.data.data && response.data.data.length > 0) {
      const firstGoal = response.data.data[0]
      const detailResponse = await axios.get(
        `${BASE_URL}/workout-goals/${firstGoal.id}`
      )
      console.log(`   - API 목표 상세 조회: ${detailResponse.data.data?.title}`)
    }

    console.log("   ✅ WorkoutGoal API 테스트 성공")
  } catch (error: any) {
    console.log(
      `   ⚠️ WorkoutGoal API 테스트 실패: ${error.response?.data?.message || error.message}`
    )
  }
}

// 목표 진행 상황 테스트
async function testGoalProgress() {
  const workoutGoalRepo = AppDataSource.getRepository(WorkoutGoal)
  const goals = await workoutGoalRepo.find({ take: 5 })

  console.log("   - 목표 진행 상황 테스트:")
  for (const goal of goals) {
    const progress = (goal.currentValue / goal.targetValue) * 100
    const status = goal.isCompleted ? "완료" : "진행중"
    console.log(`     ${goal.title}: ${progress.toFixed(1)}% (${status})`)
  }
}

// 스크립트 실행
testWorkoutGoalFeatures()
  .then(() => {
    console.log("✅ WorkoutGoal 테스트 스크립트 완료")
    process.exit(0)
  })
  .catch(error => {
    console.error("❌ WorkoutGoal 테스트 스크립트 실패:", error)
    process.exit(1)
  })
