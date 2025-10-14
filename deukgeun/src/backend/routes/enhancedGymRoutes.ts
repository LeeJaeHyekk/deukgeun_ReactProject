import { Router } from 'express'
import { EnhancedGymController } from '../controllers/enhancedGymController'
import { getRepository } from 'typeorm'
import { Gym } from '../entities/Gym'

const router = Router()

// 컨트롤러 인스턴스 생성
const gymRepo = getRepository(Gym)
const enhancedGymController = new EnhancedGymController(gymRepo)

/**
 * @route POST /api/enhanced-gym/update-data
 * @desc 공공데이터와 크롤링을 통합한 헬스장 데이터 업데이트
 * @access Public
 */
router.post('/update-data', (req, res) => {
  enhancedGymController.updateGymDataWithCrawling(req, res)
})

/**
 * @route GET /api/enhanced-gym/crawl/:gymName
 * @desc 특정 헬스장의 상세 정보 크롤링
 * @access Public
 */
router.get('/crawl/:gymName', (req, res) => {
  enhancedGymController.crawlGymDetails(req, res)
})

/**
 * @route GET /api/enhanced-gym/validate-quality
 * @desc 전체 데이터 품질 검증
 * @access Public
 */
router.get('/validate-quality', (req, res) => {
  enhancedGymController.validateDataQuality(req, res)
})

/**
 * @route GET /api/enhanced-gym/validate-quality/:gymId
 * @desc 특정 헬스장 데이터 품질 검증
 * @access Public
 */
router.get('/validate-quality/:gymId', (req, res) => {
  enhancedGymController.validateDataQuality(req, res)
})

/**
 * @route GET /api/enhanced-gym/crawling-stats
 * @desc 크롤링 소스별 통계 조회
 * @access Public
 */
router.get('/crawling-stats', (req, res) => {
  enhancedGymController.getCrawlingStats(req, res)
})

/**
 * @route PUT /api/enhanced-gym/config
 * @desc 크롤링 설정 업데이트
 * @access Public
 */
router.put('/config', (req, res) => {
  enhancedGymController.updateCrawlingConfig(req, res)
})

/**
 * @route GET /api/enhanced-gym/status
 * @desc 크롤링 상태 모니터링
 * @access Public
 */
router.get('/status', (req, res) => {
  enhancedGymController.getCrawlingStatus(req, res)
})

/**
 * @route POST /api/enhanced-gym/stop
 * @desc 크롤링 중단
 * @access Public
 */
router.post('/stop', (req, res) => {
  enhancedGymController.stopCrawling(req, res)
})

/**
 * @route GET /api/enhanced-gym/performance
 * @desc 성능 통계 조회
 * @access Public
 */
router.get('/performance', (req, res) => {
  enhancedGymController.getPerformanceStats(req, res)
})

/**
 * @route POST /api/enhanced-gym/integrated-crawling
 * @desc 통합 크롤링 실행
 * @access Public
 */
router.post('/integrated-crawling', (req, res) => {
  enhancedGymController.executeIntegratedCrawling(req, res)
})

/**
 * @route GET /api/enhanced-gym/public-api-scheduler/status
 * @desc 공공 API 스케줄러 상태 조회
 * @access Public
 */
router.get('/public-api-scheduler/status', (req, res) => {
  enhancedGymController.getPublicApiSchedulerStatus(req, res)
})

/**
 * @route POST /api/enhanced-gym/public-api-scheduler/control
 * @desc 공공 API 스케줄러 시작/중지
 * @access Public
 */
router.post('/public-api-scheduler/control', (req, res) => {
  enhancedGymController.controlPublicApiScheduler(req, res)
})

/**
 * @route POST /api/enhanced-gym/api-list-update
 * @desc API 목록 업데이트 실행
 * @access Public
 */
router.post('/api-list-update', (req, res) => {
  enhancedGymController.updateApiList(req, res)
})

/**
 * @route GET /api/enhanced-gym/crawl-bypass/:gymName
 * @desc 크롤링 우회 서비스로 헬스장 정보 수집
 * @access Public
 */
router.get('/crawl-bypass/:gymName', (req, res) => {
  enhancedGymController.crawlGymWithBypass(req, res)
})

/**
 * @route POST /api/enhanced-gym/validate-type-guard
 * @desc 타입 가드 서비스로 데이터 검증
 * @access Public
 */
router.post('/validate-type-guard', (req, res) => {
  enhancedGymController.validateDataWithTypeGuard(req, res)
})

/**
 * @route GET /api/enhanced-gym/integrated-crawling/status
 * @desc 통합 크롤링 상태 조회
 * @access Public
 */
router.get('/integrated-crawling/status', (req, res) => {
  enhancedGymController.getIntegratedCrawlingStatus(req, res)
})

/**
 * @route POST /api/enhanced-gym/integrated-crawling/stop
 * @desc 통합 크롤링 중단
 * @access Public
 */
router.post('/integrated-crawling/stop', (req, res) => {
  enhancedGymController.stopIntegratedCrawling(req, res)
})

export default router
