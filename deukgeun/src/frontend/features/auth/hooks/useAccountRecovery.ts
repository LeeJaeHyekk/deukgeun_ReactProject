import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { showToast } from "@shared/lib"
import { authApi } from "../api/authApi"
import type {
  FindIdStep1Request,
  FindIdStep2Request,
  ResetPasswordStep3Request,
} from "../api/authApi"
import type {
  RecoveryState,
  RecoveryType,
  RecoveryStep,
  ResetPasswordStep1Request,
  ResetPasswordStep2Request,
  EmailBasedFindIdRequest,
  EmailBasedFindPasswordRequest,
  FindIdRequest,
  ResetPasswordRequest,
} from "../types/accountRecovery"

const initialState: RecoveryState = {
  step: "initial",
  type: "find-id",
  loading: false,
  error: null,
  verificationId: null,
  resetToken: null,
}

export function useAccountRecovery() {
  const [state, setState] = useState<RecoveryState>(initialState)
  const navigate = useNavigate()

  // 상태 업데이트 헬퍼
  const updateState = useCallback((updates: Partial<RecoveryState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  // 에러 처리 헬퍼
  const handleError = useCallback(
    (error: any, defaultMessage: string) => {
      const errorMessage = error.response?.data?.message || defaultMessage
      updateState({ error: errorMessage, loading: false })
      showToast(errorMessage, "error")
    },
    [updateState]
  )

  // 초기화
  const reset = useCallback((type: RecoveryType = "find-id") => {
    setState({ ...initialState, type })
  }, [])

  // 현재 구현된 이메일 기반 아이디 찾기 (하위 호환성)
  const findIdByEmail = useCallback(
    async (data: EmailBasedFindIdRequest) => {
      updateState({ loading: true, error: null })

      try {
        const response = await authApi.findId(data)

        if (response.success) {
          showToast(response.message, "success")
          navigate("/login")
        } else {
          handleError(response, "아이디 찾기에 실패했습니다.")
        }
      } catch (error) {
        handleError(error, "아이디 찾기에 실패했습니다.")
      }
    },
    [updateState, navigate, handleError]
  )

  // 현재 구현된 이메일 기반 비밀번호 찾기 (하위 호환성)
  const findPasswordByEmail = useCallback(
    async (data: EmailBasedFindPasswordRequest) => {
      updateState({ loading: true, error: null })

      try {
        const response = await authApi.findPassword(data)

        if (response.success) {
          showToast(response.message, "success")
          navigate("/login")
        } else {
          handleError(response, "비밀번호 찾기에 실패했습니다.")
        }
      } catch (error) {
        handleError(error, "비밀번호 찾기에 실패했습니다.")
      }
    },
    [updateState, navigate, handleError]
  )

  // 향후 구현될 단계별 아이디 찾기
  const findIdStep1 = useCallback(
    async (data: FindIdStep1Request) => {
      updateState({ loading: true, error: null })

      try {
        const response = await authApi.findIdStep1(data)

        if (response.success && response.data) {
          updateState({
            step: "code-input",
            verificationId: "temp-verification-id",
            loading: false,
          })
          showToast("인증 코드를 발송했습니다.", "success")
        } else {
          handleError(
            response,
            response.error || "인증 코드 발송에 실패했습니다."
          )
        }
      } catch (error) {
        handleError(error, "인증 코드 발송에 실패했습니다.")
      }
    },
    [updateState, handleError]
  )

  const findIdStep2 = useCallback(
    async (data: FindIdStep2Request) => {
      updateState({ loading: true, error: null })

      try {
        const response = await authApi.findIdStep2(data)

        if (response.success && response.data) {
          updateState({
            step: "result",
            loading: false,
          })
          showToast("아이디 찾기가 완료되었습니다.", "success")
        } else {
          handleError(
            response,
            response.error || "인증 코드 검증에 실패했습니다."
          )
        }
      } catch (error) {
        handleError(error, "인증 코드 검증에 실패했습니다.")
      }
    },
    [updateState, handleError]
  )

  // 향후 구현될 단계별 비밀번호 재설정
  const resetPasswordStep1 = useCallback(
    async (data: ResetPasswordStep1Request) => {
      updateState({ loading: true, error: null })

      try {
        const response = await authApi.resetPasswordStep1(data)

        if (response.success && response.data) {
          updateState({
            step: "code-input",
            verificationId: "temp-verification-id",
            loading: false,
          })
          showToast("인증 코드를 발송했습니다.", "success")
        } else {
          handleError(
            response,
            response.error || "인증 코드 발송에 실패했습니다."
          )
        }
      } catch (error) {
        handleError(error, "인증 코드 발송에 실패했습니다.")
      }
    },
    [updateState, handleError]
  )

  const resetPasswordStep2 = useCallback(
    async (data: ResetPasswordStep2Request) => {
      updateState({ loading: true, error: null })

      try {
        const response = await authApi.resetPasswordStep2(data)

        if (response.success && response.data) {
          updateState({
            step: "password-reset",
            resetToken: response.data.resetToken,
            loading: false,
          })
          showToast(
            "인증이 완료되었습니다. 새 비밀번호를 입력해주세요.",
            "success"
          )
        } else {
          handleError(
            response,
            response.error || "인증 코드 검증에 실패했습니다."
          )
        }
      } catch (error) {
        handleError(error, "인증 코드 검증에 실패했습니다.")
      }
    },
    [updateState, handleError]
  )

  const resetPasswordStep3 = useCallback(
    async (data: ResetPasswordStep3Request) => {
      updateState({ loading: true, error: null })

      try {
        const response = await authApi.resetPasswordStep3(data)

        if (response.success) {
          updateState({ loading: false })
          showToast("비밀번호가 성공적으로 변경되었습니다.", "success")
          navigate("/login")
        } else {
          handleError(
            response,
            response.error || "비밀번호 변경에 실패했습니다."
          )
        }
      } catch (error) {
        handleError(error, "비밀번호 변경에 실패했습니다.")
      }
    },
    [updateState, navigate, handleError]
  )

  // JSON 구조 기반 단순 아이디 찾기 (새로운 구현)
  const findIdSimple = useCallback(
    async (data: FindIdRequest) => {
      updateState({ loading: true, error: null })

      try {
        const response = await authApi.findIdSimple(data)

        if (response.success && response.data) {
          updateState({
            step: "result",
            loading: false,
            data: response.data,
          })
          showToast("아이디 찾기가 완료되었습니다.", "success")
        } else {
          handleError(response, response.error || "아이디 찾기에 실패했습니다.")
        }
      } catch (error) {
        handleError(error, "아이디 찾기에 실패했습니다.")
      }
    },
    [updateState, handleError]
  )

  // JSON 구조 기반 단순 비밀번호 재설정 Step 1: 사용자 인증
  const resetPasswordSimpleStep1 = useCallback(
    async (data: ResetPasswordStep1Request) => {
      updateState({ loading: true, error: null })

      try {
        const response = await authApi.resetPasswordSimpleStep1(data)

        if (response.success && response.data) {
          updateState({
            step: "verification",
            loading: false,
            data: response.data,
          })
          showToast(
            "사용자 인증이 완료되었습니다. 인증 코드를 확인하세요.",
            "success"
          )
        } else {
          handleError(response, response.error || "사용자 인증에 실패했습니다.")
        }
      } catch (error) {
        handleError(error, "사용자 인증에 실패했습니다.")
      }
    },
    [updateState, handleError]
  )

  // JSON 구조 기반 단순 비밀번호 재설정 Step 2: 비밀번호 재설정
  const resetPasswordSimpleStep2 = useCallback(
    async (data: ResetPasswordStep2Request) => {
      updateState({ loading: true, error: null })

      try {
        const response = await authApi.resetPasswordSimpleStep2(data)

        if (response.success && response.data) {
          updateState({
            step: "result",
            loading: false,
            data: response.data,
          })
          showToast("비밀번호가 성공적으로 재설정되었습니다.", "success")
        } else {
          handleError(
            response,
            response.error || "비밀번호 재설정에 실패했습니다."
          )
        }
      } catch (error) {
        handleError(error, "비밀번호 재설정에 실패했습니다.")
      }
    },
    [updateState, handleError]
  )

  // 단계별 네비게이션
  const goToStep = useCallback(
    (step: RecoveryStep) => {
      updateState({ step, error: null })
    },
    [updateState]
  )

  const goBack = useCallback(() => {
    const stepOrder: RecoveryStep[] = [
      "initial",
      "verification",
      "code-input",
      "result",
      "password-reset",
    ]
    const currentIndex = stepOrder.indexOf(state.step)

    if (currentIndex > 0) {
      const prevStep = stepOrder[currentIndex - 1]
      updateState({ step: prevStep, error: null })
    }
  }, [state.step, updateState])

  return {
    // 상태
    state,

    // 액션
    reset,
    findIdByEmail,
    findPasswordByEmail,
    findIdStep1,
    findIdStep2,
    resetPasswordStep1,
    resetPasswordStep2,
    resetPasswordStep3,
    findIdSimple,
    resetPasswordSimpleStep1,
    resetPasswordSimpleStep2,
    goToStep,
    goBack,

    // 헬퍼
    updateState,
    handleError,
  }
}
