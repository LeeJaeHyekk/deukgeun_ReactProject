import 'reflect-metadata'
import { AppDataSource } from './config/database'
import app from './app'
import { logger } from './utils/logger'
import { getAvailablePort } from './utils/getAvailablePort'
import { config } from './config/env'
import { autoInitializeScheduler } from './services/autoUpdateScheduler'
import { checkBeforeStart, getBackendServerInfo } from './utils/serverStatus'
import { validateEnvironment } from './config/envValidation'

const environment = process.env.NODE_ENV || 'development'

// production 환경에서 환경 변수 검증
if (environment === 'production') {
  console.log('🔍 Validating production environment variables...')
  validateEnvironment()
  console.log('✅ Production environment validation passed')
}

async function startServer() {
  try {
    // 기존 서버 상태 확인
    console.log('🔍 Checking for existing backend server...')
    const existingServer = await getBackendServerInfo()

    if (existingServer) {
      console.log(
        `✅ Backend server is already running on port ${existingServer.port}`
      )
      console.log(`🌐 Server URL: ${existingServer.url}`)
      console.log('📝 No need to start a new server instance')
      return
    }

    // 데이터베이스 연결 시도 (실패해도 서버는 시작)
    try {
      console.log('🔄 Initializing database connection...')
      await AppDataSource.initialize()
      console.log('✅ Database connected successfully')

      // Initialize auto-update scheduler
      autoInitializeScheduler()
      logger.info('Auto-update scheduler initialized')
    } catch (dbError) {
      const errorMessage =
        dbError instanceof Error ? dbError.message : String(dbError)
      console.warn(
        '⚠️ Database connection failed, but server will start anyway:',
        errorMessage
      )
      console.log('🔄 Server will start without database connection')
    }

    // 서버 시작 전 상태 확인
    const { shouldStart, recommendedPort } = await checkBeforeStart()

    if (!shouldStart) {
      console.log('⚠️ Server startup cancelled - existing server detected')
      return
    }

    const port =
      recommendedPort || (await getAvailablePort(config.port || 5000))

    // 프로덕션 환경에서는 0.0.0.0으로 바인딩, 개발 환경에서는 localhost
    const host = environment === 'production' ? '0.0.0.0' : 'localhost'

    app.listen(port, host, () => {
      logger.info(`🚀 Server is running on ${host}:${port}`)

      if (environment === 'development') {
        console.log(
          `🌐 Backend server is accessible at http://localhost:${port}`
        )
        console.log(
          `📊 Database: ${process.env.DB_NAME || 'deukgeun_db'} on ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}`
        )
      } else {
        console.log(`🚀 Production server is running on ${host}:${port}`)
        console.log(
          `📊 Database: ${process.env.DB_NAME || 'deukgeun_db'} on ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}`
        )
        console.log(`🌐 Local access: http://localhost:${port}`)
        console.log(`🌐 External access: http://3.36.230.117:${port}`)
      }
    })
  } catch (error) {
    console.error('❌ Server startup failed:', error)
    process.exit(1)
  }
}

startServer()
