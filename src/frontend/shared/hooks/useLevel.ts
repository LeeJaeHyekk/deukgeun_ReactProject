// ============================================================================
// Frontend 레벨 훅
// ============================================================================

import { useState, useEffect, useCallback } from "react"
import { api } from "../lib/api-client"
import type { LevelProgress } from "../types/common"

interface UseLevelReturn {
  levelProgress: LevelProgress | null
  isLoading: boolean
  error: string | null
  refreshLevel: () => Promise<void>
}

export function useLevel(): UseLevelReturn {
  const [levelProgress, setLevelProgress] = useState<LevelProgress | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLevelProgress = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await api.get("/api/level/progress")
      const data = response.data

      if (data.success && data.data) {
        setLevelProgress(data.data)
      } else {
        throw new Error(data.message || "레벨 정보를 가져올 수 없습니다")
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || "레벨 정보를 가져오는데 실패했습니다"
      setError(errorMessage)
      console.error("레벨 정보 조회 실패:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refreshLevel = useCallback(async () => {
    await fetchLevelProgress()
  }, [fetchLevelProgress])

  useEffect(() => {
    fetchLevelProgress()
  }, [fetchLevelProgress])

  return {
    levelProgress,
    isLoading,
    error,
    refreshLevel,
  }
}
