import 'reflect-metadata'
import { AppDataSource } from './config/database'
import app from './app'
import { logger } from './utils/logger'
import { getAvailablePort } from './utils/getAvailablePort'
import { config } from './config/env'
import { autoInitializeScheduler } from './services/autoUpdateScheduler'
import { checkBeforeStart, getBackendServerInfo } from './utils/serverStatus'

const environment = process.env.NODE_ENV || 'development'

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

    console.log('🔄 Initializing database connection...')
    await AppDataSource.initialize()
    console.log('✅ Database connected successfully')

    // Initialize auto-update scheduler
    autoInitializeScheduler()
    logger.info('Auto-update scheduler initialized')

    // 서버 시작 전 상태 확인
    const { shouldStart, recommendedPort } = await checkBeforeStart()

    if (!shouldStart) {
      console.log('⚠️ Server startup cancelled - existing server detected')
      return
    }

    const port =
      recommendedPort || (await getAvailablePort(config.port || 5000))

    app.listen(port, () => {
      logger.info(`🚀 Server is running on port ${port}`)

      if (environment === 'development') {
        console.log(
          `🌐 Backend server is accessible at http://localhost:${port}`
        )
        console.log(
          `📊 Database: ${process.env.DB_NAME || 'deukgeun_db'} on ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}`
        )
      } else {
        console.log(`🚀 Production server is running on port ${port}`)
        console.log(
          `📊 Database: ${process.env.DB_NAME || 'deukgeun_db'} on ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || '3306'}`
        )
      }
    })
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    process.exit(1)
  }
}

startServer()
