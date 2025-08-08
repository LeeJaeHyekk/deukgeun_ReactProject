import { Router } from "express";
import { authenticateToken } from "../middlewares/auth";
import {
  getComments,
  createComment,
  deleteComment,
} from "../controllers/commentController";

const router = Router();

// GET /api/comments/:id (postId)
router.get("/:id", getComments);
// POST /api/comments/:id (postId)
router.post("/:id", authenticateToken, createComment);
// DELETE /api/comments/:commentId
router.delete("/:commentId", authenticateToken, deleteComment);

export default router;
