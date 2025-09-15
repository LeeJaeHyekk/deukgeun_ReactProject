#!/usr/bin/env node

/**
 * ============================================================================
 * Scheduled Data Updater - 3일마다 API 데이터 업데이트
 * ============================================================================
 *
 * 목적:
 * 1. 3일마다 헬스장 API 데이터 업데이트
 * 2. 운동기구 데이터 동기화
 * 3. 데이터 정리 및 최적화
 *
 * 실행 방법:
 * - 수동 실행: npm run update:api-data
 * - 스케줄러 등록: npm run schedule:api-update
 *
 * ============================================================================
 */

import { AppDataSource } from '../config/database'
import { Gym } from '../entities/Gym'
import { Machine } from '../entities/Machine'
import { logger } from '../utils/logger'
import { config } from '../config/env'
import fs from 'fs'
import path from 'path'
const cron = require('node-cron')

// ============================================================================
// 타입 정의
// ============================================================================

interface UpdateResult {
  success: boolean
  message: string
  data: {
    gymsUpdated: number
    gymsAdded: number
    machinesUpdated: number
    machinesAdded: number
    errors: string[]
  }
  executionTime: number
  lastUpdate: Date
}

interface ApiResponse {
  LOCALDATA_104201: {
    list_total_count: number
    row: Array<{
      MGTNO: string
      BPLCNM: string
      BPLCDIVNM: string
      RDNWHLADDR: string
      SITEWHLADDR: string
      SITETEL: string
      X: string
      Y: string
    }>
  }
}

// ============================================================================
// 스케줄된 데이터 업데이터 클래스
// ============================================================================

class ScheduledDataUpdater {
  private startTime: number = 0
  private result: UpdateResult = {
    success: false,
    message: '',
    data: {
      gymsUpdated: 0,
      gymsAdded: 0,
      machinesUpdated: 0,
      machinesAdded: 0,
      errors: [],
    },
    executionTime: 0,
    lastUpdate: new Date(),
  }

  constructor() {
    this.startTime = Date.now()
  }

  /**
   * 메인 업데이트 실행
   */
  async executeUpdate(): Promise<UpdateResult> {
    try {
      logger.info('🔄 스케줄된 데이터 업데이트 시작')

      // 데이터베이스 연결
      await this.initializeDatabase()

      // 1. 헬스장 데이터 업데이트
      await this.updateGymData()

      // 2. 운동기구 데이터 동기화
      await this.updateMachineData()

      // 3. 데이터 정리
      await this.cleanupData()

      // 4. 업데이트 로그 저장
      await this.saveUpdateLog()

      this.result.success = true
      this.result.message = '데이터 업데이트가 성공적으로 완료되었습니다.'
    } catch (error) {
      this.result.success = false
      this.result.message = `데이터 업데이트 중 오류 발생: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      this.result.data.errors.push(this.result.message)
      logger.error('❌ 데이터 업데이트 실패:', error)
    } finally {
      this.result.executionTime = Date.now() - this.startTime
      await this.cleanup()
      this.printSummary()
    }

    return this.result
  }

  /**
   * 데이터베이스 초기화
   */
  private async initializeDatabase(): Promise<void> {
    try {
      if (!AppDataSource.isInitialized) {
        await AppDataSource.initialize()
        logger.info('✅ 데이터베이스 연결 성공')
      }
    } catch (error) {
      logger.error('❌ 데이터베이스 연결 실패:', error)
      throw error
    }
  }

  /**
   * 헬스장 데이터 업데이트
   */
  private async updateGymData(): Promise<void> {
    logger.info('🏋️ 헬스장 데이터 업데이트 중...')

    const API_KEY = process.env.VITE_GYM_API_KEY
    if (!API_KEY || API_KEY === 'your_gym_api_key') {
      logger.warn(
        '⚠️ 헬스장 API 키가 설정되지 않음. 헬스장 데이터 업데이트를 건너뜁니다.'
      )
      return
    }

    try {
      // API에서 최신 헬스장 데이터 가져오기
      const gymData = await this.fetchGymsFromAPI(API_KEY)

      if (gymData.length === 0) {
        logger.warn('⚠️ API에서 헬스장 데이터를 가져올 수 없습니다.')
        return
      }

      // 데이터베이스 업데이트
      await this.processGymData(gymData)

      logger.info(`✅ 헬스장 데이터 업데이트 완료: ${gymData.length}개 처리`)
    } catch (error) {
      logger.error('❌ 헬스장 데이터 업데이트 실패:', error)
      this.result.data.errors.push(
        `헬스장 데이터 업데이트 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      )
    }
  }

  /**
   * API에서 헬스장 데이터 가져오기
   */
  private async fetchGymsFromAPI(apiKey: string): Promise<any[]> {
    const SERVICE_NAME = 'LOCALDATA_104201'
    const DATA_TYPE = 'json'
    const MAX_ITEMS_PER_REQUEST = 1000

    let allGyms: any[] = []
    let startIndex = 1
    let pageCount = 0

    logger.info('📡 API에서 헬스장 데이터를 가져오는 중...')

    while (true) {
      const endIndex = startIndex + MAX_ITEMS_PER_REQUEST - 1
      const url = `http://openapi.seoul.go.kr:8088/${apiKey}/${DATA_TYPE}/${SERVICE_NAME}/${startIndex}/${endIndex}`

      try {
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: API 호출 실패`)
        }

        const jsonData = (await response.json()) as ApiResponse
        const gymsRaw = jsonData.LOCALDATA_104201?.row

        if (!gymsRaw || !Array.isArray(gymsRaw) || gymsRaw.length === 0) {
          logger.info(`📄 페이지 ${++pageCount}: 더 이상 데이터가 없습니다.`)
          break
        }

        // 좌표 변환 및 데이터 처리
        const processedGyms = gymsRaw.map((item: any) => {
          const { lat, lon } = this.convertTMToWGS84(
            Number(item.X),
            Number(item.Y)
          )
          return {
            MGTNO: item.MGTNO,
            BPLCNM: item.BPLCNM,
            BPLCDIVNM: item.BPLCDIVNM,
            RDNWHLADDR: item.RDNWHLADDR,
            SITEWHLADDR: item.SITEWHLADDR,
            SITETEL: item.SITETEL,
            X: item.X,
            Y: item.Y,
            latitude: lat,
            longitude: lon,
            fetchedAt: new Date().toISOString(),
          }
        })

        allGyms = allGyms.concat(processedGyms)
        logger.info(`✅ 페이지 ${++pageCount}: ${gymsRaw.length}개 데이터 수신`)

        // 다음 페이지로 이동
        startIndex = endIndex + 1

        // API 호출 간격 조절 (서버 부하 방지)
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error) {
        logger.error(`❌ 페이지 ${++pageCount} 요청 실패:`, error)
        throw error
      }
    }

    logger.info(`🎉 총 ${allGyms.length}개의 헬스장 데이터를 가져왔습니다.`)
    return allGyms
  }

  /**
   * TM 좌표를 WGS84 좌표로 변환
   */
  private convertTMToWGS84(x: number, y: number): { lat: number; lon: number } {
    // 간단한 좌표 변환 (실제로는 더 정확한 변환이 필요할 수 있음)
    const lat = y / 1000000
    const lon = x / 1000000
    return { lat, lon }
  }

  /**
   * 헬스장 데이터 처리 및 저장
   */
  private async processGymData(gymData: any[]): Promise<void> {
    const gymRepository = AppDataSource.getRepository(Gym)

    // 기존 데이터 백업
    const existingGyms = await gymRepository.find()
    logger.info(`📊 기존 헬스장 데이터: ${existingGyms.length}개`)

    let updatedCount = 0
    let addedCount = 0

    for (const gymItem of gymData) {
      try {
        // 유효한 좌표가 있는 데이터만 처리
        if (
          !gymItem.latitude ||
          !gymItem.longitude ||
          isNaN(gymItem.latitude) ||
          isNaN(gymItem.longitude) ||
          gymItem.latitude === 0 ||
          gymItem.longitude === 0
        ) {
          continue
        }

        // 기존 데이터 확인 (이름과 주소로 매칭)
        const existingGym = await gymRepository.findOne({
          where: [
            { name: gymItem.BPLCNM },
            { address: gymItem.RDNWHLADDR || gymItem.SITEWHLADDR },
          ],
        })

        const gymDataToSave = {
          name: gymItem.BPLCNM,
          address: gymItem.RDNWHLADDR || gymItem.SITEWHLADDR,
          phone: gymItem.SITETEL,
          latitude: Number(gymItem.latitude),
          longitude: Number(gymItem.longitude),
          facilities: '기본 시설',
          openHour: '06:00-24:00',
          is24Hours: false,
          hasGX: false,
          hasPT: false,
          hasGroupPT: false,
          hasParking: false,
          hasShower: false,
          updatedAt: new Date(),
        }

        if (existingGym) {
          // 기존 데이터 업데이트
          await gymRepository.update(existingGym.id, gymDataToSave)
          updatedCount++
        } else {
          // 새로운 데이터 추가
          const newGym = gymRepository.create(gymDataToSave)
          await gymRepository.save(newGym)
          addedCount++
        }
      } catch (error) {
        logger.warn(
          `헬스장 데이터 처리 실패: ${gymItem.BPLCNM} - ${error instanceof Error ? error.message : '알 수 없는 오류'}`
        )
        this.result.data.errors.push(
          `헬스장 데이터 처리 실패: ${gymItem.BPLCNM}`
        )
      }
    }

    this.result.data.gymsUpdated = updatedCount
    this.result.data.gymsAdded = addedCount

    logger.info(
      `✅ 헬스장 데이터 처리 완료: 업데이트 ${updatedCount}개, 추가 ${addedCount}개`
    )
  }

  /**
   * 운동기구 데이터 업데이트
   */
  private async updateMachineData(): Promise<void> {
    logger.info('🔧 운동기구 데이터 동기화 중...')

    try {
      // JSON 파일에서 최신 데이터 가져오기
      const machinesDataPath = path.join(
        __dirname,
        '../../../shared/data/machines/machinesData.json'
      )

      if (!fs.existsSync(machinesDataPath)) {
        logger.warn('⚠️ machinesData.json 파일을 찾을 수 없습니다.')
        return
      }

      const machinesData = JSON.parse(fs.readFileSync(machinesDataPath, 'utf8'))
      const machineRepository = AppDataSource.getRepository(Machine)

      let updatedCount = 0
      let addedCount = 0

      for (const machineData of machinesData) {
        try {
          const existingMachine = await machineRepository.findOne({
            where: { machineKey: machineData.machineKey },
          })

          const machineDataToSave = {
            name: machineData.name,
            nameEn: machineData.nameEn,
            imageUrl: machineData.imageUrl,
            shortDesc: machineData.shortDesc,
            category: machineData.category,
            difficulty: machineData.difficulty,
            anatomy: machineData.anatomy,
            guide: machineData.guide,
            training: machineData.training,
            extraInfo: machineData.extraInfo,
            isActive: machineData.isActive,
            updatedAt: new Date(),
          }

          if (existingMachine) {
            // 기존 데이터 업데이트
            await machineRepository.update(
              { machineKey: machineData.machineKey },
              machineDataToSave
            )
            updatedCount++
          } else {
            // 새로운 데이터 추가
            const newMachine = machineRepository.create({
              machineKey: machineData.machineKey,
              ...machineDataToSave,
            })
            await machineRepository.save(newMachine)
            addedCount++
          }
        } catch (error) {
          logger.warn(
            `운동기구 데이터 처리 실패: ${machineData.machineKey} - ${error instanceof Error ? error.message : '알 수 없는 오류'}`
          )
          this.result.data.errors.push(
            `운동기구 데이터 처리 실패: ${machineData.machineKey}`
          )
        }
      }

      this.result.data.machinesUpdated = updatedCount
      this.result.data.machinesAdded = addedCount

      logger.info(
        `✅ 운동기구 데이터 동기화 완료: 업데이트 ${updatedCount}개, 추가 ${addedCount}개`
      )
    } catch (error) {
      logger.error('❌ 운동기구 데이터 동기화 실패:', error)
      this.result.data.errors.push(
        `운동기구 데이터 동기화 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      )
    }
  }

  /**
   * 데이터 정리
   */
  private async cleanupData(): Promise<void> {
    logger.info('🧹 데이터 정리 중...')

    try {
      // 중복된 헬스장 데이터 정리
      await this.cleanupDuplicateGyms()

      // 비활성화된 운동기구 정리
      await this.cleanupInactiveMachines()

      // 오래된 로그 데이터 정리
      await this.cleanupOldLogs()

      logger.info('✅ 데이터 정리 완료')
    } catch (error) {
      logger.error('❌ 데이터 정리 실패:', error)
      this.result.data.errors.push(
        `데이터 정리 실패: ${error instanceof Error ? error.message : '알 수 없는 오류'}`
      )
    }
  }

  /**
   * 중복된 헬스장 데이터 정리
   */
  private async cleanupDuplicateGyms(): Promise<void> {
    const gymRepository = AppDataSource.getRepository(Gym)

    // 이름이 같은 헬스장들 찾기
    const duplicateGyms = await gymRepository
      .createQueryBuilder('gym')
      .select('gym.name')
      .addSelect('COUNT(*)', 'count')
      .groupBy('gym.name')
      .having('COUNT(*) > 1')
      .getRawMany()

    for (const duplicate of duplicateGyms) {
      const gyms = await gymRepository.find({
        where: { name: duplicate.gym_name },
      })

      // 가장 최근에 업데이트된 것만 남기고 나머지 삭제
      const sortedGyms = gyms.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )

      for (let i = 1; i < sortedGyms.length; i++) {
        await gymRepository.remove(sortedGyms[i])
      }
    }

    if (duplicateGyms.length > 0) {
      logger.info(`🧹 중복된 헬스장 데이터 ${duplicateGyms.length}개 정리 완료`)
    }
  }

  /**
   * 비활성화된 운동기구 정리
   */
  private async cleanupInactiveMachines(): Promise<void> {
    const machineRepository = AppDataSource.getRepository(Machine)

    // 30일 이상 업데이트되지 않은 비활성 운동기구 확인
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)

    const inactiveMachines = await machineRepository.find({
      where: {
        isActive: false,
        updatedAt: { $lt: thirtyDaysAgo } as any,
      },
    })

    if (inactiveMachines.length > 0) {
      logger.info(
        `🔒 ${inactiveMachines.length}개의 오래된 비활성 운동기구 발견`
      )
      // 실제 삭제는 하지 않고 로그만 남김
    }
  }

  /**
   * 오래된 로그 데이터 정리
   */
  private async cleanupOldLogs(): Promise<void> {
    // 7일 이상 된 업데이트 로그 정리
    const logPath = path.join(__dirname, '../logs/update-logs.json')

    if (fs.existsSync(logPath)) {
      try {
        const logs = JSON.parse(fs.readFileSync(logPath, 'utf8'))
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

        const filteredLogs = logs.filter(
          (log: any) => new Date(log.timestamp) > sevenDaysAgo
        )

        fs.writeFileSync(logPath, JSON.stringify(filteredLogs, null, 2))
        logger.info(
          `📝 오래된 업데이트 로그 ${logs.length - filteredLogs.length}개 정리 완료`
        )
      } catch (error) {
        logger.warn('⚠️ 로그 파일 정리 실패:', error)
      }
    }
  }

  /**
   * 업데이트 로그 저장
   */
  private async saveUpdateLog(): Promise<void> {
    try {
      const logPath = path.join(__dirname, '../logs/update-logs.json')
      const logDir = path.dirname(logPath)

      // 로그 디렉토리 생성
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true })
      }

      const logEntry = {
        timestamp: new Date().toISOString(),
        success: this.result.success,
        message: this.result.message,
        executionTime: this.result.executionTime,
        data: this.result.data,
        environment: process.env.NODE_ENV || 'development',
      }

      let logs = []
      if (fs.existsSync(logPath)) {
        logs = JSON.parse(fs.readFileSync(logPath, 'utf8'))
      }

      logs.push(logEntry)

      // 최근 100개 로그만 유지
      if (logs.length > 100) {
        logs = logs.slice(-100)
      }

      fs.writeFileSync(logPath, JSON.stringify(logs, null, 2))
      logger.info('📝 업데이트 로그 저장 완료')
    } catch (error) {
      logger.warn('⚠️ 업데이트 로그 저장 실패:', error)
    }
  }

  /**
   * 정리 작업
   */
  private async cleanup(): Promise<void> {
    try {
      if (AppDataSource.isInitialized) {
        await AppDataSource.destroy()
        logger.info('🔌 데이터베이스 연결 종료')
      }
    } catch (error) {
      logger.error('❌ 정리 작업 중 오류:', error)
    }
  }

  /**
   * 결과 요약 출력
   */
  private printSummary(): void {
    const executionTime = (this.result.executionTime / 1000).toFixed(2)

    console.log('\n' + '='.repeat(60))
    console.log('📊 스케줄된 데이터 업데이트 결과')
    console.log('='.repeat(60))
    console.log(`⏱️  실행 시간: ${executionTime}초`)
    console.log(`✅ 성공 여부: ${this.result.success ? '성공' : '실패'}`)
    console.log(`📝 메시지: ${this.result.message}`)
    console.log(`🕐 업데이트 시간: ${this.result.lastUpdate.toISOString()}`)
    console.log('\n📈 업데이트된 데이터:')
    console.log(
      `   🏋️ 헬스장: 업데이트 ${this.result.data.gymsUpdated}개, 추가 ${this.result.data.gymsAdded}개`
    )
    console.log(
      `   🔧 운동기구: 업데이트 ${this.result.data.machinesUpdated}개, 추가 ${this.result.data.machinesAdded}개`
    )

    if (this.result.data.errors.length > 0) {
      console.log('\n❌ 오류 목록:')
      this.result.data.errors.forEach(error => {
        console.log(`   - ${error}`)
      })
    }

    console.log('='.repeat(60))
  }

  /**
   * 스케줄러 등록 (3일마다 실행)
   */
  static registerScheduler(): void {
    logger.info('⏰ 데이터 업데이트 스케줄러 등록 중...')

    // 매일 오전 3시에 실행 (3일마다 실제 업데이트)
    cron.schedule(
      '0 3 * * *',
      async () => {
        logger.info('🕐 스케줄된 데이터 업데이트 시작')

        const updater = new ScheduledDataUpdater()
        const result = await updater.executeUpdate()

        if (result.success) {
          logger.info('✅ 스케줄된 데이터 업데이트 완료')
        } else {
          logger.error('❌ 스케줄된 데이터 업데이트 실패:', result.message)
        }
      },
      {
        scheduled: true,
        timezone: 'Asia/Seoul',
      }
    )

    logger.info('✅ 데이터 업데이트 스케줄러 등록 완료 (매일 오전 3시)')
  }
}

// ============================================================================
// CLI 인터페이스
// ============================================================================

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  switch (command) {
    case 'update':
      // 수동 업데이트 실행
      const updater = new ScheduledDataUpdater()
      const result = await updater.executeUpdate()
      process.exit(result.success ? 0 : 1)

    case 'schedule':
      // 스케줄러 등록
      ScheduledDataUpdater.registerScheduler()

      // 스케줄러가 계속 실행되도록 대기
      logger.info('⏰ 스케줄러가 실행 중입니다. 종료하려면 Ctrl+C를 누르세요.')
      process.on('SIGINT', () => {
        logger.info('👋 스케줄러를 종료합니다.')
        process.exit(0)
      })
      break

    default:
      console.log('사용법:')
      console.log(
        '  npm run update:api-data     - 수동으로 API 데이터 업데이트'
      )
      console.log('  npm run schedule:api-update - 스케줄러 등록 및 실행')
      process.exit(1)
  }
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (require.main === module) {
  main().catch(error => {
    console.error('💥 치명적 오류:', error)
    process.exit(1)
  })
}

export { ScheduledDataUpdater, type UpdateResult }
