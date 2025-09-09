// ============================================================================
// Frontend 토스트 유틸리티 (기존 호환성)
// ============================================================================

import { showToast as showToastUtil } from "../shared/lib/toast"

// 기존 코드와의 호환성을 위한 래퍼 함수들
export const showToast = (
  message: string,
  type: "success" | "error" | "warning" | "info" = "info"
) => {
  return showToastUtil(message, type)
}

export const showSuccessToast = (message: string) => {
  return showToastUtil(message, "success")
}

export const showErrorToast = (message: string) => {
  return showToastUtil(message, "error")
}

export const showWarningToast = (message: string) => {
  return showToastUtil(message, "warning")
}

export const showInfoToast = (message: string) => {
  return showToastUtil(message, "info")
}
