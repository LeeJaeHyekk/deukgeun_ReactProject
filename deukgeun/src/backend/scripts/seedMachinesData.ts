import { Machine } from '../entities/Machine'
import { AppDataSource } from '../config/database'
import { appConfig } from '../config/env'
import machinesData from '../../shared/data/machines/machinesData.json'
import type { EnhancedMachine } from '../../shared/types/machineGuide.types'

/**
 * machinesData.json의 데이터를 데이터베이스에 시드하는 스크립트
 */
export async function seedMachinesData(): Promise<void> {
  console.log('🌱 Starting machine data seeding...')
  console.log(
    `🔧 Using database: ${appConfig.database.database} on ${appConfig.database.host}:${appConfig.database.port}`
  )

  try {
    // 데이터베이스 연결 확인
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
      console.log('🔌 Database connection established')
    }

    const machineRepository = AppDataSource.getRepository(Machine)

    // 기존 데이터 확인
    const existingCount = await machineRepository.count()
    console.log(`📊 Found ${existingCount} existing machines in database`)

    // machinesData.json에서 데이터 가져오기
    const machinesToSeed = machinesData as EnhancedMachine[]
    console.log(`📦 Found ${machinesToSeed.length} machines in JSON data`)

    let insertedCount = 0
    let updatedCount = 0
    let skippedCount = 0

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
 * 시드 스크립트를 실행하는 메인 함수
 */
export async function runMachineSeed(): Promise<void> {
  try {
    console.log('🚀 Starting machine seeding process...')
    console.log(`📋 Environment: ${appConfig.environment}`)

    await seedMachinesData()

    console.log('✅ Machine seeding process completed successfully!')
  } catch (error) {
    console.error('❌ Database seeding failed:', error)
    process.exit(1)
  } finally {
    // 데이터베이스 연결이 초기화되어 있다면 종료
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
      console.log('🔌 Database connection closed')
    }
  }
}

// 스크립트가 직접 실행될 때만 runMachineSeed 호출
if (require.main === module) {
  runMachineSeed()
    .then(() => {
      console.log('🎉 Machine seeding script completed')
      process.exit(0)
    })
    .catch(error => {
      console.error('💥 Machine seeding script failed:', error)
      process.exit(1)
    })
}
