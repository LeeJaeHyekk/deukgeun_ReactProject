#!/usr/bin/env node

const express = require('express')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3000

// 정적 파일 서빙
app.use(express.static(path.join(__dirname, '../dist/frontend')))

// SPA를 위한 fallback - 모든 요청을 index.html로 리다이렉트
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/frontend/index.html'))
})

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Frontend server running on http://0.0.0.0:${PORT}`)
})

// 에러 핸들링
process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})
