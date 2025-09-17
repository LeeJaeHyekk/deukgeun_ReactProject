#!/usr/bin/env node

const { execSync } = require('child_process')
const path = require('path')
const fs = require('fs')

console.log('🔨 Building frontend...')

try {
  const projectRoot = path.join(__dirname, '..')
  const distPath = path.join(projectRoot, 'dist/frontend')

  // dist 디렉토리 생성
  if (!fs.existsSync(path.join(projectRoot, 'dist'))) {
    fs.mkdirSync(path.join(projectRoot, 'dist'), { recursive: true })
  }

  // 프론트엔드 의존성 확인 및 설치 (필요한 경우에만)
  const nodeModulesPath = path.join(projectRoot, 'node_modules')
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('📦 Installing frontend dependencies...')
    execSync('npm install', {
      cwd: projectRoot,
      stdio: 'inherit',
    })
  } else {
    console.log('📦 Frontend dependencies already installed, skipping...')
  }

  // 기존 빌드 결과 정리
  if (fs.existsSync(distPath)) {
    console.log('🧹 Cleaning previous build...')
    fs.rmSync(distPath, { recursive: true, force: true })
  }

  // TypeScript 타입 체크
  console.log('🔍 Running TypeScript type check...')
  execSync('npx tsc --noEmit', {
    cwd: projectRoot,
    stdio: 'inherit',
  })

  // 프론트엔드 빌드
  console.log('🏗️  Building frontend with Vite...')

  // 환경 변수 확인
  const nodeEnv = process.env.NODE_ENV || 'development'
  console.log(`🔧 Building for environment: ${nodeEnv}`)

  // production 환경에서는 production 모드로 빌드
  const buildCommand =
    nodeEnv === 'production' ? 'npm run build:production' : 'npm run build'
  execSync(buildCommand, {
    cwd: projectRoot,
    stdio: 'inherit',
  })

  // 빌드 결과 확인
  if (fs.existsSync(distPath)) {
    console.log('✅ Frontend build completed successfully!')
    console.log(`📁 Build output: ${distPath}`)

    // 빌드 통계 출력
    const buildStats = getBuildStats(distPath)
    console.log(`📊 Build stats: ${buildStats.files} files, ${buildStats.size}`)

    // 주요 파일들 크기 출력
    const mainFiles = ['index.html', 'js', 'css', 'img', 'media', 'fonts']
    console.log('📋 Main build files:')
    mainFiles.forEach(file => {
      const filePath = path.join(distPath, file)
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath)
        if (stat.isDirectory()) {
          const dirStats = getBuildStats(filePath)
          console.log(
            `  📁 ${file}/: ${dirStats.files} files, ${dirStats.size}`
          )
        } else {
          const sizeInKB = (stat.size / 1024).toFixed(2)
          console.log(`  📄 ${file}: ${sizeInKB}KB`)
        }
      }
    })
  } else {
    throw new Error('Frontend build failed - dist directory not found')
  }
} catch (error) {
  console.error('❌ Frontend build failed:', error.message)
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
