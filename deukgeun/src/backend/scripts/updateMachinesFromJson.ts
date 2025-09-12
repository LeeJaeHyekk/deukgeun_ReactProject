import { AppDataSource } from '../config/database'
import { Machine } from '../entities/Machine'
import machinesData from '../../shared/data/machines/machinesData.json'
import type { EnhancedMachine } from '../../shared/types/machineGuide.types'
import { logger } from '../utils/logger'

/**
 * machinesData.json의 데이터를 기준으로 DB의 머신 데이터를 업데이트하는 스크립트
 *
 * 실행 방법:
 * npm run update:machines
 *
 * 주의사항:
 * - 실행 전 반드시 데이터베이스 백업을 수행하세요
 * - 기존 데이터는 machineKey를 기준으로 업데이트됩니다
 * - 새로운 데이터는 추가됩니다
 */

interface UpdateResult {
  inserted: number
  updated: number
  skipped: number
  errors: string[]
}

async function updateMachinesFromJson(): Promise<UpdateResult> {
  logger.info('🔄 Starting machine data update from JSON...')

  const result: UpdateResult = {
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  }

  try {
    // 데이터베이스 연결 확인
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
      logger.info('✅ Database connection established')
    }

    const machineRepository = AppDataSource.getRepository(Machine)

    // 기존 데이터 확인
    const existingCount = await machineRepository.count()
    logger.info(`📊 Found ${existingCount} existing machines in database`)

    // machinesData.json에서 데이터 가져오기
    const machinesToUpdate = machinesData as EnhancedMachine[]
    logger.info(`📦 Found ${machinesToUpdate.length} machines in JSON data`)

    // 트랜잭션 시작
    await AppDataSource.transaction(async transactionalEntityManager => {
      for (const machineData of machinesToUpdate) {
        try {
          // machineKey로 기존 데이터 확인
          const existingMachine = await transactionalEntityManager.findOne(
            Machine,
            {
              where: { machineKey: machineData.machineKey },
            }
          )

          if (existingMachine) {
            // 기존 데이터 업데이트
            await transactionalEntityManager.update(
              Machine,
              { machineKey: machineData.machineKey },
              {
                name: machineData.name,
                nameEn: machineData.nameEn,
                imageUrl: machineData.imageUrl,
                shortDesc: machineData.shortDesc,
                category: machineData.category,
                difficulty: machineData.difficulty,
                isActive: machineData.isActive,
                anatomy: machineData.anatomy,
                guide: machineData.guide,
                training: machineData.training,
                extraInfo: machineData.extraInfo,
                updatedAt: new Date(),
              }
            )
            result.updated++
            logger.info(
              `✅ Updated machine: ${machineData.name} (${machineData.machineKey})`
            )
          } else {
            // 새로운 데이터 삽입
            const newMachine = transactionalEntityManager.create(Machine, {
              machineKey: machineData.machineKey,
              name: machineData.name,
              nameEn: machineData.nameEn,
              imageUrl: machineData.imageUrl,
              shortDesc: machineData.shortDesc,
              category: machineData.category,
              difficulty: machineData.difficulty,
              isActive: machineData.isActive,
              anatomy: machineData.anatomy,
              guide: machineData.guide,
              training: machineData.training,
              extraInfo: machineData.extraInfo,
            })

            await transactionalEntityManager.save(newMachine)
            result.inserted++
            logger.info(
              `➕ Inserted new machine: ${machineData.name} (${machineData.machineKey})`
            )
          }
        } catch (error) {
          const errorMsg = `Failed to process machine ${machineData.machineKey}: ${error instanceof Error ? error.message : 'Unknown error'}`
          result.errors.push(errorMsg)
          logger.error(`❌ ${errorMsg}`)
        }
      }
    })

    // 결과 요약
    logger.info('📋 Update Summary:')
    logger.info(`   ➕ Inserted: ${result.inserted} machines`)
    logger.info(`   ✅ Updated: ${result.updated} machines`)
    logger.info(`   ❌ Errors: ${result.errors.length} machines`)

    if (result.errors.length > 0) {
      logger.error('🚨 Errors encountered:')
      result.errors.forEach(error => logger.error(`   - ${error}`))
    }

    // 최종 데이터 확인
    const finalCount = await machineRepository.count()
    logger.info(`📊 Final machine count: ${finalCount}`)

    return result
  } catch (error) {
    logger.error('💥 Fatal error during machine update:', error)
    throw error
  }
}

/**
 * DB에 있지만 JSON에 없는 머신들을 비활성화하는 함수
 */
async function deactivateMissingMachines(): Promise<void> {
  logger.info('🔍 Checking for machines not in JSON data...')

  try {
    const machineRepository = AppDataSource.getRepository(Machine)
    const machinesToUpdate = machinesData as EnhancedMachine[]
    const jsonMachineKeys = new Set(machinesToUpdate.map(m => m.machineKey))

    // DB의 모든 머신 조회
    const allDbMachines = await machineRepository.find()

    let deactivatedCount = 0

    for (const dbMachine of allDbMachines) {
      if (!jsonMachineKeys.has(dbMachine.machineKey)) {
        await machineRepository.update(
          { machineKey: dbMachine.machineKey },
          { isActive: false, updatedAt: new Date() }
        )
        deactivatedCount++
        logger.info(
          `🔒 Deactivated machine not in JSON: ${dbMachine.name} (${dbMachine.machineKey})`
        )
      }
    }

    if (deactivatedCount > 0) {
      logger.info(
        `🔒 Deactivated ${deactivatedCount} machines not found in JSON data`
      )
    } else {
      logger.info('✅ All DB machines are present in JSON data')
    }
  } catch (error) {
    logger.error('❌ Error during deactivation check:', error)
    throw error
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  try {
    logger.info('🚀 Starting machine database update process...')

    // 1. JSON 데이터로 DB 업데이트
    const updateResult = await updateMachinesFromJson()

    // 2. JSON에 없는 머신들 비활성화
    await deactivateMissingMachines()

    logger.info('🎉 Machine database update completed successfully!')

    // 결과 출력
    console.log('\n📊 Final Results:')
    console.log(`   ➕ Inserted: ${updateResult.inserted} machines`)
    console.log(`   ✅ Updated: ${updateResult.updated} machines`)
    console.log(`   ❌ Errors: ${updateResult.errors.length} machines`)

    if (updateResult.errors.length > 0) {
      console.log('\n🚨 Errors:')
      updateResult.errors.forEach(error => console.log(`   - ${error}`))
    }
  } catch (error) {
    logger.error('💥 Fatal error in main process:', error)
    process.exit(1)
  } finally {
    // 데이터베이스 연결 종료
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
      logger.info('🔌 Database connection closed')
    }
  }
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Unhandled error:', error)
    process.exit(1)
  })
}

export { updateMachinesFromJson, deactivateMissingMachines }
