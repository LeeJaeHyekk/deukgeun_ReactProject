// ============================================================================
// API 클라이언트
// ============================================================================

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios"
import { frontendAppConfig } from "../config/app.js"

class ApiClient {
  private instance: AxiosInstance

  constructor() {
    this.instance = axios.create({
      baseURL: frontendAppConfig.apiBaseUrl,
      timeout: frontendAppConfig.apiTimeout,
      headers: {
        "Content-Type": "application/json",
      },
    })

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // 요청 인터셉터
    this.instance.interceptors.request.use(
      config => {
        const token = localStorage.getItem("accessToken")
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      error => {
        return Promise.reject(error)
      }
    )

    // 응답 인터셉터
    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response
      },
      async error => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const refreshToken = localStorage.getItem("refreshToken")
            if (refreshToken) {
              const response = await axios.post(
                `${frontendAppConfig.apiBaseUrl}/auth/refresh`,
                { refreshToken }
              )

              const { accessToken } = response.data
              localStorage.setItem("accessToken", accessToken)

              originalRequest.headers.Authorization = `Bearer ${accessToken}`
              return this.instance(originalRequest)
            }
          } catch (refreshError) {
            localStorage.removeItem("accessToken")
            localStorage.removeItem("refreshToken")
            window.location.href = "/login"
          }
        }

        return Promise.reject(error)
      }
    )
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config)
    return response.data
  }

  async post<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.instance.post<T>(url, data, config)
    return response.data
  }

  async put<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.instance.put<T>(url, data, config)
    return response.data
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, config)
    return response.data
  }

  async patch<T>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config)
    return response.data
  }
}

export const api = new ApiClient()
export default api
