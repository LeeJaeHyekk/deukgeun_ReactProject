// ============================================================================
// 메인 라우트 인덱스
// ============================================================================

import { Router } from "express"

const router = Router()

// 기본 라우트
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Deukgeun API Server",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  })
})

// 헬스 체크
router.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
  })
})

export default router
