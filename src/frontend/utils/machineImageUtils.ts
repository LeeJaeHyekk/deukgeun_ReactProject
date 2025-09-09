// ============================================================================
// Frontend 머신 이미지 유틸리티
// ============================================================================

import { IMAGE_MATCHING_CONFIG } from "../shared/lib/config.js"
import type { Machine } from "../types/common"

// 이미지 매칭 캐시
const imageCache = new Map<string, string>()

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

  const matchedImage = IMAGE_MATCHING_CONFIG.MACHINE_IMAGES[machine.name]
  if (matchedImage) {
    console.log("✅ 로컬 이미지 매칭 성공:", matchedImage)
    imageCache.set(cacheKey, matchedImage)
    return matchedImage
  }

  // 3. 기본 이미지 사용
  const defaultImage = IMAGE_MATCHING_CONFIG.DEFAULT_IMAGE
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
  return (
    IMAGE_MATCHING_CONFIG.CATEGORY_IMAGES[category] ||
    IMAGE_MATCHING_CONFIG.DEFAULT_IMAGE
  )
}

/**
 * 머신 난이도별 색상을 반환합니다.
 * @param difficulty - 머신 난이도
 * @returns 난이도별 색상
 */
export function getDifficultyColor(difficulty: string): string {
  return IMAGE_MATCHING_CONFIG.DIFFICULTY_COLORS[difficulty] || "#6b7280"
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

/**
 * 카테고리 아이콘을 반환합니다.
 * @param category - 머신 카테고리
 * @returns 카테고리 아이콘
 */
export function getCategoryIcon(category: string): string {
  const categoryIcons: Record<string, string> = {
    chest: "💪",
    back: "🏋️",
    shoulders: "🤸",
    arms: "💪",
    legs: "🦵",
    core: "🔥",
    cardio: "🏃",
  }
  return categoryIcons[category] || "🏋️"
}
