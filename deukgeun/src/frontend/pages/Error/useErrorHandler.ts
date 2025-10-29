import { useCallback, useState } from "react"
import { useNavigate } from "react-router-dom"
import { reportError, navigateToError, ERROR_CONFIGS } from "./index"

interface UseErrorHandlerOptions {
  enableAutoReporting?: boolean
  enableUserNotification?: boolean
  customErrorMessages?: Record<number, string>
}

interface ErrorState {
  hasError: boolean
  error?: Error
  statusCode?: number
  message?: string
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const navigate = useNavigate()
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
  })

  const {
    enableAutoReporting = true,
    enableUserNotification = true,
    customErrorMessages = {},
  } = options

  // 에러 처리 함수
  const handleError = useCallback(
    (error: Error, statusCode?: number) => {
      console.error("Error handled by useErrorHandler:", error)

      // 에러 상태 업데이트
      setErrorState({
        hasError: true,
        error,
        statusCode,
        message: error.message,
      })

      // 자동 에러 리포팅
      if (enableAutoReporting) {
        reportError(error, { errorType: "javascript" })
      }

      // 사용자 알림
      if (enableUserNotification) {
        const message = customErrorMessages[statusCode || 500] || error.message
        // 토스트 메시지 표시 (기존 토스트 시스템 활용)
        if (typeof window !== "undefined" && "showToast" in window) {
          (window as any).showToast(message, "error")
        }
      }
    },
    [enableAutoReporting, enableUserNotification, customErrorMessages]
  )

  // HTTP 에러 처리 함수
  const handleHttpError = useCallback(
    (statusCode: number, message?: string) => {
      const errorConfig =
        ERROR_CONFIGS[statusCode as keyof typeof ERROR_CONFIGS]
      const errorMessage =
        message || errorConfig?.message || "알 수 없는 오류가 발생했습니다."

      const error = new Error(errorMessage)
      error.name = `HTTPError${statusCode}`

      handleError(error, statusCode)

      // 특정 상태 코드에 따른 자동 처리
      switch (statusCode) {
        case 401:
          // 현재 경로가 로그인 페이지가 아닌 경우에만 리다이렉트
          if (window.location.pathname !== '/login') {
            navigate("/login", { replace: true })
          }
          break
        case 403:
          // 권한 에러 시 홈으로 리다이렉트
          navigate("/", { replace: true })
          break
        case 404:
          // 404 에러 시 에러 페이지로 이동
          navigateToError(navigate, 404)
          break
        case 500:
        case 502:
        case 503:
          // 서버 에러 시 에러 페이지로 이동
          navigateToError(navigate, statusCode)
          break
      }
    },
    [handleError, navigate]
  )

  // 네트워크 에러 처리 함수
  const handleNetworkError = useCallback(
    (error: Error) => {
      console.error("Network error:", error)

      setErrorState({
        hasError: true,
        error,
        statusCode: 0,
        message: "네트워크 연결에 문제가 있습니다. 인터넷 연결을 확인해주세요.",
      })

      if (enableAutoReporting) {
        reportError(error, { errorType: "network" })
      }

      if (enableUserNotification) {
        if (typeof window !== "undefined" && "showToast" in window) {
          (window as any).showToast("네트워크 연결을 확인해주세요.", "error")
        }
      }
    },
    [enableAutoReporting, enableUserNotification]
  )

  // API 에러 처리 함수
  const handleApiError = useCallback(
    (error: any) => {
      let statusCode = 500
      let message = "서버 오류가 발생했습니다."

      // Axios 에러 처리
      if (error.response) {
        statusCode = error.response.status
        message =
          error.response.data?.message || error.response.data?.error || message
      } else if (error.request) {
        // 네트워크 에러
        handleNetworkError(new Error("네트워크 요청에 실패했습니다."))
        return
      } else {
        // 기타 에러
        message = error.message || message
      }

      handleHttpError(statusCode, message)
    },
    [handleHttpError, handleNetworkError]
  )

  // 에러 상태 리셋
  const resetError = useCallback(() => {
    setErrorState({
      hasError: false,
    })
  }, [])

  // 에러 복구 시도
  const retry = useCallback(() => {
    resetError()
    // 페이지 새로고침 또는 재시도 로직
    window.location.reload()
  }, [resetError])

  // 에러가 있는지 확인하는 헬퍼 함수
  const hasError = errorState.hasError

  // 에러 정보 반환
  const errorInfo = {
    error: errorState.error,
    statusCode: errorState.statusCode,
    message: errorState.message,
  }

  return {
    // 상태
    hasError,
    errorInfo,

    // 에러 처리 함수들
    handleError,
    handleHttpError,
    handleNetworkError,
    handleApiError,

    // 에러 복구 함수들
    resetError,
    retry,
  }
}

// 특정 기능별 에러 처리 훅들
export function useAuthErrorHandler() {
  return useErrorHandler({
    enableAutoReporting: true,
    enableUserNotification: true,
    customErrorMessages: {
      401: "로그인이 필요합니다.",
      403: "접근 권한이 없습니다.",
      409: "이미 존재하는 계정입니다.",
    },
  })
}

export function useApiErrorHandler() {
  return useErrorHandler({
    enableAutoReporting: true,
    enableUserNotification: true,
    customErrorMessages: {
      400: "잘못된 요청입니다.",
      422: "입력 데이터가 올바르지 않습니다.",
      429: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
      500: "서버 오류가 발생했습니다.",
      502: "서버가 일시적으로 사용할 수 없습니다.",
      503: "서비스가 점검 중입니다.",
    },
  })
}

export function useFormErrorHandler() {
  return useErrorHandler({
    enableAutoReporting: false, // 폼 에러는 자동 리포팅하지 않음
    enableUserNotification: true,
    customErrorMessages: {
      400: "입력 정보를 확인해주세요.",
      422: "입력 형식이 올바르지 않습니다.",
    },
  })
}
