#!/usr/bin/env node

/**
 * 빌드 후 package.json 변환 스크립트
 * ESM 개발 환경에서 CJS 빌드 결과로 변환
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

function createBuildPackageJson() {
  try {
    console.log('🔄 Creating build package.json...')
    
    // 소스 package.json 읽기
    const sourcePackagePath = path.join(__dirname, '../package.json')
    const buildPackagePath = path.join(__dirname, '../../../dist/backend/package.json')
    
    if (!fs.existsSync(sourcePackagePath)) {
      console.error('❌ Source package.json not found:', sourcePackagePath)
      process.exit(1)
    }
    
    const sourcePackage = JSON.parse(fs.readFileSync(sourcePackagePath, 'utf8'))
    
    // 빌드용 package.json 생성
    const buildPackage = {
      ...sourcePackage,
      type: 'commonjs',
      main: './index.js',
      scripts: {
        start: 'node index.js'
      }
    }
    
    // dist/backend 디렉토리 생성 (존재하지 않는 경우)
    const buildDir = path.dirname(buildPackagePath)
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir, { recursive: true })
      console.log('📁 Created build directory:', buildDir)
    }
    
    // 빌드용 package.json 쓰기
    fs.writeFileSync(buildPackagePath, JSON.stringify(buildPackage, null, 2))
    
    console.log('✅ Build package.json created successfully')
    console.log('📁 Location:', buildPackagePath)
    console.log('📊 Type changed to:', buildPackage.type)
    
  } catch (error) {
    console.error('❌ Failed to create build package.json:', error.message)
    process.exit(1)
  }
}

// 스크립트 실행
createBuildPackageJson()
