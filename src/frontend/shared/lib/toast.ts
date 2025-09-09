// ============================================================================
// Frontend 토스트 유틸리티
// ============================================================================

export type ToastType = "success" | "error" | "warning" | "info"

export interface ToastOptions {
  duration?: number
  position?: "top" | "bottom" | "center"
  action?: {
    label: string
    onClick: () => void
  }
}

export interface Toast {
  id: string
  type: ToastType
  title: string
  message: string
  duration: number
  position: "top" | "bottom" | "center"
  action?: {
    label: string
    onClick: () => void
  }
}

// 토스트 상태 관리
let toasts: Toast[] = []
let toastListeners: ((toasts: Toast[]) => void)[] = []

// 토스트 ID 생성
const generateToastId = (): string => {
  return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// 토스트 추가
const addToast = (toast: Omit<Toast, "id">): string => {
  const id = generateToastId()
  const newToast: Toast = {
    id,
    ...toast,
  }

  toasts = [...toasts, newToast]
  notifyListeners()

  // 자동 제거
  if (newToast.duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, newToast.duration)
  }

  return id
}

// 토스트 제거
const removeToast = (id: string): void => {
  toasts = toasts.filter(toast => toast.id !== id)
  notifyListeners()
}

// 리스너 알림
const notifyListeners = (): void => {
  toastListeners.forEach(listener => listener([...toasts]))
}

// 토스트 표시 함수들
export const showToast = (
  message: string,
  type: ToastType = "info",
  options: ToastOptions = {}
): string => {
  const { duration = 3000, position = "top", action } = options

  return addToast({
    type,
    title:
      type === "error"
        ? "오류"
        : type === "success"
          ? "성공"
          : type === "warning"
            ? "경고"
            : "알림",
    message,
    duration,
    position,
    action: action || undefined,
  })
}

export const showSuccessToast = (
  message: string,
  options?: ToastOptions
): string => {
  return showToast(message, "success", { duration: 2000, ...options })
}

export const showErrorToast = (
  message: string,
  options?: ToastOptions
): string => {
  return showToast(message, "error", { duration: 5000, ...options })
}

export const showWarningToast = (
  message: string,
  options?: ToastOptions
): string => {
  return showToast(message, "warning", { duration: 4000, ...options })
}

export const showInfoToast = (
  message: string,
  options?: ToastOptions
): string => {
  return showToast(message, "info", { duration: 3000, ...options })
}

// 토스트 구독
export const subscribeToToasts = (
  listener: (toasts: Toast[]) => void
): (() => void) => {
  toastListeners.push(listener)

  // 초기 상태 전달
  listener([...toasts])

  // 구독 해제 함수 반환
  return () => {
    toastListeners = toastListeners.filter(l => l !== listener)
  }
}

// 토스트 제거
export const dismissToast = (id: string): void => {
  removeToast(id)
}

// 모든 토스트 제거
export const clearAllToasts = (): void => {
  toasts = []
  notifyListeners()
}

// 현재 토스트 목록 가져오기
export const getCurrentToasts = (): Toast[] => {
  return [...toasts]
}
