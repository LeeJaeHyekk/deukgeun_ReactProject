const { Router  } = require('express');
const { authMiddleware  } = require('../middlewares/auth');
const { LikeController  } = require('../controllers/likeController');
const router = Router();
const likeController = new LikeController();
// POST /api/likes/:id - 좋아요 토글 (추가/제거)
router.post("/:id", authMiddleware, likeController.toggleLike);
// DELETE /api/likes/:id - 좋아요 토글 (추가/제거) - 호환성을 위해 유지
router.delete("/:id", authMiddleware, likeController.toggleLike);
module.exports = router;
