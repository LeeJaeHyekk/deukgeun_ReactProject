import axios from "axios"

const BASE_URL = "http://localhost:5000/api"

async function testScheduler() {
  console.log("🧪 Testing Auto-Update Scheduler...\n")

  try {
    // 1. 스케줄러 상태 확인
    console.log("1. 📊 Checking scheduler status...")
    const statusResponse = await axios.get(`${BASE_URL}/scheduler/status`)
    console.log("✅ Status:", statusResponse.data)
    console.log()

    // 2. 수동 업데이트 실행 (enhanced)
    console.log("2. 🔄 Running manual enhanced update...")
    const manualResponse = await axios.post(
      `${BASE_URL}/scheduler/update/enhanced`
    )
    console.log("✅ Manual update result:", manualResponse.data)
    console.log()

    // 3. 설정 업데이트 테스트
    console.log("3. ⚙️ Testing configuration update...")
    const configResponse = await axios.put(`${BASE_URL}/scheduler/config`, {
      hour: 8,
      minute: 30,
      updateType: "enhanced",
    })
    console.log("✅ Config update result:", configResponse.data)
    console.log()

    // 4. 업데이트된 상태 확인
    console.log("4. 📊 Checking updated status...")
    const updatedStatusResponse = await axios.get(
      `${BASE_URL}/scheduler/status`
    )
    console.log("✅ Updated status:", updatedStatusResponse.data)
    console.log()

    console.log("🎉 All scheduler tests completed successfully!")
  } catch (error: any) {
    console.error("❌ Test failed:", error.response?.data || error.message)

    if (error.code === "ECONNREFUSED") {
      console.log("\n💡 Make sure the backend server is running:")
      console.log("   npm run backend:dev")
    }
  }
}

// 서버가 시작될 때까지 대기하는 함수
async function waitForServer(maxAttempts = 30) {
  console.log("⏳ Waiting for server to start...")

  for (let i = 0; i < maxAttempts; i++) {
    try {
      await axios.get(`${BASE_URL}/health`)
      console.log("✅ Server is ready!")
      return true
    } catch (error) {
      if (i < maxAttempts - 1) {
        console.log(
          `⏳ Attempt ${i + 1}/${maxAttempts} - Server not ready yet...`
        )
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    }
  }

  console.log("❌ Server did not start within expected time")
  return false
}

// 메인 실행 함수
async function main() {
  const serverReady = await waitForServer()

  if (serverReady) {
    await testScheduler()
  } else {
    console.log("\n💡 To start the server:")
    console.log("   cd src/backend && npm run dev")
  }
}

main().catch(console.error)
