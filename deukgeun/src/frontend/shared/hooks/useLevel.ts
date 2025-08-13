import { useState, useEffect, useCallback } from "react"
import { useAuth } from "./useAuth"
import { levelApi, LevelProgress, UserReward } from "../api/levelApi"
import { showToast } from "../lib"

export function useLevel() {
  const { user, isLoggedIn } = useAuth()
  const [levelProgress, setLevelProgress] = useState<LevelProgress | null>(null)
  const [rewards, setRewards] = useState<UserReward[]>([])
  const [cooldownInfo, setCooldownInfo] = useState<{
    isOnCooldown: boolean
    remainingTime: number
  } | null>(null)
  const [dailyLimitInfo, setDailyLimitInfo] = useState<{
    withinLimit: boolean
    dailyExp: number
    limit: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * 사용자 레벨 진행률 조회
   */
  const fetchLevelProgress = useCallback(async () => {
    if (!isLoggedIn || !user) return

    try {
      setIsLoading(true)
      setError(null)
      const progress = await levelApi.getUserProgress(user.id)
      setLevelProgress(progress)
    } catch (err) {
      setError("레벨 정보를 불러오는데 실패했습니다.")
      console.error("레벨 진행률 조회 실패:", err)
    } finally {
      setIsLoading(false)
    }
  }, [isLoggedIn, user])

  /**
   * 사용자 보상 목록 조회
   */
  const fetchRewards = useCallback(async () => {
    if (!isLoggedIn || !user) return

    try {
      setIsLoading(true)
      setError(null)
      const userRewards = await levelApi.getUserRewards(user.id)
      setRewards(userRewards)
    } catch (err) {
      setError("보상 정보를 불러오는데 실패했습니다.")
      console.error("보상 목록 조회 실패:", err)
    } finally {
      setIsLoading(false)
    }
  }, [isLoggedIn, user])

  /**
   * 경험치 부여
   */
  const grantExp = useCallback(
    async (actionType: string, source: string, metadata?: any) => {
      if (!isLoggedIn || !user) return

      try {
        const result = await levelApi.grantExp({
          actionType,
          source,
          metadata,
        })

        if (result.success) {
          // 쿨다운 정보 업데이트
          if (result.cooldownInfo) {
            setCooldownInfo(result.cooldownInfo)
          }

          // 일일 한도 정보 업데이트
          if (result.dailyLimitInfo) {
            setDailyLimitInfo(result.dailyLimitInfo)
          }

          // 레벨업 시 알림
          if (result.levelUp) {
            showToast("🎉 레벨업! 축하합니다!", "success")
          }

          // 보상 획득 시 알림
          if (result.rewards && result.rewards.length > 0) {
            result.rewards.forEach(reward => {
              showToast(
                `🎁 ${reward.metadata?.name || "보상"} 획득!`,
                "success"
              )
            })
          }

          // 진행률 새로고침
          await fetchLevelProgress()
          await fetchRewards()

          return result
        } else {
          // 실패 이유에 따른 메시지
          if (result.cooldownInfo?.isOnCooldown) {
            const remainingSeconds = Math.ceil(
              result.cooldownInfo.remainingTime / 1000
            )
            showToast(
              `쿨다운 중입니다. ${remainingSeconds}초 후 다시 시도해주세요.`,
              "warning"
            )
          } else if (
            result.dailyLimitInfo &&
            !result.dailyLimitInfo.withinLimit
          ) {
            showToast(
              `일일 경험치 한도(${result.dailyLimitInfo.limit} EXP)를 초과했습니다.`,
              "warning"
            )
          } else {
            showToast("경험치를 획득할 수 없습니다.", "warning")
          }

          // 쿨다운 및 한도 정보 업데이트
          if (result.cooldownInfo) {
            setCooldownInfo(result.cooldownInfo)
          }
          if (result.dailyLimitInfo) {
            setDailyLimitInfo(result.dailyLimitInfo)
          }

          return result
        }
      } catch (err) {
        console.error("경험치 부여 실패:", err)
        return null
      }
    },
    [isLoggedIn, user, fetchLevelProgress, fetchRewards]
  )

  /**
   * 쿨다운 상태 확인
   */
  const checkCooldown = useCallback(
    async (actionType: string) => {
      if (!isLoggedIn || !user) return false

      try {
        const result = await levelApi.checkCooldown(actionType, user.id)
        return result.canPerform
      } catch (err) {
        console.error("쿨다운 확인 실패:", err)
        return false
      }
    },
    [isLoggedIn, user]
  )

  /**
   * 리더보드 조회
   */
  const getLeaderboard = useCallback(
    async (page: number = 1, limit: number = 20) => {
      try {
        const result = await levelApi.getGlobalLeaderboard(page, limit)
        return result
      } catch (err) {
        console.error("리더보드 조회 실패:", err)
        return null
      }
    },
    []
  )

  /**
   * 시즌 리더보드 조회
   */
  const getSeasonLeaderboard = useCallback(
    async (seasonId: string, page: number = 1, limit: number = 20) => {
      try {
        const result = await levelApi.getSeasonLeaderboard(
          seasonId,
          page,
          limit
        )
        return result
      } catch (err) {
        console.error("시즌 리더보드 조회 실패:", err)
        return null
      }
    },
    []
  )

  // 초기 데이터 로드
  useEffect(() => {
    if (isLoggedIn && user) {
      fetchLevelProgress()
      fetchRewards()
    }
  }, [isLoggedIn, user, fetchLevelProgress, fetchRewards])

  return {
    // 상태
    levelProgress,
    rewards,
    cooldownInfo,
    dailyLimitInfo,
    isLoading,
    error,

    // 액션
    fetchLevelProgress,
    fetchRewards,
    grantExp,
    checkCooldown,
    getLeaderboard,
    getSeasonLeaderboard,

    // 유틸리티
    isLevelUp: levelProgress?.levelUp || false,
    currentLevel: levelProgress?.level || 1,
    currentExp: levelProgress?.currentExp || 0,
    totalExp: levelProgress?.totalExp || 0,
    progressPercentage: levelProgress?.progressPercentage || 0,
    expToNextLevel: levelProgress?.expToNextLevel || 0,
  }
}
