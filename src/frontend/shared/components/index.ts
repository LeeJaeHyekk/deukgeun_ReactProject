// ============================================================================
// Shared Components Index
// ============================================================================

// UI Components
export { Button } from "./ui/Button"
export { Modal } from "./ui/Modal"
export { LoadingSpinner } from "./ui/LoadingSpinner"
export { LoadingOverlay } from "./ui/LoadingOverlay"

// Layout Components
export { Navigation } from "../../widgets/Navigation/Navigation"

// Form Components
export { RecaptchaWidget } from "./RecaptchaWidget"
export { LevelDisplay } from "./LevelDisplay"

// Error Handling
export { useErrorHandler, useAuthErrorHandler, useApiErrorHandler, useFormErrorHandler } from "./useErrorHandler"

// Error handling utilities
export const reportError = (error: Error, context?: any) => {
  console.error('Error reported:', error, context)
  // 실제 환경에서는 Sentry나 다른 에러 리포팅 서비스로 전송
}

export const navigateToError = (navigate: any, statusCode: number) => {
  navigate(`/error?code=${statusCode}`, { replace: true })
}

export const ERROR_CONFIGS = {
  400: { message: "잘못된 요청입니다." },
  401: { message: "인증이 필요합니다." },
  403: { message: "접근 권한이 없습니다." },
  404: { message: "요청한 페이지를 찾을 수 없습니다." },
  409: { message: "이미 존재하는 데이터입니다." },
  422: { message: "입력 데이터가 올바르지 않습니다." },
  429: { message: "요청이 너무 많습니다." },
  500: { message: "서버 오류가 발생했습니다." },
  502: { message: "서버가 일시적으로 사용할 수 없습니다." },
  503: { message: "서비스가 점검 중입니다." },
} as const
