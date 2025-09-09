export interface Gym {
  id: string
  name: string
  type: "짐" | "피트니스" | "크로스핏"
  address: string
  phone?: string
  openTime?: string
  closeTime?: string
  latitude: number
  longitude: number
  // 추가 필드들
  distance?: number // 현재 위치에서의 거리 (km)
  rating?: number // 평점 (1-5)
  reviewCount?: number // 리뷰 수
  facilities?: string[] // 시설 정보 (PT, GX, 24시간, 주차 등)
  is24Hours?: boolean // 24시간 운영 여부
  hasPT?: boolean // PT 가능 여부
  hasGX?: boolean // GX 가능 여부
  hasParking?: boolean // 주차 가능 여부
  hasShower?: boolean // 샤워 시설 여부
  price?: string // 가격 정보
  imageUrl?: string // 헬스장 이미지 URL
}

// 정렬 옵션 타입
export type SortOption =
  | "distance"
  | "name"
  | "rating"
  | "reviewCount"
  | "price"

// 필터 옵션 타입
export type FilterOption = "PT" | "GX" | "24시간" | "주차" | "샤워"

// 정렬 방향 타입
export type SortDirection = "asc" | "desc"
