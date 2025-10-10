const { Router  } = require('express');
const { StatsController  } = require('../controllers/statsController');
const { rateLimiter  } = require('../middlewares/rateLimiter');
const { isAdmin, authMiddleware  } = require('../middlewares/auth');
const router = Router();
const statsController = new StatsController();
// 플랫폼 기본 통계 (공개)
router.get("/platform", rateLimiter(), statsController.getOverallStats);
// 상세 통계 (관리자만)
router.get("/detailed", rateLimiter(), isAdmin, statsController.getLevelDistribution);
// 사용자 개인 통계 (인증된 사용자만)
router.get("/user", rateLimiter(), authMiddleware, statsController.getUserStats);
module.exports = router;
