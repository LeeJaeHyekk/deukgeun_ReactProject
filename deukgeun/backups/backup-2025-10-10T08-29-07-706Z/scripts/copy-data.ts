#!/usr/bin/env node

/**
 * 데이터 폴더 복사 스크립트
 * src/data 폴더의 내용을 dist/data로 복사합니다.
 */

import fs from 'fs'
import path from 'path'

const __dirname = path.dirname(__filename)

function copyDirectory(src: string, dest: string): void {
  // 대상 디렉토리가 없으면 생성
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true })
  }

  const items = fs.readdirSync(src)
  
  for (const item of items) {
    const srcPath = path.join(src, item)
    const destPath = path.join(dest, item)
    
    if (fs.statSync(srcPath).isDirectory()) {
      copyDirectory(srcPath, destPath)
    } else {
      fs.copyFileSync(srcPath, destPath)
    }
  }
}

function main(): void {
  const srcDataDir = path.join(__dirname, '../src/data')
  const distDataDir = path.join(__dirname, '../dist/data')
  
  console.log('📁 데이터 폴더 복사 중...')
  console.log(`소스: ${srcDataDir}`)
  console.log(`대상: ${distDataDir}`)
  
  try {
    if (fs.existsSync(srcDataDir)) {
      copyDirectory(srcDataDir, distDataDir)
      console.log('✅ 데이터 폴더 복사 완료')
    } else {
      console.log('⚠️  소스 데이터 폴더가 존재하지 않습니다:', srcDataDir)
      // 빈 data 폴더라도 생성
      fs.mkdirSync(distDataDir, { recursive: true })
      console.log('📁 빈 data 폴더 생성 완료')
    }
  } catch (error) {
    console.error('❌ 데이터 폴더 복사 실패:', (error as Error).message)
    process.exit(1)
  }
}

// 스크립트 실행
if (require.main === module) {
  main()
}

export { copyDirectory }
