// ============================================================================
// Auth 모듈 인덱스
// ============================================================================

// Auth 관련 라우트
export { default as authRoutes } from "@backend/routes/auth"

// Auth 컨트롤러 함수들
export { 
  login, 
  refreshToken, 
  logout, 
  checkAuth 
} from "@backend/controllers/authController"

// Auth 서비스
export { accountRecoveryService } from "@backend/services/accountRecoveryService"
export { emailService } from "@backend/services/emailService"

// Auth 미들웨어
export { authMiddleware, optionalAuth, isAdmin } from "@backend/middlewares/auth"

// Auth 유틸리티
export { createTokens, verifyRefreshToken } from "@backend/utils/jwt"

// Auth 엔티티
export { User } from "@backend/entities/User"
export { PasswordResetToken } from "@backend/entities/PasswordResetToken"
export { VerificationToken } from "@backend/entities/VerificationToken"
