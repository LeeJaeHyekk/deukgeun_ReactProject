#!/usr/bin/env node

const http = require('http')
const fs = require('fs')
const path = require('path')
const url = require('url')

const PORT = process.env.PORT || 3000
const FRONTEND_DIR = path.join(__dirname, '../dist/frontend')

// MIME 타입 매핑
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm',
}

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase()
  return mimeTypes[ext] || 'application/octet-stream'
}

function serveFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/html' })
      res.end('<h1>404 Not Found</h1>')
      return
    }

    const contentType = getContentType(filePath)
    res.writeHead(200, { 'Content-Type': contentType })
    res.end(data)
  })
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true)
  let pathname = parsedUrl.pathname

  // 기본 경로를 index.html로 설정
  if (pathname === '/') {
    pathname = '/index.html'
  }

  const filePath = path.join(FRONTEND_DIR, pathname)

  // 파일이 존재하는지 확인
  fs.access(filePath, fs.constants.F_OK, err => {
    if (err) {
      // 파일이 없으면 index.html로 fallback (SPA 지원)
      const indexPath = path.join(FRONTEND_DIR, 'index.html')
      serveFile(indexPath, res)
    } else {
      serveFile(filePath, res)
    }
  })
})

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Frontend server running on http://0.0.0.0:${PORT}`)
  console.log(`📁 Serving files from: ${FRONTEND_DIR}`)
})

// 에러 핸들링
server.on('error', err => {
  console.error('Server error:', err)
  process.exit(1)
})

process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  process.exit(1)
})
