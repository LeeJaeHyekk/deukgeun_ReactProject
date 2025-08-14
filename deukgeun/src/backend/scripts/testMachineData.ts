import { MachineService } from "../services/machineService"
import { AppDataSource } from "../config/database"

async function testMachineData() {
  console.log("🔍 머신 데이터 테스트 시작...")

  try {
    // 데이터베이스 연결 확인
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
    }

    const machineService = new MachineService()
    const machines = await machineService.getAllMachines()

    console.log("✅ 머신 데이터 조회 성공")
    console.log(`📊 총 머신 수: ${machines.length}`)

    // 첫 5개 머신의 상세 정보 출력
    const sampleMachines = machines.slice(0, 5)
    sampleMachines.forEach((machine, index) => {
      console.log(`\n📋 머신 ${index + 1}:`)
      console.log(`   ID: ${machine.id}`)
      console.log(`   이름 (한글): ${machine.nameKo}`)
      console.log(`   이름 (영문): ${machine.nameEn || "없음"}`)
      console.log(`   이미지 URL: ${machine.imageUrl}`)
      console.log(`   카테고리: ${machine.category}`)
      console.log(`   난이도: ${machine.difficulty || "없음"}`)
    })

    // 이미지 URL 분석
    const imageUrls = machines.map(m => m.imageUrl)
    const uniqueUrls = [...new Set(imageUrls)]
    console.log(`\n🖼️ 고유 이미지 URL 수: ${uniqueUrls.length}`)
    console.log("📸 이미지 URL 목록:")
    uniqueUrls.forEach(url => {
      const count = imageUrls.filter(u => u === url).length
      console.log(`   ${url} (${count}개 머신)`)
    })

    // chest-press.png가 기본값인 머신들 확인
    const defaultImageMachines = machines.filter(
      m => m.imageUrl === "/img/machine/chest-press.png"
    )
    console.log(`\n⚠️ 기본 이미지 사용 머신 수: ${defaultImageMachines.length}`)
    if (defaultImageMachines.length > 0) {
      console.log("기본 이미지 사용 머신들:")
      defaultImageMachines.slice(0, 10).forEach(machine => {
        console.log(
          `   - ${machine.nameKo} (${machine.nameEn || "영문명 없음"})`
        )
      })
    }
  } catch (error) {
    console.error("❌ 머신 데이터 조회 실패:", error)
  } finally {
    // 데이터베이스 연결 종료
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
    }
  }
}

// 스크립트 실행
testMachineData()
