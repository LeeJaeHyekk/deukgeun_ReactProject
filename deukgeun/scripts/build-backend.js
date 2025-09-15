#!/usr/bin/env node

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

console.log('🔨 Building backend...')

try {
  // 백엔드 디렉토리로 이동
  const backendDir = path.join(__dirname, '../src/backend')

  // 백엔드 의존성 설치
  console.log('📦 Installing backend dependencies...')
  execSync('npm install', {
    cwd: backendDir,
    stdio: 'inherit',
  })

  // 백엔드 빌드
  console.log('🏗️  Building backend TypeScript...')
  execSync('npx tsc -p tsconfig.json', {
    cwd: backendDir,
    stdio: 'inherit',
  })

  // 빌드 결과 확인
  const distPath = path.join(__dirname, '../dist/backend')
  if (fs.existsSync(distPath)) {
    console.log('✅ Backend build completed successfully!')
    console.log(`📁 Build output: ${distPath}`)
  } else {
    throw new Error('Backend build failed - dist directory not found')
  }
} catch (error) {
  console.error('❌ Backend build failed:', error.message)
  process.exit(1)
}
