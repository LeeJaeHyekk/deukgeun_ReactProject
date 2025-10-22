// src/frontend/shared/api/globalApiManager.ts
import axios, { AxiosError, AxiosRequestConfig } from "axios"
import { logger } from "@frontend/shared/utils/logger"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  timeout: 10000,
})

/** 중복 요청 방지를 위한 활성 요청 집합 */
const activeRequests = new Set<string>()

/** 429 응답 시 Retry-After 추출 */
function getRetryAfterSeconds(error: AxiosError): number {
  const retryAfter = error.response?.headers?.["retry-after"]
  if (retryAfter) return parseInt(retryAfter, 10)
  const match = /(\d+)\s*초/.exec(error.message)
  return match ? parseInt(match[1], 10) : 60 // 기본 60초
}

/** 지연 유틸 */
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))

export const GlobalApiManager = {
  async request<T>(requestKey: string, config: AxiosRequestConfig): Promise<T | null> {
    if (activeRequests.has(requestKey)) {
      logger.debug(`[SKIP] 중복 요청 스킵: ${requestKey}`, "")
      return null
    }

    activeRequests.add(requestKey)
    try {
      const response = await api.request<T>(config)
      logger.info(`[SUCCESS] ${requestKey}`, JSON.stringify(response.data))
      return response.data
    } catch (error) {
      const err = error as AxiosError
      if (err.response?.status === 429) {
        const retryAfter = getRetryAfterSeconds(err)
        logger.warn(`요청 제한(429): ${retryAfter}초 후 재시도 - ${requestKey}`, "")
        await delay(retryAfter * 1000)
        activeRequests.delete(requestKey)
        return this.request<T>(requestKey, config)
      }

      logger.error(`[ERROR] ${requestKey}`, err.message)
      throw err
    } finally {
      activeRequests.delete(requestKey)
    }
  },
}