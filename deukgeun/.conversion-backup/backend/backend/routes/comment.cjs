const { Router  } = require('express');
const { authMiddleware  } = require('../middlewares/auth');
const { CommentController  } = require('../controllers/commentController');
const router = Router();
const commentController = new CommentController();
// GET /api/comments/:id (postId)
router.get("/:id", commentController.getCommentsByPostId);
// POST /api/comments/:id (postId)
router.post("/:id", authMiddleware, commentController.createComment);
// PUT /api/comments/:id (commentId)
router.put("/:id", authMiddleware, commentController.updateComment);
// DELETE /api/comments/:id (commentId)
router.delete("/:id", authMiddleware, commentController.deleteComment);
module.exports = router;
