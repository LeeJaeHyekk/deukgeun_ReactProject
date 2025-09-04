import { levelApi, LevelProgress, UserReward } from './levelApi'

// 레벨 API 래퍼 클래스
export class LevelApiWrapper {
  // 사용자 레벨 정보 조회
  static async getUserLevel(userId: string): Promise<LevelProgress> {
    try {
      return await levelApi.getUserLevel(userId)
    } catch (error) {
      console.error('사용자 레벨 정보 조회 실패:', error)
      throw error
    }
  }

  // 경험치 획득
  static async gainExperience(userId: string, expAmount: number, source: string) {
    try {
      return await levelApi.gainExperience(userId, expAmount, source)
    } catch (error) {
      console.error('경험치 획득 실패:', error)
      throw error
    }
  }

  // 레벨업 확인
  static async checkLevelUp(userId: string) {
    try {
      return await levelApi.checkLevelUp(userId)
    } catch (error) {
      console.error('레벨업 확인 실패:', error)
      throw error
    }
  }

  // 사용자 보상 조회
  static async getUserRewards(userId: string): Promise<UserReward[]> {
    try {
      return await levelApi.getUserRewards(userId)
    } catch (error) {
      console.error('사용자 보상 조회 실패:', error)
      throw error
    }
  }

  // 보상 수령
  static async claimReward(rewardId: string) {
    try {
      return await levelApi.claimReward(rewardId)
    } catch (error) {
      console.error('보상 수령 실패:', error)
      throw error
    }
  }

  // 사용자 진행 상황 조회
  static async getUserProgress(userId: string): Promise<LevelProgress> {
    try {
      return await levelApi.getUserLevel(userId)
    } catch (error) {
      console.error('사용자 진행 상황 조회 실패:', error)
      throw error
    }
  }

  // 경험치 부여
  static async grantExp(userId: string, expAmount: number, source: string) {
    try {
      return await levelApi.gainExperience(userId, expAmount, source)
    } catch (error) {
      console.error('경험치 부여 실패:', error)
      throw error
    }
  }
}

// 레벨 API 매니저 (싱글톤)
export class LevelApiManager {
  private static instance: LevelApiManager
  private cache: Map<string, any> = new Map()

  private constructor() {}

  static getInstance(): LevelApiManager {
    if (!LevelApiManager.instance) {
      LevelApiManager.instance = new LevelApiManager()
    }
    return LevelApiManager.instance
  }

  // 캐시된 사용자 레벨 정보 조회
  async getUserLevelCached(userId: string): Promise<LevelProgress> {
    const cacheKey = `userLevel_${userId}`
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    const userLevel = await LevelApiWrapper.getUserLevel(userId)
    this.cache.set(cacheKey, userLevel)
    
    // 5분 후 캐시 만료
    setTimeout(() => {
      this.cache.delete(cacheKey)
    }, 5 * 60 * 1000)

    return userLevel
  }

  // 캐시 무효화
  invalidateCache(userId?: string) {
    if (userId) {
      this.cache.delete(`userLevel_${userId}`)
    } else {
      this.cache.clear()
    }
  }

  // 레벨 API 활성화
  enable() {
    // 레벨 API 활성화 로직
    console.log('레벨 API가 활성화되었습니다.')
  }

  // 레벨 API 비활성화
  disable() {
    // 레벨 API 비활성화 로직
    console.log('레벨 API가 비활성화되었습니다.')
  }

  // 레벨 API 활성화 상태 확인
  isEnabled(): boolean {
    return true // 기본적으로 활성화
  }
}

// 기본 export
export const levelApiWrapper = LevelApiWrapper
export const levelApiManager = LevelApiManager.getInstance()
