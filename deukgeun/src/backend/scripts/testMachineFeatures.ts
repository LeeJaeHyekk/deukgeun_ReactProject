import { AppDataSource } from "../config/database"
import { Machine } from "../entities/Machine"
import { MachineService } from "../services/machineService"
import axios from "axios"

const BASE_URL = "http://localhost:5000/api"

async function testMachineFeatures() {
  console.log("🧪 Machine 관련 기능 테스트 시작...\n")

  try {
    // 데이터베이스 연결
    await AppDataSource.initialize()
    console.log("✅ 데이터베이스 연결 성공")

    // 1. Machine 서비스 테스트
    console.log("1️⃣ Machine 서비스 테스트")
    await testMachineService()

    // 2. Machine API 테스트
    console.log("\n2️⃣ Machine API 테스트")
    await testMachineAPI()

    // 3. 이미지 매칭 테스트
    console.log("\n3️⃣ 이미지 매칭 테스트")
    await testImageMatching()

    console.log("\n🎉 Machine 관련 기능 테스트 완료!")
  } catch (error) {
    console.error("❌ Machine 테스트 실패:", error)
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
    }
  }
}

// Machine 서비스 테스트
async function testMachineService() {
  const machineService = new MachineService()
  const machineRepo = AppDataSource.getRepository(Machine)

  // 기존 머신 데이터 확인
  const existingMachines = await machineRepo.find()
  console.log(`   - 기존 머신 수: ${existingMachines.length}`)

  if (existingMachines.length > 0) {
    const sampleMachine = existingMachines[0]
    console.log(
      `   - 샘플 머신: ${sampleMachine.name} (${sampleMachine.category})`
    )

    // 머신 상세 정보 조회
    const machineDetail = await machineService.getMachineById(sampleMachine.id)
    console.log(`   - 머신 상세 정보 조회 성공: ${machineDetail?.name}`)
  }

  // 머신 목록 조회
  const machines = await machineService.getAllMachines()
  console.log(`   - 전체 머신 목록 조회: ${machines.length}개`)

  // 카테고리별 머신 수 확인
  const categories = [
    "cardio",
    "strength",
    "flexibility",
    "balance",
    "functional",
    "rehabilitation",
  ]
  for (const category of categories) {
    const categoryMachines = machines.filter(m => m.category === category)
    console.log(`   - ${category} 카테고리: ${categoryMachines.length}개`)
  }
}

// Machine API 테스트
async function testMachineAPI() {
  try {
    // 전체 머신 목록 조회
    const response = await axios.get(`${BASE_URL}/machines`)
    console.log(`   - API 머신 목록 조회: ${response.data.data?.length || 0}개`)

    // 머신 상세 정보 조회 (첫 번째 머신)
    if (response.data.data && response.data.data.length > 0) {
      const firstMachine = response.data.data[0]
      const detailResponse = await axios.get(
        `${BASE_URL}/machines/${firstMachine.id}`
      )
      console.log(`   - API 머신 상세 조회: ${detailResponse.data.data?.name}`)
    }

    console.log("   ✅ Machine API 테스트 성공")
  } catch (error: any) {
    console.log(
      `   ⚠️ Machine API 테스트 실패: ${error.response?.data?.message || error.message}`
    )
  }
}

// 이미지 매칭 테스트
async function testImageMatching() {
  const machineRepo = AppDataSource.getRepository(Machine)
  const machines = await machineRepo.find({ take: 5 })

  console.log("   - 이미지 매칭 테스트:")
  for (const machine of machines) {
    const imageUrl = machine.imageUrl || "기본 이미지"
    console.log(`     ${machine.name}: ${imageUrl}`)
  }
}

// 스크립트 실행
testMachineFeatures()
  .then(() => {
    console.log("✅ Machine 테스트 스크립트 완료")
    process.exit(0)
  })
  .catch(error => {
    console.error("❌ Machine 테스트 스크립트 실패:", error)
    process.exit(1)
  })
