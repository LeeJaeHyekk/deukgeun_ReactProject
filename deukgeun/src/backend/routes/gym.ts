import { Router } from "express"
import {
  getAllGyms,
  getGymById,
  searchGymsByLocation,
  bulkUpdateGyms,
  getDatabaseStatus,
} from "../controllers/gymController"

const router = Router()

// 모든 헬스장 조회
router.get("/", getAllGyms)

// ID로 헬스장 조회
router.get("/:id", getGymById)

// 위치 기반 헬스장 검색
router.get("/search/location", searchGymsByLocation)

// 데이터베이스 상태 확인
router.get("/status", getDatabaseStatus)

// 대량 헬스장 데이터 업데이트
router.post("/bulk-update", bulkUpdateGyms)

export default router
