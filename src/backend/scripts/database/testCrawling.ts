import { AppDataSource, connectDatabase } from "../../shared/database"
import { Gym } from "../../domains/gym/entities/Gym"
import { Machine } from "../../domains/machine/entities/Machine"
import { logger } from "../../shared/utils/logger"
import { appConfig } from "../../shared/config/app"

async function testCrawling() {
  console.log("🧪 Testing Enhanced Crawling Service...\n")

  // API 키 확인
  console.log("🔑 API Keys Check:")
  console.log(
    `- Kakao API Key: ${appConfig.apiKeys.kakao ? "✅ Set" : "❌ Not set"}`
  )
  console.log(
    `- Google Places API Key: ${appConfig.apiKeys.googlePlaces ? "✅ Set" : "❌ Not set"}`
  )
  console.log(
    `- Seoul OpenAPI Key: ${appConfig.apiKeys.seoulOpenApi ? "✅ Set" : "❌ Not set"}`
  )
  console.log()

  try {
    console.log("📡 Connecting to database...")
    const connection = await connectDatabase()
    console.log("✅ Database connected successfully")

    const gymRepo = connection.getRepository(Gym)

    // 헬스장 개수 확인
    const gymCount = await gymRepo.count()
    console.log(`📊 Total gyms in database: ${gymCount}`)

    if (gymCount === 0) {
      console.log(
        "⚠️ No gyms found in database. Please add some gym data first."
      )
      await connection.close()
      return
    }

    // 첫 번째 헬스장으로 테스트
    const testGym = await gymRepo.findOne({ where: {} })
    if (testGym) {
      console.log(`\n🔍 Testing with gym: ${testGym.name}`)
      console.log(`📍 Current address: ${testGym.address}`)
      console.log(`📞 Current phone: ${testGym.phone}`)
      console.log(
        `🌍 Current coordinates: ${testGym.latitude}, ${testGym.longitude}`
      )
    }

    console.log("\n🚀 Starting enhanced crawling test...")
    console.log("⚠️ This will update ALL gyms in the database!")
    console.log("Press Ctrl+C to cancel, or wait 5 seconds to continue...")

    // 5초 대기
    await new Promise(resolve => setTimeout(resolve, 5000))

    // 향상된 크롤링 실행
    // await updateGymDetailsWithEnhancedSources(gymRepo)
    console.log("Enhanced crawling function temporarily disabled")

    console.log("\n✅ Enhanced crawling test completed!")
    await connection.close()
  } catch (error) {
    console.error("❌ Test failed:", error)

    if (error instanceof Error) {
      if (error.message.includes("ECONNREFUSED")) {
        console.log(
          "\n💡 Database connection failed. Make sure MySQL is running."
        )
      } else if (error.message.includes("ER_ACCESS_DENIED_ERROR")) {
        console.log(
          "\n💡 Database access denied. Check your database credentials."
        )
      } else if (error.message.includes("ER_BAD_DB_ERROR")) {
        console.log("\n💡 Database not found. Make sure the database exists.")
      }
    }
  }
}

// 메인 실행
testCrawling().catch(console.error)
