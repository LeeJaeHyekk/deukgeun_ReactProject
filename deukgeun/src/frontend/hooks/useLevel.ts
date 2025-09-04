// 프론트엔드 전용 useLevel 훅

import { useState, useEffect, useCallback } from "react"
import type {
  LevelProgress,
  GrantExpRequest,
  GrantExpResponse,
} from "../types/level"

// 임시 레벨 API 래퍼 (실제 구현 시 백엔드 API로 교체)
const levelApiWrapper = {
  async grantExp(
    userId: string,
    expAmount: number,
    source: string
  ): Promise<GrantExpResponse> {
    // 임시 구현 - 실제로는 백엔드 API 호출
    return {
      success: true,
      newLevel: 1,
      expGained: expAmount,
      totalExp: expAmount,
      levelUp: false,
      rewards: [],
      cooldownInfo: undefined,
      dailyLimitInfo: undefined,
    }
  },
}

export function useLevel() {
  const [levelProgress, setLevelProgress] = useState<LevelProgress>({
    level: 1,
    currentExp: 0,
    totalExp: 0,
    seasonExp: 0,
    expToNextLevel: 100,
    progressPercentage: 0,
  })

  const [cooldownInfo, setCooldownInfo] = useState<any>(null)
  const [dailyLimitInfo, setDailyLimitInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // 레벨 진행 상황 계산
  const calculateLevelProgress = useCallback((exp: number): LevelProgress => {
    const baseExp = 100
    const level = Math.floor(exp / baseExp) + 1
    const currentExp = exp % baseExp
    const expToNextLevel = baseExp - currentExp
    const progressPercentage = (currentExp / baseExp) * 100

    return {
      level,
      currentExp,
      totalExp: exp,
      seasonExp: exp,
      expToNextLevel,
      progressPercentage,
    }
  }, [])

  // 경험치 획득
  const grantExp = useCallback(
    async (request: GrantExpRequest): Promise<boolean> => {
      try {
        setIsLoading(true)

        const result = await levelApiWrapper.grantExp(
          request.userId,
          request.expAmount,
          request.source
        )

        if (result.success) {
          // 새로운 레벨 진행 상황 계산
          const newProgress = calculateLevelProgress(result.totalExp)
          setLevelProgress(newProgress)

          // 추가 정보 업데이트
          if (result.cooldownInfo) {
            setCooldownInfo(result.cooldownInfo)
          }

          if (result.dailyLimitInfo) {
            setDailyLimitInfo(result.dailyLimitInfo)
          }

          // 레벨업 알림 처리
          if (result.levelUp) {
            console.log(`🎉 레벨업! ${newProgress.level}레벨 달성!`)
          }

          // 보상 처리
          if (result.rewards && result.rewards.length > 0) {
            result.rewards.forEach((reward: any) => {
              console.log(`🏆 보상 획득: ${reward.name}`)
            })
          }

          return true
        }

        return false
      } catch (error) {
        console.error("경험치 획득 실패:", error)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [calculateLevelProgress]
  )

  // 초기 레벨 데이터 로드
  useEffect(() => {
    // 임시로 기본값 사용 (실제로는 사용자 데이터에서 로드)
    const initialExp = 0
    const initialProgress = calculateLevelProgress(initialExp)
    setLevelProgress(initialProgress)
  }, [calculateLevelProgress])

  return {
    levelProgress,
    cooldownInfo,
    dailyLimitInfo,
    isLoading,
    grantExp,
  }
}
