import { Router } from 'express'
import {
  getAllGyms,
  getGymById,
  searchGyms,
  getGymsByLocation,
  updateGymData,
  smartSearchGyms,
  getNearbyGyms,
  getGymNameSuggestions,
  getGymStats,
} from '../controllers/gymController'

const router = Router()

// 모든 헬스장 조회
router.get('/', getAllGyms)

// ID로 헬스장 조회
router.get('/:id', getGymById)

// 헬스장 검색
router.get('/search', searchGyms)

// 위치 기반 헬스장 검색
router.get('/search/location', getGymsByLocation)

// 스마트 검색 (지역/헬스장명 구분)
router.post('/search/smart', smartSearchGyms)

// 주변 헬스장 검색 (위치 기반)
router.post('/search/nearby', getNearbyGyms)

// 헬스장 데이터 업데이트
router.post('/update', updateGymData)

// 헬스장명 자동완성
router.get('/search/suggestions', getGymNameSuggestions)

// 헬스장 통계
router.get('/stats', getGymStats)

export default router
