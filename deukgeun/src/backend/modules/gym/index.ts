// ============================================================================
// Gym 모듈 인덱스
// ============================================================================

// Gym 관련 라우트
export { default as gymRoutes } from "@backend/routes/gym"
export { default as enhancedGymRoutes } from "@backend/routes/enhancedGymRoutes"

// Gym 컨트롤러
export { 
  getAllGyms, 
  getGymById, 
  searchGyms, 
  getGymsByLocation 
} from "@backend/controllers/gymController"

// Gym 엔티티
export { Gym } from "@backend/entities/Gym"
export { Machine } from "@backend/entities/Machine"
export { Equipment } from "@backend/entities/Equipment"

// Gym 크롤링 서비스
export { getCrawlingService, initializeCrawlingService, cleanupCrawlingService } from "@backend/services/crawlingService"
export { LEGACY_CRAWLING_SERVICES } from "@backend/services/legacy-crawling-services"
