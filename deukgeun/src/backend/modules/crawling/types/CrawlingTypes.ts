/**
 * 크롤링 관련 타입 정의
 */

export interface CrawlingConfig {
  enablePublicApi: boolean
  enableCrawling: boolean
  enableDataMerging: boolean
  enableQualityCheck: boolean
  batchSize: number
  maxConcurrentRequests: number
  delayBetweenBatches: number
  maxRetries: number
  timeout: number
  saveToFile: boolean
  saveToDatabase: boolean
}

export interface CrawlingResult {
  success: boolean
  totalGyms: number
  publicApiGyms: number
  crawlingGyms: number
  mergedGyms: number
  duration: number
  processingTime: number
  errors: string[]
  warnings: string[]
  dataQuality: {
    average: number
    min: number
    max: number
    distribution: Record<string, number>
    complete?: number
    partial?: number
    minimal?: number
    averageQualityScore?: number
  }
}

export interface CrawlingSource {
  name: string
  type: 'api' | 'crawling' | 'manual'
  priority: number
  enabled: boolean
  rateLimit: {
    requests: number
    per: number // seconds
  }
}

export interface CrawlingOptions {
  gymName?: string
  gymAddress?: string
  includeEquipment?: boolean
  includeReviews?: boolean
  maxResults?: number
  timeout?: number
}

export interface ProcessedGymData {
  id?: number | string
  name: string
  address: string
  phone?: string
  latitude?: number
  longitude?: number
  facilities?: string | string[]
  openHour?: string
  closeHour?: string
  price?: string
  services?: string[]
  website?: string
  instagram?: string
  facebook?: string
  // 상세 가격 정보
  membershipPrice?: string // 회원권 가격 (월/년 단위)
  ptPrice?: string // PT 가격 (횟수 단위)
  gxPrice?: string // GX/그룹레슨 가격 (횟수 단위)
  dayPassPrice?: string // 일일 이용권 가격
  priceDetails?: string // 기타 가격 정보 (범위 등)
  minimumPrice?: string // 최소가격 정보 (별도 필드)
  discountInfo?: string // 할인 정보 (가격과 별도 관리)
  rating?: number
  reviewCount?: number
  source: string
  confidence: number
  type?: string
  is24Hours?: boolean
  hasGX?: boolean
  hasPT?: boolean
  hasGroupPT?: boolean
  hasParking?: boolean
  hasShower?: boolean
  equipment?: ProcessedEquipmentData[]
  createdAt?: Date | string
  updatedAt?: Date | string
  
  // 새로운 필드들
  serviceType?: string
  isCurrentlyOpen?: boolean
  crawledAt?: string
  
  // 서울시 공공데이터 API 추가 필드들
  businessStatus?: string // TRDSTATENM - 영업상태명
  businessType?: string // UPTAENM - 업태구분명
  detailBusinessType?: string // DRMKCOBNM - 세부업종명
  cultureSportsType?: string // CULPHYEDCOBNM - 문화체육업종명
  managementNumber?: string // MGTNO - 관리번호
  approvalDate?: string // APVPERMYMD - 인허가일자
  siteArea?: string // SITEAREA - 소재지면적
  postalCode?: string // RDNPOSTNO/SITEPOSTNO - 우편번호
  
  // 추가 상세 정보 필드들
  sitePostalCode?: string // SITEPOSTNO - 소재지우편번호
  siteAddress?: string // SITEWHLADDR - 지번주소
  roadAddress?: string // RDNWHLADDR - 도로명주소
  roadPostalCode?: string // RDNPOSTNO - 도로명우편번호
  insuranceCode?: string // INSURJNYNCODE - 보험가입여부코드
  leaderCount?: string // LDERCNT - 지도자수
  buildingCount?: string // BDNGDNGNUM - 건축물동수
  buildingArea?: string // BDNGYAREA - 건축물연면적
}

export interface ProcessedEquipmentData {
  id?: number
  gymId?: number
  type: 'cardio' | 'weight'
  category: string
  name: string
  quantity: number
  brand?: string
  model?: string
  isLatestModel?: boolean
  weightRange?: string
  equipmentVariant?: string
  additionalInfo?: string
  confidence: number
  source: string
  createdAt?: Date
  updatedAt?: Date
}

export interface EnhancedGymInfo {
  name: string
  address: string
  phone?: string
  rating?: number
  reviewCount?: number
  openHour?: string
  closeHour?: string
  price?: string
  membershipPrice?: string
  ptPrice?: string
  gxPrice?: string
  dayPassPrice?: string
  priceDetails?: string
  minimumPrice?: string
  discountInfo?: string
  facilities?: string[]
  services?: string[]
  website?: string
  instagram?: string
  facebook?: string
  source: string
  confidence: number
  type: 'private' | 'public'
}

export interface CrawlingStatus {
  isRunning: boolean
  currentStep: string
  progress: {
    current: number
    total: number
    percentage: number
  }
  startTime: Date | null
  estimatedCompletion: Date | null
  errors: string[]
}
