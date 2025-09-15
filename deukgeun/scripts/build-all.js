#!/usr/bin/env node

const { execSync } = require('child_process')
const path = require('path')

console.log('🚀 Building full project...')

try {
  const projectRoot = path.join(__dirname, '..')

  // 1. 백엔드 빌드
  console.log('\n📦 Step 1: Building backend...')
  execSync('node scripts/build-backend.js', {
    cwd: projectRoot,
    stdio: 'inherit',
  })

  // 2. 프론트엔드 빌드
  console.log('\n📦 Step 2: Building frontend...')
  execSync('node scripts/build-frontend.js', {
    cwd: projectRoot,
    stdio: 'inherit',
  })

  console.log('\n🎉 Full project build completed successfully!')
  console.log('📁 Backend output: dist/backend/')
  console.log('📁 Frontend output: dist/')
} catch (error) {
  console.error('❌ Full project build failed:', error.message)
  process.exit(1)
}
