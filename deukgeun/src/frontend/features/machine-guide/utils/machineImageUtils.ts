// ============================================================================
// Machine Image Utilities
// ============================================================================

import IMAGE_MATCHING_CONFIG from "@shared/config/imageMatchingConfig"
import type { Machine } from "@dto/index"

// 이미지 매칭 캐시
const imageCache = new Map<string, string>()

// 머신 이름과 이미지 매핑
const machineImageMapping: Record<string, string> = {
  벤치프레스: "/img/machine/chest-press.png",
  랫풀다운: "/img/machine/lat-pulldown.png",
  레그프레스: "/img/machine/leg-press.png",
  스쿼트랙: "/img/machine/squat-rack.png",
  덤벨: "/img/machine/dumbbell.png",
  바벨: "/img/machine/barbell.png",
  케이블머신: "/img/machine/cable-machine.png",
  레그컬: "/img/machine/leg-curl.png",
  레그익스텐션: "/img/machine/leg-extension.png",
  레터럴풀다운: "/img/machine/lateral-pulldown.png",
  시티드로우: "/img/machine/seated-row.png",
  오버헤드프레스: "/img/machine/overhead-press.png",
  사이드레터럴레이즈: "/img/machine/side-lateral-raise.png",
  바이셉스컬: "/img/machine/bicep-curl.png",
  트라이셉스익스텐션: "/img/machine/tricep-extension.png",
  크런치: "/img/machine/crunch.png",
  플랭크: "/img/machine/plank.png",
  데드리프트: "/img/machine/deadlift.png",
  로우: "/img/machine/row.png",
  풀업: "/img/machine/pull-up.png",
  딥스: "/img/machine/dips.png",
  런지: "/img/machine/lunge.png",
  스텝업: "/img/machine/step-up.png",
  카프레이즈: "/img/machine/calf-raise.png",
  힙쓰러스트: "/img/machine/hip-thrust.png",
  글루트브릿지: "/img/machine/glute-bridge.png",
  러시안트위스트: "/img/machine/russian-twist.png",
  마운틴클라이머: "/img/machine/mountain-climber.png",
  버피: "/img/machine/burpee.png",
  점프스쿼트: "/img/machine/jump-squat.png",
  플라이오메트릭: "/img/machine/plyometric.png",
}

/**
 * 머신에 대한 적절한 이미지 경로를 찾습니다.
 * @param machine - 머신 객체
 * @returns 이미지 경로
 */
export function findMatchingImage(machine: Machine): string {
  console.log("🔍 findMatchingImage 호출:", machine)

  // 캐시된 결과가 있는지 확인
  const cacheKey = `${machine.id}-${machine.name}`
  if (imageCache.has(cacheKey)) {
    console.log("✅ 캐시된 결과 사용:", imageCache.get(cacheKey))
    return imageCache.get(cacheKey)!
  }

  // 1. DB에 저장된 이미지 URL이 있으면 사용
  if (machine.imageUrl) {
    console.log("📸 DB 이미지 URL 사용:", machine.imageUrl)
    imageCache.set(cacheKey, machine.imageUrl)
    return machine.imageUrl
  }

  // 2. 머신 이름으로 매칭 시도
  console.log("🔍 로컬 이미지 매칭 시도:", { machineName: machine.name })

  const matchedImage = machineImageMapping[machine.name]
  if (matchedImage) {
    console.log("✅ 로컬 이미지 매칭 성공:", matchedImage)
    imageCache.set(cacheKey, matchedImage)
    return matchedImage
  }

  // 3. 기본 이미지 사용
  const defaultImage = "/img/machine/default.png"
  console.log("🎯 최종 이미지 경로:", defaultImage)
  imageCache.set(cacheKey, defaultImage)
  return defaultImage
}

/**
 * 이미지 캐시를 초기화합니다.
 */
export function clearImageCache(): void {
  imageCache.clear()
  console.log("🗑️ 이미지 캐시 초기화됨")
}

/**
 * 머신 카테고리별 기본 이미지를 반환합니다.
 * @param category - 머신 카테고리
 * @returns 카테고리별 기본 이미지 경로
 */
export function getCategoryDefaultImage(category: string): string {
  const categoryImages: Record<string, string> = {
    상체: "/img/machine/upper-body.png",
    하체: "/img/machine/lower-body.png",
    전신: "/img/machine/full-body.png",
    기타: "/img/machine/other.png",
    strength: "/img/machine/strength.png",
    cardio: "/img/machine/cardio.png",
    flexibility: "/img/machine/flexibility.png",
    balance: "/img/machine/balance.png",
    functional: "/img/machine/functional.png",
    rehabilitation: "/img/machine/rehabilitation.png",
  }

  return categoryImages[category] || "/img/machine/default.png"
}

/**
 * 머신 난이도별 색상을 반환합니다.
 * @param difficulty - 머신 난이도
 * @returns 난이도별 색상
 */
export function getDifficultyColor(difficulty: string): string {
  const difficultyColors: Record<string, string> = {
    초급: "#22c55e",
    중급: "#f59e0b",
    고급: "#ef4444",
    beginner: "#22c55e",
    intermediate: "#f59e0b",
    advanced: "#ef4444",
    expert: "#8b5cf6",
  }

  return difficultyColors[difficulty] || "#6b7280"
}

/**
 * 전체 이미지 URL을 생성합니다.
 * @param imagePath - 이미지 경로
 * @returns 전체 이미지 URL
 */
export function getFullImageUrl(imagePath: string): string {
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath
  }

  // 상대 경로인 경우 기본 도메인 추가
  return `${window.location.origin}${imagePath}`
}
