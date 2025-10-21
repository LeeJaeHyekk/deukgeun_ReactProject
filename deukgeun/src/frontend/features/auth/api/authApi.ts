// features/auth/api/authApi.ts
import { api } from '@frontend/shared/api'
import { API_ENDPOINTS } from '@frontend/shared/config'
import axios from 'axios'
import { config } from '@frontend/shared/config'
import {
  SIGNUP_VALIDATION_MESSAGES,
  HTTP_ERROR_MESSAGES,
  ERROR_TOAST_TYPES,
} from '@frontend/shared/constants/validation'
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  RefreshResponse,
  LogoutResponse,
  AccountRecoveryRequest,
} from '@frontend/shared/types/auth'

// 백엔드 API 응답과 프론트엔드 타입 간의 호환성을 위한 타입 정의
export interface ApiLoginResponse {
  message: string
  accessToken: string
  user: {
    id: number
    email: string
    nickname: string
  }
}

// 백엔드 실제 응답 타입
export interface BackendLoginResponse {
  success: boolean
  message: string
  accessToken: string
  user: {
    id: number
    email: string
    nickname: string
  }
}

// 백엔드 회원가입 응답 타입
export interface BackendRegisterResponse {
  success: boolean
  message: string
  accessToken: string
  user: {
    id: number
    email: string
    nickname: string
    phone?: string
    gender?: string
    birthday?: string
    profileImage?: string
    createdAt: string
    updatedAt: string
  }
}

// API 응답 래퍼 타입
export interface ApiResponseWrapper<T> {
  success: boolean
  message: string
  data?: T
  error?: string
}

export interface ApiRegisterResponse {
  message: string
  accessToken: string
  user: {
    id: number
    email: string
    nickname: string
  }
}

// 아이디/비밀번호 찾기 요청 타입 (프론트엔드 전용)
export interface FindIdRequest {
  email: string
  recaptchaToken: string
}

export interface FindPasswordRequest {
  email: string
  recaptchaToken: string
}

// Enhanced Account Recovery Request Types
export interface FindIdStep1Request {
  name: string
  phone: string
  recaptchaToken: string
}

export interface FindIdStep2Request {
  verificationId: string
  verificationCode: string
}

export interface ResetPasswordStep1Request {
  username: string
  name: string
  phone: string
  gender?: 'male' | 'female' | 'other'
  birthday?: string
  recaptchaToken: string
}

export interface ResetPasswordStep2Request {
  username: string
  code: string
  newPassword: string
  confirmPassword: string
  recaptchaToken: string
}

export interface ResetPasswordStep3Request {
  resetToken: string
  newPassword: string
  confirmPassword: string
}

// Auth API functions
export const authApi = {
  // Login
  login: async (data: LoginRequest): Promise<ApiLoginResponse> => {
    console.log('✅ 로그인 요청:', data)
    const response = await axios.post<{
      success: boolean
      message: string
      data: {
        accessToken: string
        refreshToken: string
        user: {
          id: number
          email: string
          nickname: string
        }
      }
    }>(
      `${config.api.baseURL}${API_ENDPOINTS.AUTH.LOGIN}`,
      data
    )
    console.log('✅ 로그인 응답:', response)
    console.log('✅ 로그인 응답 데이터:', response.data)
    
    // 백엔드 응답 구조에 맞게 수정 - data 필드에서 추출
    if (response.data.success && response.data.data) {
      return {
        message: response.data.message,
        accessToken: response.data.data.accessToken,
        user: response.data.data.user,
      }
    } else {
      throw new Error(response.data.message || '로그인에 실패했습니다.')
    }
  },

  // Register
  register: async (data: RegisterRequest): Promise<ApiRegisterResponse> => {
    console.log('📡 회원가입 API 호출 시작')
    console.log('📡 요청 URL:', API_ENDPOINTS.AUTH.REGISTER)
    console.log('📡 config.api.baseURL:', config.api.baseURL)
    console.log('📡 전체 요청 URL:', `${config.api.baseURL}${API_ENDPOINTS.AUTH.REGISTER}`)
    console.log('📡 요청 데이터:', {
      email: data.email,
      nickname: data.nickname,
      phone: data.phone,
      gender: data.gender,
      birthday: data.birthday,
      recaptchaToken: data.recaptchaToken
        ? data.recaptchaToken.substring(0, 20) + '...'
        : '없음',
    })

    try {
      const fullUrl = `${config.api.baseURL}${API_ENDPOINTS.AUTH.REGISTER}`
      console.log('📡 실제 요청할 전체 URL:', fullUrl)
      
      const response = await axios.post<BackendRegisterResponse>(
        fullUrl,
        data
      )
      console.log('✅ 회원가입 API 응답 성공:', response)
      console.log('✅ 응답 데이터:', response.data)

      // 백엔드 응답 구조에 맞게 처리
      const responseData = response.data as BackendRegisterResponse
      if (responseData.success) {
        return {
          message: responseData.message,
          accessToken: responseData.accessToken,
          user: responseData.user,
        } as ApiRegisterResponse
      } else {
        throw new Error(responseData.message || '회원가입에 실패했습니다.')
      }
    } catch (error) {
      console.error('❌ 회원가입 API 실패:', error)
      console.error('❌ API 에러 상세:', {
        status: (error as { response?: { status: number } })?.response?.status,
        statusText: (error as { response?: { statusText: string } })?.response
          ?.statusText,
        data: (error as { response?: { data: unknown } })?.response?.data,
        url: (error as { config?: { url: string } })?.config?.url,
        method: (error as { config?: { method: string } })?.config?.method,
      })

      // 백엔드 에러 메시지 추출
      const axiosError = error as any
      if (axiosError?.response?.data?.message) {
        throw new Error(axiosError.response.data.message)
      } else if (axiosError?.response?.data?.error) {
        throw new Error(axiosError.response.data.error)
      } else if (axiosError?.response?.status === 409) {
        // 409 Conflict 에러 처리
        if (axiosError.response.data.error === '이메일 중복') {
          throw new Error(SIGNUP_VALIDATION_MESSAGES.EMAIL_ALREADY_EXISTS)
        } else if (axiosError.response.data.error === '닉네임 중복') {
          throw new Error(SIGNUP_VALIDATION_MESSAGES.NICKNAME_ALREADY_EXISTS)
        } else {
          throw new Error(HTTP_ERROR_MESSAGES[409])
        }
      } else if (axiosError?.response?.status === 400) {
        throw new Error(SIGNUP_VALIDATION_MESSAGES.VALIDATION_ERROR)
      } else if (axiosError?.response?.status === 403) {
        throw new Error(SIGNUP_VALIDATION_MESSAGES.SECURITY_ERROR)
      } else if (axiosError?.response?.status >= 500) {
        throw new Error(SIGNUP_VALIDATION_MESSAGES.SERVER_ERROR)
      } else {
        throw new Error(SIGNUP_VALIDATION_MESSAGES.GENERAL_ERROR)
      }
    }
  },

  // Find ID
  findId: async (
    data: FindIdRequest
  ): Promise<ApiResponseWrapper<{ email: string; nickname: string }>> => {
    console.log('✅ 아이디 찾기 요청:', data)
    const response = await axios.post<
      ApiResponseWrapper<{ email: string; nickname: string }>
    >(`${config.api.baseURL}${API_ENDPOINTS.AUTH.FIND_ID}`, data)
    console.log('✅ 아이디 찾기 응답:', response)
    return response.data
  },

  // Find Password
  findPassword: async (
    data: FindPasswordRequest
  ): Promise<ApiResponseWrapper<{ email: string; nickname: string }>> => {
    console.log('✅ 비밀번호 찾기 요청:', data)
    const response = await axios.post<
      ApiResponseWrapper<{ email: string; nickname: string }>
    >(`${config.api.baseURL}${API_ENDPOINTS.AUTH.FIND_PASSWORD}`, data)
    console.log('✅ 비밀번호 찾기 응답:', response)
    return response.data
  },

  // Enhanced Account Recovery APIs

  // JSON 구조 기반 단순 아이디 찾기 (새로운 구현)
  findIdSimple: async (
    data: FindIdRequest
  ): Promise<ApiResponseWrapper<{ username: string }>> => {
    console.log('✅ 단순 아이디 찾기 요청:', data)
    const response = await axios.post<ApiResponseWrapper<{ username: string }>>(
      `${config.api.baseURL}${API_ENDPOINTS.AUTH.FIND_ID_SIMPLE}`,
      data
    )
    console.log('✅ 단순 아이디 찾기 응답:', response)
    return response.data
  },

  // JSON 구조 기반 단순 비밀번호 재설정 Step 1: 사용자 인증
  resetPasswordSimpleStep1: async (
    data: ResetPasswordStep1Request
  ): Promise<
    ApiResponseWrapper<{
      email: string
      nickname: string
      maskedEmail: string
      maskedPhone: string
      verificationCode: string
    }>
  > => {
    console.log('✅ 단순 비밀번호 재설정 Step 1 요청:', data)
    const response = await axios.post<
      ApiResponseWrapper<{
        email: string
        nickname: string
        maskedEmail: string
        maskedPhone: string
        verificationCode: string
      }>
    >(
      `${config.api.baseURL}${API_ENDPOINTS.AUTH.RESET_PASSWORD_SIMPLE_STEP1}`,
      data
    )
    console.log('✅ 단순 비밀번호 재설정 Step 1 응답:', response)
    return response.data
  },

  // JSON 구조 기반 단순 비밀번호 재설정 Step 2: 비밀번호 재설정
  resetPasswordSimpleStep2: async (
    data: ResetPasswordStep2Request
  ): Promise<ApiResponseWrapper<{ message: string }>> => {
    console.log('✅ 단순 비밀번호 재설정 Step 2 요청:', data)
    const response = await axios.post<ApiResponseWrapper<{ message: string }>>(
      `${config.api.baseURL}${API_ENDPOINTS.AUTH.RESET_PASSWORD_SIMPLE_STEP2}`,
      data
    )
    console.log('✅ 단순 비밀번호 재설정 Step 2 응답:', response)
    return response.data
  },

  // Find ID Step 1: Verify user by name and phone (향상된 버전)
  findIdStep1: async (
    data: FindIdStep1Request
  ): Promise<
    ApiResponseWrapper<{
      email: string
      nickname: string
      maskedEmail: string
      maskedPhone: string
    }>
  > => {
    console.log('✅ 아이디 찾기 Step 1 요청:', data)
    const response = await axios.post<
      ApiResponseWrapper<{
        email: string
        nickname: string
        maskedEmail: string
        maskedPhone: string
      }>
    >(`${config.api.baseURL}${API_ENDPOINTS.AUTH.FIND_ID_SIMPLE}`, data)
    console.log('✅ 아이디 찾기 Step 1 응답:', response)
    return response.data
  },

  // Find ID Step 2: Verify code and return user info
  findIdStep2: async (
    data: FindIdStep2Request
  ): Promise<ApiResponseWrapper<{ email: string; nickname: string }>> => {
    console.log('✅ 아이디 찾기 Step 2 요청:', data)
    const response = await axios.post<
      ApiResponseWrapper<{ email: string; nickname: string }>
    >(`${config.api.baseURL}${API_ENDPOINTS.AUTH.FIND_ID_SIMPLE}`, data)
    console.log('✅ 아이디 찾기 Step 2 응답:', response)
    return response.data
  },

  // Reset Password Step 1: Verify user by name and phone
  resetPasswordStep1: async (
    data: ResetPasswordStep1Request
  ): Promise<
    ApiResponseWrapper<{
      email: string
      nickname: string
      maskedEmail: string
      maskedPhone: string
    }>
  > => {
    console.log('✅ 비밀번호 재설정 Step 1 요청:', data)
    const response = await axios.post<
      ApiResponseWrapper<{
        email: string
        nickname: string
        maskedEmail: string
        maskedPhone: string
      }>
    >(
      `${config.api.baseURL}${API_ENDPOINTS.AUTH.RESET_PASSWORD_SIMPLE_STEP1}`,
      data
    )
    console.log('✅ 비밀번호 재설정 Step 1 응답:', response)
    return response.data
  },

  // Reset Password Step 2: Verify code and generate reset token
  resetPasswordStep2: async (
    data: ResetPasswordStep2Request
  ): Promise<ApiResponseWrapper<{ resetToken: string }>> => {
    console.log('✅ 비밀번호 재설정 Step 2 요청:', data)
    const response = await axios.post<
      ApiResponseWrapper<{ resetToken: string }>
    >(
      `${config.api.baseURL}${API_ENDPOINTS.AUTH.RESET_PASSWORD_VERIFY_CODE}`,
      data
    )
    console.log('✅ 비밀번호 재설정 Step 2 응답:', response)
    return response.data
  },

  // Reset Password Step 3: Complete password reset
  resetPasswordStep3: async (
    data: ResetPasswordStep3Request
  ): Promise<ApiResponseWrapper<void>> => {
    console.log('✅ 비밀번호 재설정 Step 3 요청:', data)
    const response = await axios.post<ApiResponseWrapper<void>>(
      `${config.api.baseURL}${API_ENDPOINTS.AUTH.RESET_PASSWORD_COMPLETE}`,
      data
    )
    console.log('✅ 비밀번호 재설정 Step 3 응답:', response)
    return response.data
  },

  // Refresh token
  refreshToken: async (): Promise<RefreshResponse> => {
    console.log('🔄 refreshToken API 호출 시작')
    console.log('🔄 호출 URL:', API_ENDPOINTS.AUTH.REFRESH)
    console.log(
      '🔄 API_BASE_URL:',
      import.meta.env.VITE_BACKEND_URL
    )

    try {
      const response = await api.post<RefreshResponse>(
        API_ENDPOINTS.AUTH.REFRESH
      )
      console.log('✅ refreshToken API 성공:', response)
      return response.data as RefreshResponse
    } catch (error: unknown) {
      console.error('❌ refreshToken API 실패:', error)
      console.error('❌ 에러 상세:', {
        status: (error as { response?: { status: number } })?.response?.status,
        statusText: (error as { response?: { statusText: string } })?.response
          ?.statusText,
        data: (error as { response?: { data: unknown } })?.response?.data,
        url: (error as { config?: { url: string } })?.config?.url,
        method: (error as { config?: { method: string } })?.config?.method,
      })
      throw error
    }
  },

  // Logout
  logout: async (): Promise<LogoutResponse> => {
    const response = await axios.post<LogoutResponse>(
      `${config.api.baseURL}${API_ENDPOINTS.AUTH.LOGOUT}`
    )
    return response.data as LogoutResponse
  },

  // Check if user is authenticated
  checkAuth: async (): Promise<{ message: string; authenticated: boolean }> => {
    const response = await axios.get<{
      message: string
      authenticated: boolean
    }>(`${config.api.baseURL}${API_ENDPOINTS.AUTH.CHECK}`)
    return response.data as { message: string; authenticated: boolean }
  },
}
