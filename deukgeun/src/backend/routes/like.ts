import { Router } from "express";
import { authenticateToken } from "../middlewares/auth";
import { likePost, unlikePost } from "../controllers/likeController";

const router = Router();

// POST /api/likes/:id
router.post("/:id", authenticateToken, likePost);
// DELETE /api/likes/:id
router.delete("/:id", authenticateToken, unlikePost);

export default router;
