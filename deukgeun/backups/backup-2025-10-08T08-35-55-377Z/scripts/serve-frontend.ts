import express from 'express'
import * as path from 'path'
// @ts-ignore
import compression from 'compression'
// @ts-ignore
import helmet from 'helmet'
// @ts-ignore
import rateLimit from 'express-rate-limit'

const app = express()
const PORT = process.env.FRONTEND_PORT || 3000
const DIST_DIR = path.join(__dirname, '..', 'dist')

// 보안 미들웨어
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.yourdomain.com"]
    }
  }
}) as any)

// 압축 미들웨어
app.use(compression() as any)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15분
  max: 100 // 최대 100 요청
})
app.use(limiter as any)

// 정적 파일 서빙
app.use(express.static(DIST_DIR, {
  maxAge: '1y',
  etag: true,
  lastModified: true
}))

// SPA 라우팅 지원
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`🚀 프론트엔드 서버가 포트 ${PORT}에서 실행 중입니다.`)
})
