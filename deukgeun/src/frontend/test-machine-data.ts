import { machineApi } from "@shared/api/machineApi"

async function testMachineData() {
  console.log("🔍 머신 데이터 테스트 시작...")

  try {
    const response = await machineApi.getMachines()
    console.log("✅ 머신 데이터 조회 성공")
    console.log(`📊 총 머신 수: ${response.count}`)

    // 첫 5개 머신의 상세 정보 출력
    const machines = response.machines.slice(0, 5)
    machines.forEach((machine, index) => {
      console.log(`\n📋 머신 ${index + 1}:`)
      console.log(`   ID: ${machine.id}`)
      console.log(`   이름 (한글): ${machine.name_ko}`)
      console.log(`   이름 (영문): ${machine.name_en || "없음"}`)
      console.log(`   이미지 URL: ${machine.image_url}`)
      console.log(`   카테고리: ${machine.category}`)
      console.log(`   난이도: ${machine.difficulty_level || "없음"}`)
    })

    // 이미지 URL 분석
    const imageUrls = response.machines.map(m => m.image_url)
    const uniqueUrls = [...new Set(imageUrls)]
    console.log(`\n🖼️ 고유 이미지 URL 수: ${uniqueUrls.length}`)
    console.log("📸 이미지 URL 목록:")
    uniqueUrls.forEach(url => {
      const count = imageUrls.filter(u => u === url).length
      console.log(`   ${url} (${count}개 머신)`)
    })
  } catch (error) {
    console.error("❌ 머신 데이터 조회 실패:", error)
  }
}

// 스크립트 실행
testMachineData()
