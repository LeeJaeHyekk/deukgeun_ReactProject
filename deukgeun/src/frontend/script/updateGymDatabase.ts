import { getGymsForScript } from "./getGymsForScript"
import { scriptEnv, validateEnv } from "./env"

// Gym 타입 정의 (스크립트용)
interface Gym {
  id: string
  name: string
  type: string
  address: string
  phone: string
  openTime?: string
  closeTime?: string
  latitude: number
  longitude: number
}

// 환경변수 검증
validateEnv()

/**
 * 프론트엔드에서 API를 호출하여 헬스장 데이터를 가져오고
 * 백엔드 API를 통해 데이터베이스를 최신화하는 함수
 */
export async function updateGymDatabase() {
  try {
    console.log("🔄 헬스장 데이터베이스 최신화 시작...")

    // 1. 서울시 공공데이터 API에서 헬스장 데이터 가져오기
    console.log("📡 서울시 공공데이터 API에서 헬스장 정보를 가져오는 중...")
    const gyms = await getGymsForScript()
    console.log(
      `✅ ${gyms.length}개의 헬스장 데이터를 성공적으로 가져왔습니다.`
    )

    // 2. 데이터 필터링 (유효한 데이터만)
    const validGyms = filterValidGyms(gyms)
    console.log(
      `🔍 유효한 데이터: ${validGyms.length}개 (전체: ${gyms.length}개)`
    )

    // 3. 백엔드 API를 통해 데이터베이스 업데이트
    console.log("💾 백엔드 데이터베이스에 데이터를 저장하는 중...")
    await saveGymsToDatabase(validGyms)

    console.log("✅ 헬스장 데이터베이스 최신화가 완료되었습니다!")

    return {
      success: true,
      totalFetched: gyms.length,
      validCount: validGyms.length,
      message: "데이터베이스 최신화 완료",
    }
  } catch (error) {
    console.error("❌ 헬스장 데이터베이스 최신화 실패:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "알 수 없는 오류",
      message: "데이터베이스 최신화 실패",
    }
  }
}

/**
 * 유효한 헬스장 데이터만 필터링
 */
function filterValidGyms(gyms: Gym[]): Gym[] {
  return gyms.filter(gym => {
    const hasValidCoords =
      gym.latitude != null &&
      gym.longitude != null &&
      !isNaN(gym.latitude) &&
      !isNaN(gym.longitude) &&
      gym.latitude !== 0 &&
      gym.longitude !== 0
    const hasPhone = gym.phone != null && gym.phone.trim() !== ""
    const hasName = gym.name != null && gym.name.trim() !== ""
    const hasAddress = gym.address != null && gym.address.trim() !== ""

    return hasValidCoords && hasPhone && hasName && hasAddress
  })
}

/**
 * 백엔드 API를 통해 헬스장 데이터를 데이터베이스에 저장
 */
async function saveGymsToDatabase(gyms: Gym[]) {
  // 스크립트 환경변수 사용
  const backendUrl = scriptEnv.VITE_BACKEND_URL

  try {
    const response = await fetch(`${backendUrl}/api/gyms/bulk-update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ gyms }),
    })

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as { message?: string }
      throw new Error(
        `백엔드 API 오류: ${response.status} - ${
          errorData.message || response.statusText
        }`
      )
    }

    const result = (await response.json()) as { savedCount: number }
    console.log(
      `💾 ${result.savedCount}개의 헬스장 데이터가 데이터베이스에 저장되었습니다.`
    )

    return result
  } catch (error) {
    console.error("백엔드 API 호출 실패:", error)
    throw error
  }
}

/**
 * 데이터베이스 최신화 상태 확인
 */
export async function checkDatabaseStatus() {
  // 스크립트 환경변수 사용
  const backendUrl = scriptEnv.VITE_BACKEND_URL

  try {
    const response = await fetch(`${backendUrl}/api/gyms/status`)

    if (!response.ok) {
      throw new Error(`상태 확인 실패: ${response.status}`)
    }

    const status = await response.json()
    return status
  } catch (error) {
    console.error("데이터베이스 상태 확인 실패:", error)
    return null
  }
}

// 스크립트 실행 (Node.js 환경에서 직접 실행할 때)
updateGymDatabase()
  .then(result => {
    console.log("최신화 결과:", result)
    process.exit(result.success ? 0 : 1)
  })
  .catch(error => {
    console.error("스크립트 실행 실패:", error)
    process.exit(1)
  })
