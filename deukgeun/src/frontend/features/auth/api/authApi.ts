// features/auth/api/authApi.ts
import { api } from '@shared/api'
import { API_ENDPOINTS } from '@frontend/shared/config'
import axios from 'axios'
import { config } from '@shared/config'
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
  AccountRecoveryRequest,
} from '@shared/types'

// 추가 타입 정의
export interface RefreshResponse {
  success: boolean
  message: string
  accessToken: string
}

export interface LogoutResponse {
  success: boolean
  message: string
}

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

// 단순 아이디 찾기 요청 타입 (새로운 구현)
export interface FindIdSimpleRequest {
  name: string
  phone: string
  gender?: 'male' | 'female' | 'other'
  birthday?: string
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
    const response = await axios.post<BackendLoginResponse>(
      `${config.api.baseURL}${API_ENDPOINTS.AUTH.LOGIN}`,
      data
    )
    console.log('✅ 로그인 응답:', response)
    // 백엔드 응답 구조에 맞게 수정 - data 필드 없이 직접 반환
    return {
      message: response.data.message,
      accessToken: response.data.accessToken,
      user: response.data.user,
    }
  },

  // Register
  register: async (data: RegisterRequest): Promise<ApiRegisterResponse> => {
    console.log('📡 회원가입 API 호출 시작')
    console.log(
      '🔧 [변경사항] API 응답 처리 로직 수정됨 - response.data → response 직접 사용'
    )
    console.log('📡 요청 URL:', API_ENDPOINTS.AUTH.REGISTER)
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
      const response = await api.post<BackendRegisterResponse>(
        API_ENDPOINTS.AUTH.REGISTER,
        data
      )
      console.log('✅ 회원가입 API 응답 성공:', response)
      console.log('✅ 응답 데이터:', response.data)
      console.log(
        '🔧 [변경사항] 기존 로직: response.data 사용 → 새로운 로직: response 직접 사용'
      )

      // 응답 데이터 존재 여부 확인
      if (!response) {
        console.error('❌ API 응답이 비어있음:', response)
        throw new Error('서버에서 응답을 받지 못했습니다. 다시 시도해주세요.')
      }

      // 백엔드 응답 구조에 맞게 처리
      // 🔧 [변경사항] response.data 대신 response 자체를 BackendRegisterResponse로 캐스팅
      console.log('🔧 [변경사항] response.data 사용 중단, response 직접 사용')
      const responseData = response as BackendRegisterResponse

      console.log('🔍 응답 데이터 구조 확인:', {
        hasSuccess: 'success' in responseData,
        hasMessage: 'message' in responseData,
        hasAccessToken: 'accessToken' in responseData,
        hasUser: 'user' in responseData,
        success: responseData.success,
        message: responseData.message,
        responseKeys: Object.keys(responseData),
      })

      console.log(
        '🔧 [변경사항] 응답 구조 분석 완료 - 백엔드 응답이 직접 포함되어 있음'
      )

      if (responseData.success) {
        console.log(
          '🔧 [변경사항] 성공 응답 처리 - responseData에서 직접 데이터 추출'
        )
        console.log('🔧 [변경사항] 추출된 데이터:', {
          message: responseData.message,
          hasAccessToken: !!responseData.accessToken,
          hasUser: !!responseData.user,
          userKeys: responseData.user
            ? Object.keys(responseData.user)
            : 'no user',
        })

        const result = {
          message: responseData.message,
          accessToken: responseData.accessToken,
          user: responseData.user,
        } as ApiRegisterResponse

        console.log('🔧 [변경사항] 최종 반환 데이터 준비 완료')
        return result
      } else {
        console.log('🔧 [변경사항] 실패 응답 처리')
        throw new Error(responseData.message || '회원가입에 실패했습니다.')
      }
    } catch (error) {
      console.error('❌ 회원가입 API 실패:', error)
      console.log(
        '🔧 [변경사항] 에러 처리 - 기존 response.data 구조 문제로 인한 수정'
      )
      console.error('❌ API 에러 상세:', {
        status: (error as { response?: { status: number } })?.response?.status,
        statusText: (error as { response?: { statusText: string } })?.response
          ?.statusText,
        data: (error as { response?: { data: unknown } })?.response?.data,
        url: (error as { config?: { url: string } })?.config?.url,
        method: (error as { config?: { method: string } })?.config?.method,
      })

      // 백엔드 에러 메시지 추출 (fetch API 사용으로 인한 구조 변경)
      const fetchError = error as any
      console.log(
        '🔧 [변경사항] fetch API 에러 구조로 변경 - axiosError → fetchError'
      )
      console.log('🔧 [변경사항] 에러 객체 구조:', {
        message: fetchError.message,
        status: fetchError.status,
        statusText: fetchError.statusText,
        data: fetchError.data,
        hasData: !!fetchError.data,
      })

      // 에러 메시지가 이미 추출되어 있는 경우
      if (fetchError.message && !fetchError.message.includes('HTTP error!')) {
        console.log('🔧 [변경사항] 에러 메시지 직접 사용:', fetchError.message)
        throw new Error(fetchError.message)
      }

      // 상태 코드별 에러 처리
      if (fetchError.status === 409) {
        console.log('🔧 [변경사항] 409 Conflict 에러 처리')
        if (
          fetchError.data?.error === '이메일 중복' ||
          fetchError.message?.includes('이메일')
        ) {
          throw new Error(SIGNUP_VALIDATION_MESSAGES.EMAIL_ALREADY_EXISTS)
        } else if (
          fetchError.data?.error === '닉네임 중복' ||
          fetchError.message?.includes('닉네임')
        ) {
          throw new Error(SIGNUP_VALIDATION_MESSAGES.NICKNAME_ALREADY_EXISTS)
        } else {
          throw new Error(
            HTTP_ERROR_MESSAGES[409] || '이미 사용 중인 정보가 있습니다.'
          )
        }
      } else if (fetchError.status === 400) {
        console.log('🔧 [변경사항] 400 Bad Request 에러 처리')
        throw new Error(SIGNUP_VALIDATION_MESSAGES.VALIDATION_ERROR)
      } else if (fetchError.status === 403) {
        console.log('🔧 [변경사항] 403 Forbidden 에러 처리')
        throw new Error(SIGNUP_VALIDATION_MESSAGES.SECURITY_ERROR)
      } else if (fetchError.status >= 500) {
        console.log('🔧 [변경사항] 5xx 서버 에러 처리')
        throw new Error(SIGNUP_VALIDATION_MESSAGES.SERVER_ERROR)
      } else {
        console.log('🔧 [변경사항] 기타 에러 처리')
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
    data: FindIdSimpleRequest
  ): Promise<ApiResponseWrapper<{ username: string }>> => {
    try {
      const response = await axios.post<
        ApiResponseWrapper<{ username: string }>
      >(`${config.api.baseURL}${API_ENDPOINTS.AUTH.FIND_ID_SIMPLE}`, data)
      return response.data
    } catch (error) {
      throw error
    }
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
      import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'
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
    const response = await api.post<LogoutResponse>(API_ENDPOINTS.AUTH.LOGOUT)
    return response.data as LogoutResponse
  },

  // Check if user is authenticated
  checkAuth: async (): Promise<{ message: string; authenticated: boolean }> => {
    const response = await api.get<{ message: string; authenticated: boolean }>(
      API_ENDPOINTS.AUTH.CHECK
    )
    return response.data as { message: string; authenticated: boolean }
  },
}
