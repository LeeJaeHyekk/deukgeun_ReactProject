import "reflect-metadata"
import express from "express"
import cors from "cors"

const app = express()
const PORT = 5000

// 기본 CORS 설정
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000", "http://localhost:5000"],
  credentials: true
}))

// 기본 미들웨어
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// 기본 라우트
app.get("/", (req, res) => {
  res.json({
    message: "Deukgeun Backend API - Simple Mode",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    environment: "development",
    status: "healthy",
  })
})

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// 서버 시작
app.listen(PORT, () => {
  console.log("=".repeat(60))
  console.log("🚀 DEUKGEUN BACKEND SERVER STARTED (SIMPLE MODE)")
  console.log("=".repeat(60))
  console.log(`🌐 Server URL: http://localhost:${PORT}`)
  console.log(`📊 Environment: development`)
  console.log(`🔧 Port: ${PORT}`)
  console.log("📝 Available endpoints:")
  console.log(`   - GET  /           - Server status`)
  console.log(`   - GET  /health     - Health check`)
  console.log("=".repeat(60))
  console.log("✅ Backend server is ready!")
  console.log("=".repeat(60))
})
