#!/usr/bin/env node

// ============================================================================
// 백엔드 서버 시작 스크립트
// ============================================================================

const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

const BACKEND_DIR = path.join(__dirname, '../src/backend')
const PACKAGE_JSON_PATH = path.join(BACKEND_DIR, 'package.json')

// package.json 존재 확인
if (!fs.existsSync(PACKAGE_JSON_PATH)) {
  console.error('❌ Backend package.json not found at:', PACKAGE_JSON_PATH)
  process.exit(1)
}

console.log('🔍 Starting backend server...')
console.log('📁 Backend directory:', BACKEND_DIR)

// 백엔드 서버 시작
const backendProcess = spawn('npm', ['run', 'dev'], {
  cwd: BACKEND_DIR,
  stdio: 'inherit',
  shell: true,
})

backendProcess.on('error', error => {
  console.error('❌ Failed to start backend server:', error)
  process.exit(1)
})

backendProcess.on('exit', code => {
  if (code !== 0) {
    console.error(`❌ Backend server exited with code ${code}`)
    process.exit(code)
  }
  console.log('✅ Backend server stopped')
})

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down backend server...')
  backendProcess.kill('SIGINT')
})

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down backend server...')
  backendProcess.kill('SIGTERM')
})
