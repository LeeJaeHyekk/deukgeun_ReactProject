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
import { errorHandler } from "./middlewares/errorHandler"
// API 라우트 설정 import
import routes from "./routes"
// 쿠키 파싱 미들웨어 import
import cookieParser from "cookie-parser"
// 파일 경로 처리 유틸리티 import
import path from "path"
// 환경 설정 import
import { config } from "./config/env"

// 환경 변수 검증
if (!config.corsOrigin || config.corsOrigin.length === 0) {
  console.warn('⚠️ CORS_ORIGIN 환경 변수가 설정되지 않았습니다. 기본 localhost 설정을 사용합니다.')
}

// Express 애플리케이션 인스턴스 생성
const app = express()

// 환경별 CORS 설정
const getCorsOptions = () => {
  const isDevelopment = config.environment === "development"
  
  // 기본 localhost origins (환경 변수가 없을 때 사용)
  const defaultLocalhostOrigins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5000",
    "http://localhost:5001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5000",
    "http://127.0.0.1:5001",
  ]
  
  // 환경 변수에서 CORS origins 가져오기
  let envOrigins = config.corsOrigin && config.corsOrigin.length > 0 
    ? config.corsOrigin 
    : (isDevelopment ? defaultLocalhostOrigins : [])
  
  // 개발 환경에서는 항상 localhost origins 포함
  if (isDevelopment) {
    envOrigins = [...new Set([...envOrigins, ...defaultLocalhostOrigins])]
  }
  
  console.log(`🌐 CORS 설정 - 환경: ${config.environment}`)
  console.log(`🌐 허용된 Origins: ${envOrigins.join(', ')}`)
  
  return {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
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

// 보안 미들웨어 설정 - Helmet을 사용한 보안 헤더 추가
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: [
          "'self'",
          "https://api.kakao.com",
          "https://maps.googleapis.com",
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

// CORS 미들웨어 설정
app.use(cors(corsOptions))

// HTTP 요청 로깅 미들웨어 설정 (프로덕션에서는 간소화)
const morganFormat = config.environment === "production" ? "combined" : "dev"
app.use(morgan(morganFormat))

// 쿠키 파싱 미들웨어 설정
app.use(cookieParser())

// 요청 본문 파싱 미들웨어 설정
app.use(express.json({ limit: "10mb" })) // JSON 형식 요청 본문 파싱
app.use(express.urlencoded({ extended: true, limit: "10mb" })) // URL 인코딩된 요청 본문 파싱

// 정적 파일 서빙 설정 - 이미지 파일 서빙
app.use(
  "/img",
  express.static(path.join(__dirname, "../../public/img"), {
    maxAge: "1d", // 캐시 1일
    etag: true,
  })
)

// 공개 파일 서빙 설정 - public 폴더 서빙
app.use(
  "/public",
  express.static(path.join(__dirname, "../../public"), {
    maxAge: "1d", // 캐시 1일
    etag: true,
  })
)

// 루트 엔드포인트 - API 상태 확인용
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

// API 라우트 설정 - /api 경로로 시작하는 모든 요청을 routes로 라우팅
app.use("/api", routes)

// 전역 에러 핸들러 미들웨어 - 모든 에러를 처리
app.use(errorHandler)

export default app

// 테스트용 createApp 함수
export const createApp = () => {
  return app
}
