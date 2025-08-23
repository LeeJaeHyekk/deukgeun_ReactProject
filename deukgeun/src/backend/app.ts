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

// Express 애플리케이션 인스턴스 생성
const app = express()

// 보안 미들웨어 설정 - Helmet을 사용한 보안 헤더 추가
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // 크로스 오리진 리소스 정책 설정
  })
)

// CORS 미들웨어 설정 - 프론트엔드와의 통신 허용
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"], // 허용할 오리진 설정 (배열로 여러 오리진 지원)
    credentials: true, // 쿠키/인증 정보 전달 허용
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"], // 허용할 HTTP 메서드
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"], // 허용할 헤더
  })
)

// HTTP 요청 로깅 미들웨어 설정
app.use(morgan("combined"))

// 쿠키 파싱 미들웨어 설정
app.use(cookieParser())

// 요청 본문 파싱 미들웨어 설정
app.use(express.json()) // JSON 형식 요청 본문 파싱
app.use(express.urlencoded({ extended: true })) // URL 인코딩된 요청 본문 파싱

// 정적 파일 서빙 설정 - 이미지 파일 서빙 (CORS는 메인 미들웨어에서 처리)
app.use(
  "/img",
  express.static(path.join(__dirname, "../../public/img")) // 이미지 파일 정적 서빙
)

// 공개 파일 서빙 설정 - public 폴더 서빙 (CORS는 메인 미들웨어에서 처리)
app.use(
  "/public",
  express.static(path.join(__dirname, "../../public")) // public 폴더 정적 서빙
)

// 루트 엔드포인트 - API 상태 확인용
app.get("/", (req, res) => {
  res.json({
    message: "Deukgeun Backend API", // API 이름
    version: "1.0.0", // API 버전
    timestamp: new Date().toISOString(), // 현재 시간
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
