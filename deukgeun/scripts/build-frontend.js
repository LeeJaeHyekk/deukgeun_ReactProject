#!/usr/bin/env node

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

console.log('🔨 Building frontend...')

try {
  const projectRoot = path.join(__dirname, '..')

  // 프론트엔드 의존성 설치
  console.log('📦 Installing frontend dependencies...')
  execSync('npm install', {
    cwd: projectRoot,
    stdio: 'inherit',
  })

  // 프론트엔드 빌드
  console.log('🏗️  Building frontend with Vite...')
  execSync('npm run build', {
    cwd: projectRoot,
    stdio: 'inherit',
  })

  // 빌드 결과 확인
  const distPath = path.join(projectRoot, 'dist')
  if (fs.existsSync(distPath)) {
    console.log('✅ Frontend build completed successfully!')
    console.log(`📁 Build output: ${distPath}`)
  } else {
    throw new Error('Frontend build failed - dist directory not found')
  }
} catch (error) {
  console.error('❌ Frontend build failed:', error.message)
  process.exit(1)
}
