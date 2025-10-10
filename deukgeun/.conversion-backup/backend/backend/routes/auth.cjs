const { Router  } = require('express');
const { login, register, refreshToken, logout, checkAuth, findId, findPassword, findIdStep1, findIdStep2, resetPasswordStep1, resetPasswordStep2, resetPasswordStep3, findIdSimple, resetPasswordSimpleStep1, resetPasswordSimpleStep2,  } = require('../controllers/authController');
const { authMiddleware  } = require('../middlewares/auth');
const { recaptchaEnterpriseMiddleware  } = require('../utils/recaptcha-enterprise');
const router = Router();
router.post("/login", recaptchaEnterpriseMiddleware("LOGIN", 0.5), login);
router.post("/register", recaptchaEnterpriseMiddleware("REGISTER", 0.7), register);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.get("/check", authMiddleware, checkAuth);
router.post("/find-id", findId);
router.post("/find-password", findPassword);
// JSON 구조 기반 단순 계정 복구 라우트
router.post("/find-id-simple", findIdSimple);
// JSON 구조 기반 단순 비밀번호 재설정 (2단계)
router.post("/reset-password-simple-step1", resetPasswordSimpleStep1);
router.post("/reset-password-simple-step2", resetPasswordSimpleStep2);
// Enhanced Account Recovery Routes
router.post("/find-id/verify-user", findIdStep1);
router.post("/find-id/verify-code", findIdStep2);
router.post("/reset-password/verify-user", resetPasswordStep1);
router.post("/reset-password/verify-code", resetPasswordStep2);
router.post("/reset-password/complete", resetPasswordStep3);
module.exports = router;
