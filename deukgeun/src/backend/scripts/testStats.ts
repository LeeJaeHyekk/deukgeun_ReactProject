import axios from "axios"

const BASE_URL = "http://localhost:5000/api"

async function testStatsAPI() {
  console.log("=== 통계 API 테스트 시작 ===")

  try {
    // 1. 플랫폼 통계 테스트
    console.log("\n1. 플랫폼 통계 조회 테스트")
    const platformStats = await axios.get(`${BASE_URL}/stats/platform`)
    console.log("✅ 플랫폼 통계 조회 성공:", platformStats.data)

    // 2. 상세 통계 테스트 (관리자 권한 필요)
    console.log("\n2. 상세 통계 조회 테스트")
    try {
      const detailedStats = await axios.get(`${BASE_URL}/stats/detailed`)
      console.log("✅ 상세 통계 조회 성공:", detailedStats.data)
    } catch (error: any) {
      console.log(
        "❌ 상세 통계 조회 실패 (예상됨 - 관리자 권한 필요):",
        error.response?.data
      )
    }

    // 3. 사용자 통계 테스트 (인증 필요)
    console.log("\n3. 사용자 통계 조회 테스트")
    try {
      const userStats = await axios.get(`${BASE_URL}/stats/user`)
      console.log("✅ 사용자 통계 조회 성공:", userStats.data)
    } catch (error: any) {
      console.log(
        "❌ 사용자 통계 조회 실패 (예상됨 - 인증 필요):",
        error.response?.data
      )
    }

    console.log("\n=== 통계 API 테스트 완료 ===")
  } catch (error: any) {
    console.error(
      "❌ 통계 API 테스트 실패:",
      error.response?.data || error.message
    )
  }
}

// 스크립트 실행
if (require.main === module) {
  testStatsAPI()
}

export { testStatsAPI }
