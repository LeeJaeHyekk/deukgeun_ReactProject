const express = require('express')
const path = require('path')

const app = express()
const PORT = process.env.FRONTEND_PORT || 3000
const DIST_DIR = path.join(__dirname, '..', 'dist')

// 정적 파일 서빙
app.use(express.static(DIST_DIR))

// SPA 라우팅 지원
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`🚀 간단한 프론트엔드 서버가 포트 ${PORT}에서 실행 중입니다.`)
})
