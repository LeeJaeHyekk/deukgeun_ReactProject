const { Router  } = require('express');
const { HomePageController  } = require('../controllers/homePageController');
const { rateLimiter  } = require('../middlewares/rateLimiter');
const { isAdmin, authMiddleware  } = require('../middlewares/auth');
const router = Router();
const homePageController = new HomePageController();
// 홈페이지 설정 조회 (공개)
router.get("/config", rateLimiter(), homePageController.getHomePageConfig);
// 홈페이지 설정 업데이트 (관리자만)
router.put("/config", rateLimiter(), authMiddleware, isAdmin, homePageController.updateHomePageConfig);
// 홈페이지 설정 일괄 업데이트 (관리자만)
router.put("/config/batch", rateLimiter(), authMiddleware, isAdmin, homePageController.updateMultipleConfigs);
module.exports = router;
