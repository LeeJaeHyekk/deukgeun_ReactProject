#!/usr/bin/env node

/**
 * 빌드된 파일 수정 스크립트
 * - __dirname 중복 선언 제거
 * - require 경로 수정
 */

import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

const distPath = path.join(process.cwd(), 'dist')

function findCjsFiles(dir: string): string[] {
  const files: string[] = []
  
  if (!fs.existsSync(dir)) {
    return files
  }
  
  const items = fs.readdirSync(dir)
  
  for (const item of items) {
    const itemPath = path.join(dir, item)
    const stat = fs.statSync(itemPath)
    
    if (stat.isDirectory()) {
      if (!['node_modules', '.git'].includes(item)) {
        files.push(...findCjsFiles(itemPath))
      }
    } else if (item.endsWith('.cjs')) {
      files.push(itemPath)
    }
  }
  
  return files
}

function fixDirnameDeclarations(filePath: string): boolean {
  const content = fs.readFileSync(filePath, 'utf8')
  let modified = content
  
  // const __dirname = (0, pathUtils_1.getDirname)(); 제거
  modified = modified.replace(
    /const __dirname\s*=\s*\([^)]*\)\.getDirname\(\)\s*;?\s*/g,
    '// __dirname is automatically available in CommonJS\n'
  )
  
  // const __dirname = (0, pathUtils_1.getDirname)(); 제거 (다양한 패턴)
  modified = modified.replace(
    /const __dirname\s*=\s*\(0,\s*[^)]*\)\.getDirname\(\)\s*;?\s*/g,
    '// __dirname is automatically available in CommonJS\n'
  )
  
  if (modified !== content) {
    fs.writeFileSync(filePath, modified, 'utf8')
    return true
  }
  
  return false
}

function fixRequirePaths(filePath: string): boolean {
  const content = fs.readFileSync(filePath, 'utf8')
  let modified = content
  const fileDir = path.dirname(filePath)
  
  // require('utils/logger') 같은 경로를 상대 경로로 변환
  modified = modified.replace(/require\(['"]([^'"]+)['"]\)/g, (match, modulePath) => {
    // 이미 상대 경로이거나 node_modules, 절대 경로는 제외
    if (modulePath.startsWith('.') || modulePath.startsWith('/') || modulePath.includes('node_modules') || modulePath.startsWith('@')) {
      return match
    }
    
    // 로컬 모듈 경로 (utils/*, config/* 등)
    const parts = modulePath.split('/')
    let currentDir = fileDir
    
    // 최대 5단계 상위로 검색
    for (let i = 0; i < 5; i++) {
      const testPath = path.join(currentDir, ...parts) + '.cjs'
      if (fs.existsSync(testPath)) {
        const relativePath = path.relative(fileDir, testPath).replace(/\\/g, '/')
        return `require("${relativePath}")`
      }
      
      // 디렉토리인 경우 index.cjs 확인
      const indexPath = path.join(currentDir, ...parts, 'index.cjs')
      if (fs.existsSync(indexPath)) {
        const relativePath = path.relative(fileDir, indexPath).replace(/\\/g, '/')
        return `require("${relativePath}")`
      }
      
      // 상위 디렉토리로 이동
      const parentDir = path.dirname(currentDir)
      if (parentDir === currentDir) break
      currentDir = parentDir
    }
    
    return match
  })
  
  if (modified !== content) {
    fs.writeFileSync(filePath, modified, 'utf8')
    return true
  }
  
  return false
}

function main() {
  console.log('🔧 빌드된 파일 수정 시작...')
  
  const cjsFiles = findCjsFiles(distPath)
  console.log(`📁 발견된 .cjs 파일: ${cjsFiles.length}개`)
  
  let dirnameFixed = 0
  let requireFixed = 0
  
  for (const file of cjsFiles) {
    if (fixDirnameDeclarations(file)) {
      dirnameFixed++
    }
    if (fixRequirePaths(file)) {
      requireFixed++
    }
  }
  
  console.log(`✅ __dirname 선언 제거: ${dirnameFixed}개 파일`)
  console.log(`✅ require 경로 수정: ${requireFixed}개 파일`)
  console.log('✅ 빌드된 파일 수정 완료!')
}

main()

