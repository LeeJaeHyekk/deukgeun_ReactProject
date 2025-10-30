import { Router } from "express"
import { authMiddleware } from "@backend/middlewares/auth"
import { LevelService } from "@backend/services/levelService"

const router = Router()
const levelService = new LevelService()

// GET /api/rewards - get current user's rewards
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.userId
    const rewards = await levelService.getUserRewards(userId)
    res.json({ success: true, message: "OK", data: { rewards } })
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error", error: "SERVER_ERROR" })
  }
})

export default router


