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
// 커스텀 에러 핸들러 미들웨어 import
import { errorHandler } from "@backend/middlewares/errorHandler"
// API 라우트 설정 import
import routes from "@backend/routes"
// 쿠키 파싱 미들웨어 import
import cookieParser from "cookie-parser"
// 파일 경로 처리 유틸리티 import
import path from "path"
// 파일 시스템 유틸리티 import
import fs from "fs"
// ESM/CJS 호환을 위한 경로 유틸리티
import { getDirname } from "@backend/utils/pathUtils"

// __dirname 대체 (ESM/CJS 둘 다 호환)
const __dirname = getDirname()
// 환경 설정 import (임시로 주석 처리)
// import { config } from "./config/env"

// 간단한 config 객체 정의
const config = {
  corsOrigin: process.env.CORS_ORIGIN?.split(",").filter(origin => origin.trim() !== "") || [
    // 프로덕션 도메인
    "https://devtrail.net",
    "https://www.devtrail.net",
    "http://43.203.30.167:3000",
    "http://43.203.30.167:5000",
    // 개발 환경 localhost
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

// 환경 변수 검증
if (!config.corsOrigin || config.corsOrigin.length === 0) {
  console.warn('⚠️ CORS_ORIGIN 환경 변수가 설정되지 않았습니다. 기본 localhost 설정을 사용합니다.')
}

// Express 애플리케이션 인스턴스 생성
console.log("=".repeat(60))
console.log("🔧 EXPRESS APP INITIALIZATION DEBUG START")
console.log("=".repeat(60))

const app = express()
console.log("✅ Express app instance created")

// 환경별 CORS 설정
const getCorsOptions = () => {
  console.log("🔄 Step 1: Configuring CORS options...")
  const isDevelopment = config.environment === "development"
  console.log(`   - Environment: ${config.environment}`)
  console.log(`   - Is Development: ${isDevelopment}`)
  
  // 기본 origins (환경 변수가 없을 때 사용)
  const defaultOrigins = [
    // 프로덕션 도메인
    "https://devtrail.net",
    "https://www.devtrail.net",
    "http://43.203.30.167:3000",
    "http://43.203.30.167:5000",
    // 개발 환경 localhost
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5000",
    "http://localhost:5001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5000",
    "http://127.0.0.1:5001",
  ]
  console.log(`   - Default origins: ${defaultOrigins.length} origins`)
  
  // 환경 변수에서 CORS origins 가져오기
  let envOrigins = config.corsOrigin && config.corsOrigin.length > 0 
    ? config.corsOrigin 
    : (isDevelopment ? defaultOrigins : defaultOrigins.filter(origin => !origin.startsWith('http://localhost') && !origin.startsWith('http://127.0.0.1')))
  
  console.log(`   - Environment CORS origins: ${envOrigins.length} origins`)
  console.log(`   - Environment CORS origins: ${envOrigins.join(', ')}`)
  
  // 개발 환경에서는 항상 localhost origins 포함
  if (isDevelopment) {
    envOrigins = [...new Set([...envOrigins, ...defaultOrigins])]
    console.log(`   - Final origins (with defaults): ${envOrigins.length} origins`)
  }
  
  console.log(`🌐 CORS 설정 - 환경: ${config.environment}`)
  console.log(`🌐 허용된 Origins: ${envOrigins.join(', ')}`)
  
  return {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      console.log(`🔍 CORS Check - Origin: ${origin || 'no origin'}`)
      // origin이 없거나 허용된 목록에 있으면 허용
      if (!origin || envOrigins.includes(origin)) {
        console.log(`✅ CORS 허용: ${origin || 'no origin'}`)
        callback(null, true)
      } else {
        console.warn(`❌ CORS 차단: ${origin}`)
        console.warn(`🌐 허용된 Origins: ${envOrigins.join(', ')}`)
        callback(new Error(`Not allowed by CORS in ${config.environment}`), false)
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "X-API-Key",
    ],
    exposedHeaders: ["X-Total-Count"],
    maxAge: 86400, // 24시간
  }
}

const corsOptions = getCorsOptions()
console.log("✅ CORS options configured")

// 보안 미들웨어 설정 - Helmet을 사용한 보안 헤더 추가
console.log("🔄 Step 2: Configuring security middleware (Helmet)...")
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: [
          "'self'", 
          "'unsafe-inline'",
          "https://www.google.com",
          "https://www.gstatic.com"
        ],
        connectSrc: [
          "'self'",
          "https://api.kakao.com",
          "https://maps.googleapis.com",
          "https://www.google.com",
          "https://recaptchaenterprise.googleapis.com",
        ],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  })
)
console.log("✅ Helmet security middleware configured")

// CORS 미들웨어 설정
console.log("🔄 Step 3: Configuring CORS middleware...")
app.use(cors(corsOptions))
console.log("✅ CORS middleware configured")

// HTTP 요청 로깅 미들웨어 설정 (프로덕션에서는 간소화)
console.log("🔄 Step 4: Configuring HTTP logging middleware (Morgan)...")
const morganFormat = config.environment === "production" ? "combined" : "dev"
console.log(`   - Morgan format: ${morganFormat}`)
app.use(morgan(morganFormat))
console.log("✅ Morgan logging middleware configured")

// 쿠키 파싱 미들웨어 설정
console.log("🔄 Step 5: Configuring cookie parser middleware...")
app.use(cookieParser())
console.log("✅ Cookie parser middleware configured")

// 요청 본문 파싱 미들웨어 설정
console.log("🔄 Step 6: Configuring body parsing middleware...")
app.use(express.json({ limit: "10mb" })) // JSON 형식 요청 본문 파싱
app.use(express.urlencoded({ extended: true, limit: "10mb" })) // URL 인코딩된 요청 본문 파싱
console.log("✅ Body parsing middleware configured (JSON: 10MB, URL-encoded: 10MB)")

// 정적 파일 서빙 설정 - 이미지 파일 서빙
console.log("🔄 Step 7: Configuring static file serving...")
try {
  const imgPath = path.join(__dirname, "../../public/img")
  const publicPath = path.join(__dirname, "../../public")

  console.log(`   - Image path: ${imgPath}`)
  console.log(`   - Public path: ${publicPath}`)

  // 경로 존재 여부 확인
  if (fs.existsSync(imgPath)) {
    app.use(
      "/img",
      express.static(imgPath, {
        maxAge: "1d", // 캐시 1일
        etag: true,
      })
    )
    console.log("✅ Image static file serving configured")
  } else {
    console.log("⚠️ Image path does not exist, skipping image static serving")
  }

  if (fs.existsSync(publicPath)) {
    app.use(
      "/public",
      express.static(publicPath, {
        maxAge: "1d", // 캐시 1일
        etag: true,
      })
    )
    console.log("✅ Public static file serving configured")
  } else {
    console.log("⚠️ Public path does not exist, skipping public static serving")
  }
} catch (error) {
  console.log("⚠️ Static file serving configuration failed:", error instanceof Error ? error.message : String(error))
  console.log("⚠️ Continuing without static file serving...")
}

// 루트 엔드포인트 - API 상태 확인용
console.log("🔄 Step 8: Configuring root endpoints...")
app.get("/", (req, res) => {
  console.log(`🔍 Root endpoint accessed - ${req.method} ${req.url}`)
  res.json({
    message: "Deukgeun Backend API",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    environment: config.environment,
    status: "healthy",
  })
})
console.log("✅ Root endpoint configured")

// 헬스체크 엔드포인트
app.get("/health", (req, res) => {
  console.log(`🔍 Health check accessed - ${req.method} ${req.url}`)
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  })
})
console.log("✅ Health check endpoint configured")

// 디버그 엔드포인트 추가
app.get("/debug", (req, res) => {
  console.log(`🔍 Debug endpoint accessed - ${req.method} ${req.url}`)
  res.status(200).json({
    status: "debug",
    timestamp: new Date().toISOString(),
    environment: config.environment,
    process: {
      pid: process.pid,
      version: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
    },
    config: {
      environment: config.environment,
      corsOrigins: config.corsOrigin,
    },
    request: {
      method: req.method,
      url: req.url,
      headers: req.headers,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
    }
  })
})
console.log("✅ Debug endpoint configured")

// API 라우트 설정 - /api 경로로 시작하는 모든 요청을 routes로 라우팅
console.log("🔄 Step 9: Configuring API routes...")
app.use("/api", routes)
console.log("✅ API routes configured")

// 전역 에러 핸들러 미들웨어 - 모든 에러를 처리
console.log("🔄 Step 10: Configuring error handler middleware...")
app.use(errorHandler)
console.log("✅ Error handler middleware configured")

console.log("=".repeat(60))
console.log("✅ EXPRESS APP INITIALIZATION COMPLETE")
console.log("=".repeat(60))

export default app

// 테스트용 createApp 함수
export const createApp = () => {
  return app
}
