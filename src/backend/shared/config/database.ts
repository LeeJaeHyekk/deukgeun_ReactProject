import { DataSource } from "typeorm"
import { appConfig } from "./env"

// 데이터베이스 설정
export const databaseConfig = {
  type: "postgres" as const,
  host: appConfig.database.host,
  port: appConfig.database.port,
  username: appConfig.database.username,
  password: appConfig.database.password,
  database: appConfig.database.database,
  synchronize: appConfig.database.synchronize,
  logging: appConfig.database.logging,
  entities: ["src/**/*.entity.ts"],
  migrations: ["src/migrations/*.ts"],
  subscribers: ["src/subscribers/*.ts"],
}

// AppDataSource 인스턴스
export const AppDataSource = new DataSource(databaseConfig)

// 데이터베이스 연결 함수
export const connectDatabase = async () => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize()
      console.log("데이터베이스 연결 성공")
    }
    return AppDataSource
  } catch (error) {
    console.error("데이터베이스 연결 실패:", error)
    throw error
  }
}

// 데이터베이스 연결 해제 함수
export const disconnectDatabase = async () => {
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy()
      console.log("데이터베이스 연결 해제")
    }
  } catch (error) {
    console.error("데이터베이스 연결 해제 실패:", error)
    throw error
  }
}
