import { AppDataSource } from '@backend/config/databaseConfig'
import { DataSource } from "typeorm"

async function syncDatabase() {
  console.log("🔄 데이터베이스 동기화 시작...")

  try {
    // 데이터베이스 연결
    await AppDataSource.initialize()
    console.log("✅ 데이터베이스 연결 성공")

    // 외래키 제약조건 비활성화
    await disableForeignKeyChecks(AppDataSource)
    console.log("✅ 외래키 제약조건 비활성화")

    // 스키마 동기화
    await AppDataSource.synchronize(true)
    console.log("✅ 스키마 동기화 완료")

    // 외래키 제약조건 재활성화
    await enableForeignKeyChecks(AppDataSource)
    console.log("✅ 외래키 제약조건 재활성화")

    console.log("🎉 데이터베이스 동기화 완료!")
  } catch (error) {
    console.error("❌ 데이터베이스 동기화 실패:", error)
    throw error
  } finally {
    // 데이터베이스 연결 종료
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
    }
  }
}

// 외래키 제약조건 비활성화
async function disableForeignKeyChecks(dataSource: DataSource) {
  await dataSource.query("SET FOREIGN_KEY_CHECKS = 0")
}

// 외래키 제약조건 재활성화
async function enableForeignKeyChecks(dataSource: DataSource) {
  await dataSource.query("SET FOREIGN_KEY_CHECKS = 1")
}

// 스크립트 실행
syncDatabase()
  .then(() => {
    console.log("✅ 동기화 스크립트 완료")
    process.exit(0)
  })
  .catch(error => {
    console.error("❌ 동기화 스크립트 실패:", error)
    process.exit(1)
  })
