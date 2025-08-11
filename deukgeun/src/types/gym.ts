// ============================================================================
// 헬스장 관련 타입
// ============================================================================

export type GymType = "짐" | "피트니스" | "크로스핏"

export interface Gym {
  id: number
  name: string
  type: GymType
  address: string
  phone?: string
  openTime?: string
  closeTime?: string
  latitude: number
  longitude: number
  operatingHours?: string
  facilities?: string[]
  // 추가 필드들
  distance?: number // 현재 위치에서의 거리 (km)
  rating?: number // 평점 (1-5)
  reviewCount?: number // 리뷰 수
  is24Hours?: boolean // 24시간 운영 여부
  hasPT?: boolean // PT 가능 여부
  hasGX?: boolean // GX 가능 여부
  hasParking?: boolean // 주차 가능 여부
  hasShower?: boolean // 샤워 시설 여부
  price?: string // 가격 정보
  imageUrl?: string // 헬스장 이미지 URL
  createdAt: Date
  updatedAt: Date
}

export interface GymCrawlerData {
  name: string
  address: string
  phone?: string
  latitude?: number
  longitude?: number
  operatingHours?: string
  facilities?: string[]
}
