// ============================================================================
// 이미지 매칭 설정
// 머신 이미지와 실제 머신을 매칭하기 위한 설정
// ============================================================================

export const IMAGE_MATCHING_CONFIG = {
  // 이미지 매칭 정확도 임계값
  THRESHOLD: 0.8,
  
  // 이미지 크기 설정
  IMAGE_SIZE: {
    WIDTH: 300,
    HEIGHT: 200,
  },
  
  // 이미지 형식 설정
  FORMATS: ['jpg', 'jpeg', 'png', 'webp'],
  
  // 이미지 품질 설정
  QUALITY: 0.9,
  
  // 이미지 압축 설정
  COMPRESSION: {
    ENABLED: true,
    MAX_SIZE: 1024 * 1024, // 1MB
  },
  
  // 이미지 매칭 알고리즘 설정
  ALGORITHM: {
    TYPE: 'feature_matching', // 'feature_matching' | 'template_matching' | 'deep_learning'
    CONFIDENCE: 0.85,
  },

  // 이미지 매칭 설정
  MATCHING: {
    THRESHOLD: 0.8,
    MAX_RESULTS: 5,
    MIN_CONFIDENCE: 0.6,
  },
  
  // 이미지 전처리 설정
  PREPROCESSING: {
    ENABLED: true,
    NORMALIZE: true,
    RESIZE: true,
    ENHANCE: true,
  },
  
  // 이미지 캐싱 설정
  CACHING: {
    ENABLED: true,
    TTL: 24 * 60 * 60 * 1000, // 24시간
    MAX_ITEMS: 1000,
  },
} as const

// 이미지 매칭 결과 타입
export interface ImageMatchingResult {
  machineId: string
  confidence: number
  matchedImage: string
  boundingBox?: {
    x: number
    y: number
    width: number
    height: number
  }
}

// 이미지 매칭 요청 타입
export interface ImageMatchingRequest {
  image: File | string
  gymId?: string
  category?: string
  maxResults?: number
}
