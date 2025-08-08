import app from "./app"
import { createConnection } from "typeorm"
import { autoInitializeScheduler } from "./services/autoUpdateScheduler"

const PORT = process.env.PORT || 5000

createConnection()
  .then(() => {
    console.log("✅ Database connected")
    autoInitializeScheduler() // Initialize auto-update scheduler
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    })
  })
  .catch(err => {
    console.error("❌ Database connection failed", err)
  })
