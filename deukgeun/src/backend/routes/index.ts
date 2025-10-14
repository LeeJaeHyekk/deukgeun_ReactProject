import { Router } from "express"
import authRoutes from "./auth"
import gymRoutes from "./gym"
import machineRoutes from "./machine"
import postRoutes from "./post"
import commentRoutes from "./comment"
import likeRoutes from "./like"
import levelRoutes from "./level"
import statsRoutes from "./stats"
import schedulerRoutes from "./scheduler"
import workoutRoutes from "./workout"
import logsRoutes from "./logs"
import recaptchaRoutes from "./recaptcha"
import homePageRoutes from "./homePage"
import { AppDataSource, checkDatabaseHealth } from "../config/database"
import { 
  isValidHealthResponse, 
  isValidApiResponse,
  isValidServerStatus 
} from "../utils/typeGuards"

console.log("=".repeat(60))
console.log("🔧 API ROUTES INITIALIZATION DEBUG START")
console.log("=".repeat(60))

const router = Router()
console.log("✅ Router instance created")

// Health check endpoint with database status
console.log("🔄 Step 1: Configuring health check endpoint...")
router.get("/health", async (req, res) => {
  console.log(`🔍 API Health check accessed - ${req.method} ${req.url}`)
  try {
    console.log("🔄 Checking database connection status...")
    const isDatabaseConnected = AppDataSource.isInitialized
    console.log(`   - Database initialized: ${isDatabaseConnected}`)
    
    let databaseHealth = null
    if (isDatabaseConnected) {
      console.log("🔄 Running database health check...")
      databaseHealth = await checkDatabaseHealth()
      console.log(`   - Database health: ${databaseHealth.status}`)
    }
    
    const healthStatus = {
      status: "healthy" as const,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: isDatabaseConnected ? "connected" : "disconnected",
      databaseHealth: databaseHealth,
      environment: process.env.NODE_ENV || "development",
      port: parseInt(process.env.PORT || "5000"),
      memory: process.memoryUsage()
    }
    
    // 타입 가드로 응답 검증
    if (!isValidHealthResponse(healthStatus)) {
      console.error("❌ Health response validation failed")
      res.status(500).json({
        success: false,
        message: "Health check response validation failed",
        timestamp: new Date().toISOString()
      })
      return
    }
    
    console.log("✅ Health check completed successfully")
    res.json(healthStatus)
  } catch (error) {
    console.error("❌ Health check failed:", error)
    const errorResponse = {
      success: false,
      message: "Health check failed",
      error: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }
    
    // 타입 가드로 에러 응답 검증
    if (!isValidApiResponse(errorResponse)) {
      console.error("❌ Error response validation failed")
      res.status(500).json({
        success: false,
        message: "Internal server error",
        timestamp: new Date().toISOString()
      })
      return
    }
    
    res.status(500).json(errorResponse)
  }
})
console.log("✅ Health check endpoint configured")

// API routes (conditional based on database connection)
console.log("🔄 Step 2: Checking database connection for API routes...")
const isDatabaseConnected = AppDataSource.isInitialized
console.log(`   - Database connected: ${isDatabaseConnected}`)

if (isDatabaseConnected) {
  console.log("🔄 Step 3: Configuring full API routes (database connected)...")
  
  // Full API functionality when database is connected
  router.use("/auth", authRoutes)
  console.log("✅ Auth routes configured")
  
  router.use("/gyms", gymRoutes)
  console.log("✅ Gym routes configured")
  
  router.use("/machines", machineRoutes)
  console.log("✅ Machine routes configured")
  
  router.use("/posts", postRoutes)
  console.log("✅ Post routes configured")
  
  router.use("/comments", commentRoutes)
  console.log("✅ Comment routes configured")
  
  router.use("/likes", likeRoutes)
  console.log("✅ Like routes configured")
  
  router.use("/level", levelRoutes)
  console.log("✅ Level routes configured")
  
  router.use("/stats", statsRoutes)
  console.log("✅ Stats routes configured")
  
  router.use("/scheduler", schedulerRoutes)
  console.log("✅ Scheduler routes configured")
  
  router.use("/workouts", workoutRoutes)
  console.log("✅ Workout routes configured")
  
  router.use("/logs", logsRoutes)
  console.log("✅ Logs routes configured")
  
  router.use("/recaptcha", recaptchaRoutes)
  console.log("✅ Recaptcha routes configured")
  
  router.use("/homepage", homePageRoutes)
  console.log("✅ Homepage routes configured")
  
  console.log("✅ All API routes configured (full functionality)")
} else {
  console.log("🔄 Step 3: Configuring limited API routes (database disconnected)...")
  
  // 개발 환경에서는 auth 라우트를 항상 활성화 (데이터베이스 연결 없이도)
  if (process.env.NODE_ENV === "development") {
    console.log("🔧 Development mode: Enabling auth routes without database")
    router.use("/auth", authRoutes)
    console.log("✅ Auth routes configured (development mode)")
  }
  
  // Limited API functionality when database is not connected
  router.get("/status", (req, res) => {
    console.log(`🔍 API Status accessed - ${req.method} ${req.url}`)
    res.json({
      message: "API is running in limited mode",
      database: "disconnected",
      availableEndpoints: ["/health", "/api/status", ...(process.env.NODE_ENV === "development" ? ["/api/auth/*"] : [])],
      timestamp: new Date().toISOString()
    })
  })
  console.log("✅ Limited API status endpoint configured")
  
  console.log("⚠️ API running in limited mode (database not connected)")
}

console.log("🔄 Step 4: Configuring 404 handler...")
router.use("*", (req, res) => {
  console.log(`🔍 404 - API endpoint not found: ${req.method} ${req.url}`)
  res.status(404).json({ 
    message: "API endpoint not found",
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString()
  })
})
console.log("✅ 404 handler configured")

console.log("=".repeat(60))
console.log("✅ API ROUTES INITIALIZATION COMPLETE")
console.log("=".repeat(60))

export default router
