// ============================================================================
// 헬스장 관련 타입
// ============================================================================

// 헬스장
export interface Gym {
  id: number
  name: string
  address: string
  phone: string
  website?: string
  description?: string
  latitude: number
  longitude: number
  rating: number
  reviewCount: number
  priceRange: PriceRange
  facilities: string[]
  operatingHours: OperatingHours[]
  images: string[]
  isVerified: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// 가격 범위
export type PriceRange = "low" | "medium" | "high" | "premium"

// 운영 시간
export interface OperatingHours {
  day: DayOfWeek
  openTime: string // HH:mm 형식
  closeTime: string // HH:mm 형식
  isOpen: boolean
}

// 요일
export type DayOfWeek = "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday"

// 헬스장 검색 필터
export interface GymSearchFilter {
  location?: {
    latitude: number
    longitude: number
    radius: number // km
  }
  priceRange?: PriceRange[]
  facilities?: string[]
  rating?: number
  isOpenNow?: boolean
  hasParking?: boolean
  hasShower?: boolean
  hasLocker?: boolean
  hasSauna?: boolean
  hasPool?: boolean
  hasYoga?: boolean
  hasPT?: boolean
}

// 헬스장 정렬 옵션
export type GymSortOption = 
  | "distance"
  | "rating"
  | "price_low"
  | "price_high"
  | "review_count"
  | "name"

// 헬스장 검색 요청
export interface SearchGymsRequest {
  query?: string
  filter?: GymSearchFilter
  sortBy?: GymSortOption
  page?: number
  limit?: number
  userId?: number // 즐겨찾기 상태 확인용
}

// 헬스장 상세 조회 요청
export interface GetGymRequest {
  gymId: number
  userId?: number // 즐겨찾기 상태 확인용
}

// 헬스장 즐겨찾기
export interface GymFavorite {
  id: number
  userId: number
  gymId: number
  createdAt: Date
}

// 헬스장 리뷰
export interface GymReview {
  id: number
  gymId: number
  userId: number
  rating: number
  title: string
  content: string
  images?: string[]
  isVerified: boolean
  helpfulCount: number
  createdAt: Date
  updatedAt: Date
}

// 헬스장 리뷰 생성 요청
export interface CreateGymReviewRequest {
  gymId: number
  userId: number
  rating: number
  title: string
  content: string
  images?: string[]
}

// 헬스장 리뷰 업데이트 요청
export interface UpdateGymReviewRequest {
  reviewId: number
  rating?: number
  title?: string
  content?: string
  images?: string[]
}

// 헬스장 즐겨찾기 요청
export interface ToggleGymFavoriteRequest {
  userId: number
  gymId: number
}

// 헬스장 응답 타입
export interface GymResponse {
  success: boolean
  message: string
  data?: Gym
  error?: string
}

export interface GymsResponse {
  success: boolean
  message: string
  data?: {
    gyms: Gym[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
  error?: string
}

// 헬스장 리뷰 응답 타입
export interface GymReviewResponse {
  success: boolean
  message: string
  data?: GymReview
  error?: string
}

export interface GymReviewsResponse {
  success: boolean
  message: string
  data?: {
    reviews: GymReview[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }
  error?: string
}

// 헬스장 즐겨찾기 응답 타입
export interface GymFavoriteResponse {
  success: boolean
  message: string
  data?: {
    isFavorited: boolean
    favoriteCount: number
  }
  error?: string
}

// 헬스장 통계
export interface GymStats {
  totalGyms: number
  totalReviews: number
  averageRating: number
  gymsByPriceRange: Record<PriceRange, number>
  topRatedGyms: Gym[]
  recentlyAddedGyms: Gym[]
  popularFacilities: Array<{
    facility: string
    count: number
  }>
}

// 헬스장 시설
export interface GymFacility {
  id: number
  name: string
  description?: string
  icon?: string
  category: "basic" | "premium" | "special"
  isActive: boolean
}

// 헬스장 운영 정보
export interface GymOperationInfo {
  gymId: number
  currentStatus: "open" | "closed" | "holiday"
  nextOpenTime?: string
  specialHours?: string
  holidays?: string[]
  maintenanceInfo?: string
  updatedAt: Date
}

// 헬스장 위치 정보
export interface GymLocation {
  gymId: number
  address: string
  latitude: number
  longitude: number
  district: string
  city: string
  postalCode: string
  country: string
  directions?: string
  parkingInfo?: string
  publicTransport?: string[]
}

// 헬스장 연락처 정보
export interface GymContact {
  gymId: number
  phone: string
  email?: string
  website?: string
  socialMedia?: {
    facebook?: string
    instagram?: string
    twitter?: string
    youtube?: string
  }
  emergencyContact?: string
}

// 헬스장 가격 정보
export interface GymPricing {
  gymId: number
  membershipTypes: Array<{
    type: string
    price: number
    period: string
    description: string
    features: string[]
  }>
  additionalServices: Array<{
    service: string
    price: number
    description: string
  }>
  discounts?: Array<{
    type: string
    description: string
    discount: number
    validUntil?: Date
  }>
}

// 헬스장 이벤트
export interface GymEvent {
  id: number
  gymId: number
  title: string
  description: string
  startDate: Date
  endDate: Date
  eventType: "class" | "workshop" | "competition" | "promotion"
  maxParticipants?: number
  currentParticipants: number
  price?: number
  instructor?: string
  location?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// 헬스장 클래스
export interface GymClass {
  id: number
  gymId: number
  name: string
  description: string
  instructor: string
  duration: number // 분 단위
  maxCapacity: number
  currentEnrollment: number
  schedule: Array<{
    day: DayOfWeek
    time: string // HH:mm 형식
  }>
  price?: number
  category: "cardio" | "strength" | "flexibility" | "mind_body" | "sports"
  difficulty: "beginner" | "intermediate" | "advanced"
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// 헬스장 멤버십
export interface GymMembership {
  id: number
  userId: number
  gymId: number
  type: string
  startDate: Date
  endDate: Date
  status: "active" | "expired" | "cancelled" | "suspended"
  autoRenew: boolean
  price: number
  paymentMethod: string
  createdAt: Date
  updatedAt: Date
}

// 헬스장 방문 기록
export interface GymVisit {
  id: number
  userId: number
  gymId: number
  checkInTime: Date
  checkOutTime?: Date
  duration?: number // 분 단위
  notes?: string
  createdAt: Date
}

// 헬스장 알림
export interface GymNotification {
  id: number
  gymId: number
  userId: number
  type: "maintenance" | "event" | "class" | "promotion" | "general"
  title: string
  message: string
  isRead: boolean
  createdAt: Date
}
