import { Router } from "express"
import {
  getAllGyms,
  getGymById,
  searchGyms,
  getGymsByLocation,
  updateGymData,
} from "../controllers/gymController"

const router = Router()

// 모든 헬스장 조회
router.get("/", getAllGyms)

// ID로 헬스장 조회
router.get("/:id", getGymById)

// 헬스장 검색
router.get("/search", searchGyms)

// 위치 기반 헬스장 검색
router.get("/search/location", getGymsByLocation)

// 헬스장 데이터 업데이트
router.post("/update", updateGymData)

export default router
