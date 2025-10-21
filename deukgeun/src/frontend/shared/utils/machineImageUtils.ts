import type { Machine } from "../../../shared/types/dto"
import { IMAGE_MATCHING_CONFIG, ImageMatchingManager } from '@frontend/shared/config/imageMatchingConfig'

// 이미지 매칭 결과 캐시
const imageCache = new Map<string, string>()

// 이미지 로딩 실패 추적 (무한 루프 방지)
const failedImages = new Set<string>()

// 머신 이름과 이미지 파일명 매핑 함수
function findMatchingImage(machine: Machine): string {
  // 디버깅을 위한 로그 추가
  console.log("🔍 findMatchingImage 호출:", {
    id: machine.id,
    name: machine.name,
    imageUrl: machine.imageUrl,
  })

  // 캐시 키 생성
  const cacheKey = `${machine.id}-${machine.name}-${machine.imageUrl || ""}`

  // 캐시된 결과가 있으면 반환
  if (imageCache.has(cacheKey)) {
    console.log("✅ 캐시된 결과 사용:", imageCache.get(cacheKey))
    return imageCache.get(cacheKey)!
  }

  let result: string

  // 1. DB에 이미지 URL이 있고 기본값이 아닌 경우 우선 사용
  if (
    machine.imageUrl &&
    machine.imageUrl !== IMAGE_MATCHING_CONFIG.defaultImage
  ) {
    console.log("📸 DB 이미지 URL 사용:", machine.imageUrl)
    result = machine.imageUrl
  } else {
    const machineName = machine.name.toLowerCase().trim()

    console.log("🔍 로컬 이미지 매칭 시도:", { machineName })

    // 2. img/machine 폴더에서 기구 이름이 포함된 이미지 찾기
    const matchedImage = findImageByMachineName(machineName, "")
    if (matchedImage) {
      console.log("✅ 로컬 이미지 매칭 성공:", matchedImage)
      result = matchedImage
    } else {
      console.log("❌ 매칭 실패, 기본 이미지 사용")
      // 3. 기본 이미지 반환
      result = IMAGE_MATCHING_CONFIG.defaultImage
    }
  }

  // 결과를 캐시에 저장
  imageCache.set(cacheKey, result)
  console.log("🎯 최종 이미지 경로:", result)
  return result
}

// 기구 이름으로 이미지 파일 찾기 (확장 가능한 버전)
function findImageByMachineName(
  machineName: string,
  machineNameEn: string
): string | null {
  // 1. 정확한 매칭 시도
  for (const [key, imageFile] of Object.entries(
    IMAGE_MATCHING_CONFIG.exactMatches
  )) {
    if (machineName.includes(key) || machineNameEn.includes(key)) {
      return `/img/machine/${imageFile}`
    }
  }

  // 2. 부분 매칭 시도 (긴 키워드부터)
  const sortedKeys = Object.keys(IMAGE_MATCHING_CONFIG.partialMatches).sort(
    (a, b) => b.length - a.length
  )
  for (const key of sortedKeys) {
    if (machineName.includes(key) || machineNameEn.includes(key)) {
      return `/img/machine/${IMAGE_MATCHING_CONFIG.partialMatches[key]}`
    }
  }

  return null
}

// 전체 이미지 URL 생성 함수
function getFullImageUrl(imagePath: string): string {
  return imagePath.startsWith("http")
    ? imagePath
    : `${import.meta.env.VITE_BACKEND_URL}${imagePath}`
}

// 이미지 로드 실패 시 기본 이미지로 대체하는 핸들러 (무한 루프 방지)
function handleImageError(
  e: React.SyntheticEvent<HTMLImageElement, Event>
): void {
  const target = e.target as HTMLImageElement
  const currentSrc = target.src

  // 이미 실패한 이미지인지 확인 (무한 루프 방지)
  if (failedImages.has(currentSrc)) {
    console.log("🚫 이미 실패한 이미지, 더 이상 시도하지 않음:", currentSrc)
    return
  }

  // 실패한 이미지로 기록
  failedImages.add(currentSrc)

  // 기본 이미지 URL
  const defaultImageUrl = `${import.meta.env.VITE_BACKEND_URL}${IMAGE_MATCHING_CONFIG.defaultImage}`

  // 이미 기본 이미지인 경우 무한 루프 방지
  if (currentSrc === defaultImageUrl) {
    console.log("🚫 기본 이미지도 로드 실패, 더 이상 시도하지 않음")
    return
  }

  console.log("❌ 이미지 로드 실패, 기본 이미지로 대체:", currentSrc)
  target.src = defaultImageUrl
}

// 캐시 초기화 함수 (필요시 사용)
function clearImageCache(): void {
  imageCache.clear()
  failedImages.clear()
}

// 확장성을 위한 유틸리티 함수들 (ImageMatchingManager 래퍼)
const ImageUtils = {
  // 새로운 이미지 파일 추가
  addAvailableImage: (imageFileName: string) => {
    ImageMatchingManager.getInstance().addAvailableImage(imageFileName)
  },

  // 새로운 정확한 매칭 규칙 추가
  addExactMatch: (keyword: string, imageFileName: string) => {
    ImageMatchingManager.getInstance().addExactMatch(keyword, imageFileName)
  },

  // 새로운 부분 매칭 규칙 추가
  addPartialMatch: (keyword: string, imageFileName: string) => {
    ImageMatchingManager.getInstance().addPartialMatch(keyword, imageFileName)
  },

  // 매칭 규칙 제거
  removeMatch: (keyword: string, isExact: boolean = false) => {
    ImageMatchingManager.getInstance().removeMatch(keyword, isExact)
  },

  // 현재 설정 조회
  getConfig: () => ImageMatchingManager.getInstance().getConfig(),

  // 캐시 통계
  getCacheStats: () => ({
    imageCacheSize: imageCache.size,
    failedImagesSize: failedImages.size,
  }),

  // 배치로 매칭 규칙 추가
  addBatchMatches: (
    matches: Array<{
      keyword: string
      imageFileName: string
      isExact?: boolean
    }>
  ) => {
    ImageMatchingManager.getInstance().addBatchMatches(matches)
  },

  // 설정 초기화
  resetConfig: () => {
    ImageMatchingManager.getInstance().resetConfig()
  },
}

// Export all functions
export {
  findMatchingImage,
  findImageByMachineName,
  getFullImageUrl,
  handleImageError,
  clearImageCache,
  ImageUtils,
}