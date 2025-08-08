import { machineApi } from "@shared/api/machineApi"
import { config } from "@shared/config"

async function testConnection() {
  console.log("🔧 API 연결 테스트를 시작합니다...")
  console.log("📍 API Base URL:", config.API_BASE_URL)

  try {
    // 1. 모든 머신 조회 테스트
    console.log("\n📋 1. 모든 머신 조회 테스트")
    const machinesResponse = await machineApi.getMachines()
    console.log("✅ 모든 머신 조회 성공")
    console.log(`   - 총 머신 수: ${machinesResponse.count}`)
    console.log(
      `   - 첫 번째 머신: ${machinesResponse.machines[0]?.name_ko || "없음"}`
    )

    // 2. 특정 머신 조회 테스트
    if (machinesResponse.machines.length > 0) {
      console.log("\n📋 2. 특정 머신 조회 테스트")
      const firstMachineId = machinesResponse.machines[0].id
      const machineResponse = await machineApi.getMachine(firstMachineId)
      console.log("✅ 특정 머신 조회 성공")
      console.log(`   - 머신 이름: ${machineResponse.machine.name_ko}`)
      console.log(`   - 카테고리: ${machineResponse.machine.category}`)
    }

    // 3. 머신 필터링 테스트
    console.log("\n📋 3. 머신 필터링 테스트")
    const filterResponse = await machineApi.filterMachines({
      category: "하체",
      difficulty: "초급",
    })
    console.log("✅ 머신 필터링 성공")
    console.log(`   - 필터링된 머신 수: ${filterResponse.count}`)

    // 4. 카테고리별 필터링 테스트
    console.log("\n📋 4. 카테고리별 필터링 테스트")
    const categoryResponse = await machineApi.filterMachines({
      category: "하체",
    })
    console.log("✅ 카테고리별 필터링 성공")
    console.log(`   - 하체 머신 수: ${categoryResponse.count}`)

    // 5. 난이도별 필터링 테스트
    console.log("\n📋 5. 난이도별 필터링 테스트")
    const difficultyResponse = await machineApi.filterMachines({
      difficulty: "초급",
    })
    console.log("✅ 난이도별 필터링 성공")
    console.log(`   - 초급 머신 수: ${difficultyResponse.count}`)

    console.log("\n🎉 모든 API 연결 테스트가 성공했습니다!")
    console.log("📊 테스트 결과 요약:")
    console.log(`   - 총 머신 수: ${machinesResponse.count}`)
    console.log(`   - 하체 머신 수: ${categoryResponse.count}`)
    console.log(`   - 초급 머신 수: ${difficultyResponse.count}`)
  } catch (error: unknown) {
    console.error("❌ API 연결 테스트 실패:", error)

    if (error instanceof Error) {
      console.error("   - 에러 메시지:", error.message)
      console.error("   - 에러 스택:", error.stack)
    }

    // 네트워크 에러인지 확인
    if (error && typeof error === "object" && "response" in error) {
      const axiosError = error as {
        response?: { status: number; statusText: string }
      }
      console.error("   - HTTP 상태:", axiosError.response?.status)
      console.error("   - 상태 텍스트:", axiosError.response?.statusText)
    }

    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  testConnection()
}

export { testConnection }
