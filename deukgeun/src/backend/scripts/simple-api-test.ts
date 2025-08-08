import axios from "axios"

const BASE_URL = "http://localhost:5000/api"

async function testAPI() {
  console.log("🔍 간단한 API 테스트 시작\n")

  try {
    // 1. 기구 목록 조회 테스트 (인증 불필요)
    console.log("1️⃣ 기구 목록 조회 테스트")
    const listResponse = await axios.get(`${BASE_URL}/machines`)
    console.log("✅ 기구 목록 조회 성공")
    console.log("응답:", listResponse.data)
  } catch (error: any) {
    console.log(
      "❌ 기구 목록 조회 실패:",
      error.response?.status,
      error.response?.data
    )
  }

  try {
    // 2. 존재하지 않는 기구 조회 테스트
    console.log("\n2️⃣ 존재하지 않는 기구 조회 테스트")
    const getResponse = await axios.get(`${BASE_URL}/machines/999999`)
    console.log("❌ 존재하지 않는 기구 조회가 성공했는데 실패해야 함!")
  } catch (error: any) {
    if (error.response?.status === 404) {
      console.log("✅ 존재하지 않는 기구 조회 실패 (예상된 결과)")
    } else {
      console.log(
        "❌ 예상과 다른 에러:",
        error.response?.status,
        error.response?.data
      )
    }
  }

  try {
    // 3. 필터링 테스트
    console.log("\n3️⃣ 기구 필터링 테스트")
    const filterResponse = await axios.get(
      `${BASE_URL}/machines/filter?category=상체`
    )
    console.log("✅ 기구 필터링 성공")
    console.log("필터링된 기구 수:", filterResponse.data.count)
  } catch (error: any) {
    console.log(
      "❌ 기구 필터링 실패:",
      error.response?.status,
      error.response?.data
    )
  }

  console.log("\n🎯 간단한 API 테스트 완료!")
}

// 스크립트 실행
if (require.main === module) {
  testAPI().catch(console.error)
}

export { testAPI }
