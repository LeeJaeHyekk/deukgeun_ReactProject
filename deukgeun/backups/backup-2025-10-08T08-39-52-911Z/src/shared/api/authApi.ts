import { apiClient, assertApiResponse } from './client'
import { User } from '@shared/types/dto/user.dto'

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  phone?: string
}

export interface AuthResponse {
  user: User
  token: string
}

export const authApi = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', credentials)
    return assertApiResponse<AuthResponse>(response.data)
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', userData)
    return assertApiResponse<AuthResponse>(response.data)
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
  },

  async refreshToken(): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/refresh')
    return assertApiResponse<AuthResponse>(response.data)
  },

  async findId(email: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/find-id', { email })
    return assertApiResponse<{ message: string }>(response.data)
  },

  async findPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/find-password', { email })
    return assertApiResponse<{ message: string }>(response.data)
  },

  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/reset-password', {
      token,
      newPassword,
    })
    return assertApiResponse<{ message: string }>(response.data)
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/verify-email', { token })
    return assertApiResponse<{ message: string }>(response.data)
  },
}
