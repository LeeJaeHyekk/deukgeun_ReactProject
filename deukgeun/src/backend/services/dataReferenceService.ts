import { Repository } from "typeorm"
import { Gym } from "../entities/Gym.js"
import { logger } from "../utils/logger.js"

interface DataReferenceStatus {
  lastUpdateDate: Date
  nextUpdateDate: Date
  daysUntilNextUpdate: number
  dataSource: "api" | "crawling" | "reference"
  isUsingReferenceData: boolean
}

export class DataReferenceService {
  private static readonly UPDATE_INTERVAL_DAYS = 3
  private static readonly REFERENCE_DAYS = 2

  /**
   * 헬스장 데이터의 참조 상태를 확인
   */
  static async checkDataReferenceStatus(
    gymRepo: Repository<Gym>,
    gymId: number
  ): Promise<DataReferenceStatus> {
    const gym = await gymRepo.findOne({ where: { id: gymId } })

    if (!gym) {
      throw new Error("헬스장을 찾을 수 없습니다.")
    }

    const now = new Date()
    const lastUpdate = gym.updatedAt || gym.createdAt
    const daysSinceLastUpdate = Math.floor(
      (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)
    )

    const nextUpdateDate = new Date(lastUpdate)
    nextUpdateDate.setDate(nextUpdateDate.getDate() + this.UPDATE_INTERVAL_DAYS)

    const daysUntilNextUpdate = Math.max(
      0,
      this.UPDATE_INTERVAL_DAYS - daysSinceLastUpdate
    )
    const isUsingReferenceData =
      daysSinceLastUpdate > 0 && daysSinceLastUpdate <= this.REFERENCE_DAYS

    // 데이터 소스 판단
    let dataSource: "api" | "crawling" | "reference" = "reference"
    if (daysSinceLastUpdate === 0) {
      // 오늘 업데이트된 경우
      if (gym.facilities?.includes("API")) {
        dataSource = "api"
      } else if (gym.facilities?.includes("크롤링")) {
        dataSource = "crawling"
      }
    }

    return {
      lastUpdateDate: lastUpdate,
      nextUpdateDate,
      daysUntilNextUpdate,
      dataSource,
      isUsingReferenceData,
    }
  }

  /**
   * 모든 헬스장의 데이터 참조 상태를 확인
   */
  static async checkAllGymsReferenceStatus(gymRepo: Repository<Gym>): Promise<{
    totalGyms: number
    apiDataCount: number
    crawlingDataCount: number
    referenceDataCount: number
    needsUpdateCount: number
    status: DataReferenceStatus[]
  }> {
    const gyms = await gymRepo.find()
    const statuses: DataReferenceStatus[] = []

    let apiDataCount = 0
    let crawlingDataCount = 0
    let referenceDataCount = 0
    let needsUpdateCount = 0

    for (const gym of gyms) {
      try {
        const status = await this.checkDataReferenceStatus(gymRepo, gym.id)
        statuses.push(status)

        switch (status.dataSource) {
          case "api":
            apiDataCount++
            break
          case "crawling":
            crawlingDataCount++
            break
          case "reference":
            referenceDataCount++
            break
        }

        if (status.daysUntilNextUpdate === 0) {
          needsUpdateCount++
        }
      } catch (error) {
        logger.error(`헬스장 ${gym.name} 상태 확인 실패:`, error)
      }
    }

    return {
      totalGyms: gyms.length,
      apiDataCount,
      crawlingDataCount,
      referenceDataCount,
      needsUpdateCount,
      status: statuses,
    }
  }

  /**
   * 업데이트가 필요한 헬스장 목록 조회
   */
  static async getGymsNeedingUpdate(gymRepo: Repository<Gym>): Promise<Gym[]> {
    const gyms = await gymRepo.find()
    const needsUpdate: Gym[] = []

    for (const gym of gyms) {
      const status = await this.checkDataReferenceStatus(gymRepo, gym.id)
      if (status.daysUntilNextUpdate === 0) {
        needsUpdate.push(gym)
      }
    }

    return needsUpdate
  }

  /**
   * 데이터 참조 통계 로깅
   */
  static async logDataReferenceStatistics(
    gymRepo: Repository<Gym>
  ): Promise<void> {
    const stats = await this.checkAllGymsReferenceStatus(gymRepo)

    logger.info("📊 데이터 참조 통계:")
    logger.info(`- 총 헬스장: ${stats.totalGyms}개`)
    logger.info(`- API 데이터: ${stats.apiDataCount}개`)
    logger.info(`- 크롤링 데이터: ${stats.crawlingDataCount}개`)
    logger.info(`- 참조 데이터: ${stats.referenceDataCount}개`)
    logger.info(`- 업데이트 필요: ${stats.needsUpdateCount}개`)

    if (stats.needsUpdateCount > 0) {
      logger.info(
        `🔄 ${stats.needsUpdateCount}개 헬스장이 업데이트를 기다리고 있습니다.`
      )
    } else {
      logger.info("✅ 모든 헬스장이 최신 데이터를 사용 중입니다.")
    }
  }

  /**
   * 스케줄러 실행 전 상태 확인
   */
  static async preSchedulerCheck(gymRepo: Repository<Gym>): Promise<{
    shouldRunUpdate: boolean
    reason: string
    stats: any
  }> {
    const stats = await this.checkAllGymsReferenceStatus(gymRepo)

    // 업데이트가 필요한 헬스장이 있거나, 마지막 업데이트가 3일 이상 된 경우
    const shouldRunUpdate =
      stats.needsUpdateCount > 0 ||
      stats.referenceDataCount > stats.totalGyms * 0.8

    const reason = shouldRunUpdate
      ? `${stats.needsUpdateCount}개 헬스장 업데이트 필요`
      : "모든 헬스장이 최신 데이터 사용 중"

    return {
      shouldRunUpdate,
      reason,
      stats,
    }
  }
}
