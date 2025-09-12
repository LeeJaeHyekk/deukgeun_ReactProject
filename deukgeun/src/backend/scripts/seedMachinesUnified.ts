#!/usr/bin/env ts-node

/**
 * 통합 머신 시드 스크립트
 * 기존 config 파일들을 활용하여 데이터베이스에 머신 데이터를 삽입합니다.
 */

import { AppDataSource } from '../config/database'
import { appConfig } from '../config/env'
import { Machine } from '../entities/Machine'
import machinesData from '../../shared/data/machines/machinesData.json'
import type { EnhancedMachine } from '../../shared/types/machineGuide.types'

/**
 * 머신 데이터를 데이터베이스에 시드하는 함수
 */
async function seedMachinesData(): Promise<void> {
  console.log('🌱 Starting unified machine data seeding...')
  console.log(`🔧 Environment: ${appConfig.environment}`)
  console.log(
    `🗄️  Database: ${appConfig.database.database} on ${appConfig.database.host}:${appConfig.database.port}`
  )

  try {
    // 데이터베이스 연결 확인 및 초기화
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
      console.log('🔌 Database connection established')
    }

    const machineRepository = AppDataSource.getRepository(Machine)

    // 기존 데이터 확인
    const existingCount = await machineRepository.count()
    console.log(`📊 Found ${existingCount} existing machines in database`)

    // JSON 데이터에서 머신 정보 가져오기
    const machinesToSeed = machinesData as EnhancedMachine[]
    console.log(`📦 Found ${machinesToSeed.length} machines in JSON data`)

    let insertedCount = 0
    let updatedCount = 0
    let skippedCount = 0

    // 각 머신 데이터 처리
    for (const machineData of machinesToSeed) {
      try {
        // 기존 머신이 있는지 확인 (machineKey로)
        const existingMachine = await machineRepository.findOne({
          where: { machineKey: machineData.machineKey },
        })

        if (existingMachine) {
          // 기존 머신 업데이트
          await machineRepository.update(existingMachine.id, {
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
          })
          updatedCount++
          console.log(`✅ Updated machine: ${machineData.name}`)
        } else {
          // 새 머신 생성
          const newMachine = machineRepository.create({
            machineKey: machineData.machineKey,
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
          })

          await machineRepository.save(newMachine)
          insertedCount++
          console.log(`🆕 Inserted new machine: ${machineData.name}`)
        }
      } catch (error) {
        console.error(`❌ Error processing machine ${machineData.name}:`, error)
        skippedCount++
      }
    }

    // 결과 요약 출력
    console.log('\n📈 Seeding Summary:')
    console.log(`   🆕 New machines inserted: ${insertedCount}`)
    console.log(`   ✅ Existing machines updated: ${updatedCount}`)
    console.log(`   ⏭️  Machines skipped (errors): ${skippedCount}`)
    console.log(
      `   📊 Total processed: ${insertedCount + updatedCount + skippedCount}`
    )

    // 최종 카운트 확인
    const finalCount = await machineRepository.count()
    console.log(`🎯 Final machine count in database: ${finalCount}`)

    console.log('✅ Machine data seeding completed successfully!')
  } catch (error) {
    console.error('❌ Error during machine data seeding:', error)
    throw error
  }
}

/**
 * 메인 실행 함수
 */
async function main(): Promise<void> {
  try {
    console.log('🚀 Starting unified machine seeding process...')

    await seedMachinesData()

    console.log('🎉 Machine seeding process completed successfully!')
  } catch (error) {
    console.error('💥 Machine seeding process failed:', error)
    process.exit(1)
  } finally {
    // 데이터베이스 연결 정리
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
      console.log('🔌 Database connection closed')
    }
  }
}

// 스크립트가 직접 실행될 때만 main 함수 호출
if (require.main === module) {
  main()
}

export { seedMachinesData, main }
