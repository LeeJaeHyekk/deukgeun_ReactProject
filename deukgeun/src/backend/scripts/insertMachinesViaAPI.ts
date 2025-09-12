import axios from 'axios'
import { appConfig } from '../config/env'
import machinesData from '../../shared/data/machines/machinesData.json'
import type { EnhancedMachine } from '../../shared/types/machineGuide.types'

/**
 * API를 통해 머신 데이터를 삽입하는 스크립트
 */
async function insertMachinesViaAPI() {
  console.log('🌱 Starting machine data insertion via API...')
  console.log(`🔧 Using API base URL: http://localhost:${appConfig.port}/api`)

  const API_BASE_URL = `http://localhost:${appConfig.port}/api`

  try {
    // 머신 데이터 가져오기
    const machinesToSeed = machinesData as EnhancedMachine[]
    console.log(`📦 Found ${machinesToSeed.length} machines in JSON data`)

    let insertedCount = 0
    let updatedCount = 0
    let skippedCount = 0

    for (const machineData of machinesToSeed) {
      try {
        // 머신 생성 API 호출
        const response = await axios.post(`${API_BASE_URL}/machines`, {
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

        if (response.status === 201) {
          insertedCount++
          console.log(`🆕 Inserted new machine: ${machineData.name}`)
        }
      } catch (error: any) {
        if (
          error.response?.status === 400 &&
          error.response?.data?.message?.includes('already exists')
        ) {
          // 이미 존재하는 머신인 경우 업데이트 시도
          try {
            // 먼저 기존 머신 조회
            const getResponse = await axios.get(`${API_BASE_URL}/machines`)
            const existingMachines = getResponse.data.data

            const existingMachine = existingMachines.find(
              (m: any) => m.machineKey === machineData.machineKey
            )

            if (existingMachine) {
              // 업데이트 API 호출
              const updateResponse = await axios.put(
                `${API_BASE_URL}/machines/${existingMachine.id}`,
                {
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
                }
              )

              if (updateResponse.status === 200) {
                updatedCount++
                console.log(`✅ Updated machine: ${machineData.name}`)
              }
            } else {
              console.log(
                `⚠️  Machine not found for update: ${machineData.name}`
              )
              skippedCount++
            }
          } catch (updateError) {
            console.error(
              `❌ Error updating machine ${machineData.name}:`,
              updateError
            )
            skippedCount++
          }
        } else {
          console.error(
            `❌ Error processing machine ${machineData.name}:`,
            error.response?.data || error.message
          )
          skippedCount++
        }
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
    const finalResponse = await axios.get(`${API_BASE_URL}/machines`)
    const finalCount = finalResponse.data.count
    console.log(`🎯 Final machine count in database: ${finalCount}`)

    console.log('✅ Machine data insertion completed successfully!')
  } catch (error) {
    console.error('❌ Error during machine data insertion:', error)
    throw error
  }
}

// 스크립트 실행
if (require.main === module) {
  insertMachinesViaAPI()
    .then(() => {
      console.log('🎉 Machine insertion script completed')
      process.exit(0)
    })
    .catch(error => {
      console.error('💥 Machine insertion script failed:', error)
      process.exit(1)
    })
}

export { insertMachinesViaAPI }
