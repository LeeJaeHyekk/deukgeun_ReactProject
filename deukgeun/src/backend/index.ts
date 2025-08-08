import app from "./app"
import { config } from "./config/env"
import { logger } from "./utils/logger"
import { connectDatabase } from "./config/database"
import { getAvailablePort } from "./utils/getAvailablePort"

async function startServer() {
  try {
    await connectDatabase()
    console.log("Database connected successfully")

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
