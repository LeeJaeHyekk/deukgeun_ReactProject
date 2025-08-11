import "reflect-metadata"
import { AppDataSource } from "./config/database"
import app from "./app"
import { logger } from "./utils/logger"
import { getAvailablePort } from "./utils/getAvailablePort"
import { config } from "./config/env"
import { autoInitializeScheduler } from "./services/autoUpdateScheduler"

async function startServer() {
  try {
    await AppDataSource.initialize()
    console.log("Database connected successfully")

    // Initialize auto-update scheduler
    autoInitializeScheduler()
    logger.info("Auto-update scheduler initialized")

    const availablePort = await getAvailablePort(config.PORT)

    app.listen(availablePort, () => {
      logger.info(`Server is running on port ${availablePort}`)
    })
  } catch (error) {
    console.error("Database connection failed:", error)
    process.exit(1)
  }
}

startServer()
