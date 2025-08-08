import { connectDatabase } from "../config/database"
import { updateGymDetailsWithEnhancedSources } from "../services/enhancedCrawlerService"
import { Gym } from "../entities/Gym"

async function runEnhancedCrawler() {
  try {
    console.log("🚀 향상된 크롤링 시작")
    console.log("📡 데이터베이스 연결 중...")

    const connection = await connectDatabase()
    console.log("✅ 데이터베이스 연결 성공")

    const gymRepo = connection.getRepository(Gym)

    console.log("🔧 향상된 멀티소스 크롤링 실행 중...")
    await updateGymDetailsWithEnhancedSources(gymRepo)

    console.log("✅ 향상된 크롤링 완료")
    await connection.close()

    process.exit(0)
  } catch (error) {
    console.error("❌ 향상된 크롤링 중 오류 발생:", error)
    process.exit(1)
  }
}

runEnhancedCrawler()
