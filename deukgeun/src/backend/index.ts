import "reflect-metadata"
import { AppDataSource } from "./config/database.js"
import app from "./app.js"
import { logger } from "./utils/logger.js"
import { getAvailablePort } from "./utils/getAvailablePort.js"
import { config } from "./config/env.js"
import { autoInitializeScheduler } from "./services/autoUpdateScheduler.js"

const environment = process.env.NODE_ENV || "development"

async function startServer() {
  try {
    console.log("🔄 Initializing database connection...")
    await AppDataSource.initialize()
    console.log("✅ Database connected successfully")

    // Initialize auto-update scheduler
    autoInitializeScheduler()
    logger.info("Auto-update scheduler initialized")

    const availablePort = await getAvailablePort(config.port || 5000)

    app.listen(availablePort, () => {
      logger.info(`🚀 Server is running on port ${availablePort}`)

      if (environment === "development") {
        console.log(
          `🌐 Backend server is accessible at http://localhost:${availablePort}`
        )
        console.log(
          `📊 Database: ${process.env.DB_NAME || "deukgeun_db"} on ${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "3306"}`
        )
      } else {
        console.log(`🚀 Production server is running on port ${availablePort}`)
        console.log(
          `📊 Database: ${process.env.DB_NAME || "deukgeun_db"} on ${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "3306"}`
        )
      }
    })
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    process.exit(1)
  }
}

startServer()
