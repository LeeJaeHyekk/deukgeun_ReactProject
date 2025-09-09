// ============================================================================
// Frontend 유틸리티 인덱스
// ============================================================================

// 머신 이미지 유틸리티
export {
  findMatchingImage,
  clearImageCache,
  getCategoryDefaultImage,
  getDifficultyColor,
  getFullImageUrl,
} from "./machineImageUtils"

// 기존 유틸리티들과의 호환성을 위한 재export
export { adminUtils } from "./adminUtils"
