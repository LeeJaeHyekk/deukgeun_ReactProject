import { Router } from "express"
import { authenticateToken } from "../middlewares/auth"
import { LikeController } from "../controllers/likeController"

const router = Router()
const likeController = new LikeController()

// POST /api/likes/:id
router.post("/:id", authenticateToken, likeController.addLike)
// DELETE /api/likes/:id
router.delete("/:id", authenticateToken, likeController.removeLike)

export default router
