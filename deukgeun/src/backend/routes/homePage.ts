import { Router } from "express"
import { HomePageController } from '@backend/controllers/homePageController'
import { rateLimiter } from "../middlewares/rateLimiter"
import { isAdmin, authMiddleware } from '@backend/middlewares/auth'

const router = Router()
const homePageController = new HomePageController()

// 홈페이지 설정 조회 (공개)
router.get("/config", rateLimiter(), homePageController.getHomePageConfig)

// 홈페이지 설정 업데이트 (관리자만)
router.put(
  "/config",
  rateLimiter(),
  authMiddleware,
  isAdmin,
  homePageController.updateHomePageConfig
)

// 홈페이지 설정 일괄 업데이트 (관리자만)
router.put(
  "/config/batch",
  rateLimiter(),
  authMiddleware,
  isAdmin,
  homePageController.updateMultipleConfigs
)

export default router
