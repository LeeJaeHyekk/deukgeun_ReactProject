// Express.js 웹 프레임워크 import
import express from "express"
// CORS (Cross-Origin Resource Sharing) 미들웨어 import
import cors from "cors"
// 보안 헤더 설정 미들웨어 import
import helmet from "helmet"
// HTTP 요청 로깅 미들웨어 import
import morgan from "morgan"
// TypeORM 메타데이터 리플렉션 지원
import "reflect-metadata"
// 쿠키 파싱 미들웨어 import
import cookieParser from "cookie-parser"

// 간단한 config 객체 정의
const config = {
  corsOrigin: process.env.CORS_ORIGIN?.split(",").filter(origin => origin.trim() !== "") || [
    "http://localhost:3000",
    "http://localhost:5173", 
    "http://localhost:5000",
    "http://localhost:5001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5000",
    "http://127.0.0.1:5001",
  ],
  environment: process.env.NODE_ENV || "development"
}

console.log("🔧 Creating Express app...")
const app = express()

// CORS 설정
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "X-API-Key",
  ],
}))

// 보안 미들웨어
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}))

// 로깅 미들웨어
app.use(morgan("dev"))

// 쿠키 파싱 미들웨어
app.use(cookieParser())

// 요청 본문 파싱 미들웨어
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true, limit: "10mb" }))

// 루트 엔드포인트
app.get("/", (req, res) => {
  res.json({
    message: "Deukgeun Backend API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    environment: config.environment,
    status: "healthy",
  })
})

// 헬스체크 엔드포인트
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})

// 기본 API 엔드포인트
app.get("/api/status", (req, res) => {
  res.json({
    message: "API is running",
    timestamp: new Date().toISOString(),
    environment: config.environment,
  })
})

console.log("✅ Express app configured successfully")

export default app
