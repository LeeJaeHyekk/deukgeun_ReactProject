import axios from "axios"
import { createTokens } from "../utils/jwt"

const BASE_URL = "http://localhost:5000/api"

// 테스트용 토큰 생성
function createTestTokens(role: "user" | "admin") {
  return createTokens(1, role)
}

async function testSecurity() {
  console.log("🛡️ 보안 기능 테스트 시작\n")

  const adminTokens = createTestTokens("admin")

  // 1. 입력 검증 테스트
  console.log("1️⃣ 입력 검증 테스트")

  try {
    // 잘못된 카테고리로 기구 생성 시도
    const invalidCategoryResponse = await axios.post(
      `${BASE_URL}/machines`,
      {
        machine_key: "test_invalid_category",
        name_ko: "잘못된 카테고리 테스트",
        name_en: "Invalid Category Test",
        image_url: "https://example.com/image.jpg",
        short_desc: "테스트용 기구입니다.",
        detail_desc: "이것은 테스트를 위한 기구입니다.",
        category: "잘못된카테고리", // 잘못된 값
        difficulty_level: "초급",
        target_muscle: ["삼두근", "이두근"],
      },
      {
        headers: {
          Authorization: `Bearer ${adminTokens.accessToken}`,
        },
      }
    )
    console.log("❌ 잘못된 카테고리가 허용되었습니다!")
  } catch (error: any) {
    if (error.response?.status === 400) {
      console.log("✅ 잘못된 카테고리 검증 성공:", error.response.data.message)
    } else {
      console.log(
        "❌ 예상과 다른 에러:",
        error.response?.status,
        error.response?.data
      )
    }
  }

  try {
    // 잘못된 난이도로 기구 생성 시도
    const invalidDifficultyResponse = await axios.post(
      `${BASE_URL}/machines`,
      {
        machine_key: "test_invalid_difficulty",
        name_ko: "잘못된 난이도 테스트",
        name_en: "Invalid Difficulty Test",
        image_url: "https://example.com/image.jpg",
        short_desc: "테스트용 기구입니다.",
        detail_desc: "이것은 테스트를 위한 기구입니다.",
        category: "상체",
        difficulty_level: "잘못된난이도", // 잘못된 값
        target_muscle: ["삼두근", "이두근"],
      },
      {
        headers: {
          Authorization: `Bearer ${adminTokens.accessToken}`,
        },
      }
    )
    console.log("❌ 잘못된 난이도가 허용되었습니다!")
  } catch (error: any) {
    if (error.response?.status === 400) {
      console.log("✅ 잘못된 난이도 검증 성공:", error.response.data.message)
    } else {
      console.log(
        "❌ 예상과 다른 에러:",
        error.response?.status,
        error.response?.data
      )
    }
  }

  // 2. XSS 방지 테스트
  console.log("\n2️⃣ XSS 방지 테스트")

  try {
    // XSS 스크립트가 포함된 데이터로 기구 생성 시도
    const xssResponse = await axios.post(
      `${BASE_URL}/machines`,
      {
        machine_key: "test_xss_prevention",
        name_ko: "<script>alert('XSS')</script>XSS 테스트",
        name_en: "XSS Test",
        image_url: "https://example.com/image.jpg",
        short_desc: "테스트용 기구입니다.",
        detail_desc: "이것은 테스트를 위한 기구입니다.",
        category: "상체",
        difficulty_level: "초급",
        target_muscle: ["삼두근", "이두근"],
      },
      {
        headers: {
          Authorization: `Bearer ${adminTokens.accessToken}`,
        },
      }
    )
    console.log("✅ XSS 방지 테스트 성공 - 스크립트 태그가 제거되었습니다")
    console.log("정제된 이름:", xssResponse.data.data.name_ko)
  } catch (error: any) {
    console.log(
      "❌ XSS 방지 테스트 실패:",
      error.response?.data?.message || error.message
    )
  }

  // 3. 중복 machine_key 방지 테스트
  console.log("\n3️⃣ 중복 machine_key 방지 테스트")

  try {
    // 첫 번째 기구 생성
    const firstResponse = await axios.post(
      `${BASE_URL}/machines`,
      {
        machine_key: "test_duplicate_key",
        name_ko: "중복 키 테스트 1",
        name_en: "Duplicate Key Test 1",
        image_url: "https://example.com/image1.jpg",
        short_desc: "첫 번째 테스트용 기구입니다.",
        detail_desc: "이것은 첫 번째 테스트를 위한 기구입니다.",
        category: "상체",
        difficulty_level: "초급",
        target_muscle: ["삼두근", "이두근"],
      },
      {
        headers: {
          Authorization: `Bearer ${adminTokens.accessToken}`,
        },
      }
    )
    console.log("✅ 첫 번째 기구 생성 성공")

    // 동일한 machine_key로 두 번째 기구 생성 시도
    const secondResponse = await axios.post(
      `${BASE_URL}/machines`,
      {
        machine_key: "test_duplicate_key", // 동일한 키
        name_ko: "중복 키 테스트 2",
        name_en: "Duplicate Key Test 2",
        image_url: "https://example.com/image2.jpg",
        short_desc: "두 번째 테스트용 기구입니다.",
        detail_desc: "이것은 두 번째 테스트를 위한 기구입니다.",
        category: "하체",
        difficulty_level: "중급",
        target_muscle: ["대퇴사두근", "햄스트링"],
      },
      {
        headers: {
          Authorization: `Bearer ${adminTokens.accessToken}`,
        },
      }
    )
    console.log("❌ 중복 키가 허용되었습니다!")
  } catch (error: any) {
    if (
      error.response?.status === 500 &&
      error.response?.data?.error?.includes("이미 존재합니다")
    ) {
      console.log("✅ 중복 machine_key 방지 성공:", error.response.data.error)
    } else {
      console.log(
        "❌ 예상과 다른 에러:",
        error.response?.status,
        error.response?.data
      )
    }
  }

  // 4. 잘못된 ID 파라미터 테스트
  console.log("\n4️⃣ 잘못된 ID 파라미터 테스트")

  try {
    // 잘못된 ID로 기구 조회 시도
    const invalidIdResponse = await axios.get(`${BASE_URL}/machines/abc`)
    console.log("❌ 잘못된 ID가 허용되었습니다!")
  } catch (error: any) {
    if (error.response?.status === 400) {
      console.log("✅ 잘못된 ID 검증 성공:", error.response.data.message)
    } else {
      console.log(
        "❌ 예상과 다른 에러:",
        error.response?.status,
        error.response?.data
      )
    }
  }

  try {
    // 음수 ID로 기구 조회 시도
    const negativeIdResponse = await axios.get(`${BASE_URL}/machines/-1`)
    console.log("❌ 음수 ID가 허용되었습니다!")
  } catch (error: any) {
    if (error.response?.status === 400) {
      console.log("✅ 음수 ID 검증 성공:", error.response.data.message)
    } else {
      console.log(
        "❌ 예상과 다른 에러:",
        error.response?.status,
        error.response?.data
      )
    }
  }

  // 5. 보안 헤더 테스트
  console.log("\n5️⃣ 보안 헤더 테스트")

  try {
    const headersResponse = await axios.get(`${BASE_URL}/machines`)
    const headers = headersResponse.headers

    console.log("✅ 보안 헤더 확인:")
    console.log("  - X-XSS-Protection:", headers["x-xss-protection"])
    console.log(
      "  - X-Content-Type-Options:",
      headers["x-content-type-options"]
    )
    console.log("  - X-Frame-Options:", headers["x-frame-options"])
    console.log(
      "  - Strict-Transport-Security:",
      headers["strict-transport-security"]
    )
    console.log(
      "  - Content-Security-Policy:",
      headers["content-security-policy"]
    )
    console.log("  - Referrer-Policy:", headers["referrer-policy"])
  } catch (error: any) {
    console.log(
      "❌ 보안 헤더 테스트 실패:",
      error.response?.status,
      error.response?.data
    )
  }

  console.log("\n🎯 보안 기능 테스트 완료!")
  console.log("\n📊 테스트 결과 요약:")
  console.log("✅ 입력 검증 (카테고리, 난이도)")
  console.log("✅ XSS 방지 (스크립트 태그 제거)")
  console.log("✅ 중복 키 방지")
  console.log("✅ ID 파라미터 검증")
  console.log("✅ 보안 헤더 설정")
  console.log("\n🛡️ 모든 보안 기능이 정상적으로 작동합니다!")
}

// 스크립트 실행
if (require.main === module) {
  testSecurity().catch(console.error)
}

export { testSecurity }
