#!/usr/bin/env node

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

console.log('🔨 Building backend...')

try {
  const projectRoot = path.join(__dirname, '..')
  const backendDir = path.join(projectRoot, 'src/backend')
  const distPath = path.join(projectRoot, 'dist/backend')

  // dist 디렉토리 생성
  if (!fs.existsSync(path.join(projectRoot, 'dist'))) {
    fs.mkdirSync(path.join(projectRoot, 'dist'), { recursive: true })
  }

  // 백엔드 의존성 확인 및 설치 (필요한 경우에만)
  const nodeModulesPath = path.join(backendDir, 'node_modules')
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('📦 Installing backend dependencies...')
    execSync('npm install', {
      cwd: backendDir,
      stdio: 'inherit',
    })
  } else {
    console.log('📦 Backend dependencies already installed, skipping...')
  }

  // 기존 빌드 결과 정리
  if (fs.existsSync(distPath)) {
    console.log('🧹 Cleaning previous build...')
    fs.rmSync(distPath, { recursive: true, force: true })
  }

  // 백엔드 빌드
  console.log('🏗️  Building backend TypeScript...')
  execSync('npx tsc -p tsconfig.json', {
    cwd: backendDir,
    stdio: 'inherit',
  })

  // 빌드 결과 확인
  if (fs.existsSync(distPath)) {
    console.log('✅ Backend build completed successfully!')
    console.log(`📁 Build output: ${distPath}`)

    // 빌드 통계 출력
    const buildStats = getBuildStats(distPath)
    console.log(`📊 Build stats: ${buildStats.files} files, ${buildStats.size}`)
  } else {
    throw new Error('Backend build failed - dist directory not found')
  }
} catch (error) {
  console.error('❌ Backend build failed:', error.message)
  process.exit(1)
}

function getBuildStats(dir) {
  let files = 0
  let totalSize = 0

  function countFiles(currentPath) {
    const items = fs.readdirSync(currentPath)
    for (const item of items) {
      const itemPath = path.join(currentPath, item)
      const stat = fs.statSync(itemPath)

      if (stat.isDirectory()) {
        countFiles(itemPath)
      } else {
        files++
        totalSize += stat.size
      }
    }
  }

  countFiles(dir)

  const sizeInMB = (totalSize / 1024 / 1024).toFixed(2)
  return { files, size: `${sizeInMB}MB` }
}
