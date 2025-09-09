// ============================================================================
// 백엔드 서버 시작점 - 타입 오류 수정
// ============================================================================

import appConfig from "./config/env"
import app from "./app"
import { createConnection } from "typeorm"
import databaseConfig from "./config/database"

// 서버 시작 함수
async function startServer() {
  try {
    // 데이터베이스 연결
    await createConnection(databaseConfig)
    console.log("✅ 데이터베이스 연결 성공")

    // 서버 시작
    const port = appConfig.port
    app.listen(port, () => {
      console.log(`🚀 서버가 포트 ${port}에서 실행 중입니다`)
      console.log(`🌍 환경: ${appConfig.environment}`)
      console.log(`📅 시작 시간: ${new Date().toISOString()}`)
    })
  } catch (error) {
    console.error("❌ 서버 시작 실패:", error)
    process.exit(1)
  }
}

// 서버 시작
startServer()

// 프로세스 종료 시 정리 작업
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM 신호 수신, 서버 종료 중...")
  process.exit(0)
})

process.on("SIGINT", () => {
  console.log("🛑 SIGINT 신호 수신, 서버 종료 중...")
  process.exit(0)
})
