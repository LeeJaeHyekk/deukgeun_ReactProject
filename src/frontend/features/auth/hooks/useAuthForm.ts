// ============================================================================
// 인증 폼 훅
// ============================================================================

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  loginSchema,
  registerSchema,
} from "../../../shared/validation/schemas.js"
import type {
  LoginFormData,
  RegisterFormData,
} from "../../../shared/validation/schemas.js"

export function useAuthForm(type: "login" | "register") {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const schema = type === "login" ? loginSchema : registerSchema
  const form = useForm<LoginFormData | RegisterFormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
  })

  const handleSubmit = async (data: LoginFormData | RegisterFormData) => {
    try {
      setIsLoading(true)
      setError(null)

      // 실제 API 호출은 부모 컴포넌트에서 처리
      console.log("Form data:", data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다"
      )
    } finally {
      setIsLoading(false)
    }
  }

  return {
    form,
    isLoading,
    error,
    setError,
    handleSubmit: form.handleSubmit(handleSubmit),
  }
}
