import { config } from "dotenv"
import { DataSource } from "typeorm"
import { databaseConfig } from "../config/database"

// 환경 변수 로드
config()

// Jest 전역 타입 선언
declare global {
  var __TEST_DB__: DataSource
}

// 테스트 데이터베이스 연결
let testDataSource: DataSource

// Jest 전역 함수들
declare const beforeAll: (fn: () => Promise<void>) => void
declare const afterAll: (fn: () => Promise<void>) => void
declare const beforeEach: (fn: () => Promise<void>) => void
declare const afterEach: (fn: () => Promise<void>) => void

beforeAll(async () => {
  // 테스트용 데이터베이스 설정
  testDataSource = new DataSource({
    ...databaseConfig,
    database: "test_db",
    synchronize: true,
    dropSchema: true,
    logging: false,
  })

  await testDataSource.initialize()

  // 전역 변수에 저장
  global.__TEST_DB__ = testDataSource
})

afterAll(async () => {
  if (testDataSource && testDataSource.isInitialized) {
    await testDataSource.destroy()
  }
})

beforeEach(async () => {
  // 각 테스트 전에 데이터베이스 정리
  if (testDataSource && testDataSource.isInitialized) {
    const entities = testDataSource.entityMetadatas
    for (const entity of entities) {
      const repository = testDataSource.getRepository(entity.name)
      await repository.clear()
    }
  }
})

afterEach(async () => {
  // 각 테스트 후 정리 작업
})
