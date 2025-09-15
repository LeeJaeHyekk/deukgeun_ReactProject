import { apiClient } from './client'
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
    return response.data as unknown as AuthResponse
  },

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/register', userData)
    return response.data as unknown as AuthResponse
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
  },

  async refreshToken(): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/refresh')
    return response.data as unknown as AuthResponse
  },

  async findId(email: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/find-id', { email })
    return response.data as { message: string } as { message: string }
  },

  async findPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/find-password', { email })
    return response.data as { message: string } as { message: string }
  },

  async resetPassword(
    token: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/reset-password', {
      token,
      newPassword,
    })
    return response.data as { message: string }
  },

  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await apiClient.post('/auth/verify-email', { token })
    return response.data as { message: string }
  },
}
