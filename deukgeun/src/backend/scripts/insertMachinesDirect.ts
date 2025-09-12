import { AppDataSource } from '../config/database'
import { Machine } from '../entities/Machine'
import machinesData from '../../shared/data/machines/machinesData.json'
import type { EnhancedMachine } from '../../shared/types/machineGuide.types'

/**
 * 기존 데이터베이스 연결을 사용하여 머신 데이터를 직접 삽입하는 스크립트
 */
async function insertMachinesDirect() {
  console.log('🌱 Starting direct machine data insertion...')

  try {
    // 기존 연결 사용
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
      console.log('✅ Database connection established')
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

    console.log('\n📈 Insertion Summary:')
    console.log(`   🆕 New machines inserted: ${insertedCount}`)
    console.log(`   ✅ Existing machines updated: ${updatedCount}`)
    console.log(`   ⏭️  Machines skipped (errors): ${skippedCount}`)
    console.log(
      `   📊 Total processed: ${insertedCount + updatedCount + skippedCount}`
    )

    // 최종 카운트 확인
    const finalCount = await machineRepository.count()
    console.log(`🎯 Final machine count in database: ${finalCount}`)

    console.log('✅ Machine data insertion completed successfully!')
  } catch (error) {
    console.error('❌ Error during machine data insertion:', error)
    throw error
  }
}

// 스크립트 실행
if (require.main === module) {
  insertMachinesDirect()
    .then(() => {
      console.log('🎉 Machine insertion script completed')
      process.exit(0)
    })
    .catch(error => {
      console.error('💥 Machine insertion script failed:', error)
      process.exit(1)
    })
}

export { insertMachinesDirect }
